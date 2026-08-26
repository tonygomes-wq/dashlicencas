<?php
/**
 * Script de teste para verificar banco de dados
 */

require_once 'srv/config.php';

echo "<h1>🔍 Teste de Banco de Dados - Sistema de Relatórios</h1>";

try {
    echo "<h2>✅ Conexão com Banco</h2>";
    echo "<p>Conectado com sucesso!</p>";
    
    // Teste 1: Verificar se tabela bitdefender_licenses existe
    echo "<h2>1. Verificando tabela bitdefender_licenses</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'bitdefender_licenses'");
    $exists = $stmt->fetch();
    if ($exists) {
        echo "<p>✅ Tabela existe</p>";
        
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_licenses");
        $count = $stmt->fetch();
        echo "<p>Total de registros: {$count['total']}</p>";
    } else {
        echo "<p>❌ Tabela NÃO existe</p>";
    }
    
    // Teste 2: Verificar se tabela bitdefender_reports existe
    echo "<h2>2. Verificando tabela bitdefender_reports</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'bitdefender_reports'");
    $exists = $stmt->fetch();
    if ($exists) {
        echo "<p>✅ Tabela existe</p>";
        
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_reports");
        $count = $stmt->fetch();
        echo "<p>Total de relatórios: {$count['total']}</p>";
        
        // Mostrar estrutura
        $stmt = $pdo->query("DESCRIBE bitdefender_reports");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<h3>Colunas:</h3><ul>";
        foreach ($columns as $col) {
            echo "<li>{$col['Field']} ({$col['Type']})</li>";
        }
        echo "</ul>";
    } else {
        echo "<p>❌ Tabela NÃO existe - VOCÊ PRECISA EXECUTAR O SQL!</p>";
        echo "<p><strong>Execute o arquivo:</strong> docs/db_bitdefender_reports.sql</p>";
    }
    
    // Teste 3: Verificar se tabela bitdefender_report_schedules existe
    echo "<h2>3. Verificando tabela bitdefender_report_schedules</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'bitdefender_report_schedules'");
    $exists = $stmt->fetch();
    if ($exists) {
        echo "<p>✅ Tabela existe</p>";
        
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_report_schedules");
        $count = $stmt->fetch();
        echo "<p>Total de agendamentos: {$count['total']}</p>";
    } else {
        echo "<p>❌ Tabela NÃO existe</p>";
    }
    
    // Teste 4: Verificar se tabela bitdefender_report_downloads existe
    echo "<h2>4. Verificando tabela bitdefender_report_downloads</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'bitdefender_report_downloads'");
    $exists = $stmt->fetch();
    if ($exists) {
        echo "<p>✅ Tabela existe</p>";
    } else {
        echo "<p>❌ Tabela NÃO existe</p>";
    }
    
    // Teste 5: Verificar se tabela users existe
    echo "<h2>5. Verificando tabela users</h2>";
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $exists = $stmt->fetch();
    if ($exists) {
        echo "<p>✅ Tabela existe</p>";
        
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
        $count = $stmt->fetch();
        echo "<p>Total de usuários: {$count['total']}</p>";
    } else {
        echo "<p>⚠️ Tabela users NÃO existe (não é crítico)</p>";
    }
    
    // Resumo
    echo "<hr>";
    echo "<h2>📊 Resumo</h2>";
    
    $tables = [
        'bitdefender_licenses',
        'bitdefender_reports',
        'bitdefender_report_schedules',
        'bitdefender_report_downloads'
    ];
    
    $allExist = true;
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->fetch();
        if (!$exists) {
            $allExist = false;
            break;
        }
    }
    
    if ($allExist) {
        echo "<p style='color: green; font-size: 18px; font-weight: bold;'>✅ TODAS AS TABELAS EXISTEM - Sistema pronto!</p>";
    } else {
        echo "<p style='color: red; font-size: 18px; font-weight: bold;'>❌ FALTAM TABELAS - Execute o SQL primeiro!</p>";
        echo "<p><strong>Passos:</strong></p>";
        echo "<ol>";
        echo "<li>Abra o phpMyAdmin</li>";
        echo "<li>Selecione seu banco de dados</li>";
        echo "<li>Vá em 'SQL'</li>";
        echo "<li>Copie e cole o conteúdo de: <code>docs/db_bitdefender_reports.sql</code></li>";
        echo "<li>Clique em 'Executar'</li>";
        echo "<li>Atualize esta página</li>";
        echo "</ol>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ ERRO: {$e->getMessage()}</p>";
    echo "<pre>{$e->getTraceAsString()}</pre>";
}

echo "<hr>";
echo "<p><a href='test_reports_api.php'>→ Próximo teste: API de Relatórios</a></p>";
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 1000px;
    margin: 50px auto;
    padding: 20px;
    background: #f5f5f5;
}
h1 {
    color: #333;
    border-bottom: 3px solid #4CAF50;
    padding-bottom: 10px;
}
h2 {
    color: #555;
    margin-top: 30px;
}
p {
    line-height: 1.6;
}
code {
    background: #eee;
    padding: 2px 6px;
    border-radius: 3px;
}
</style>
