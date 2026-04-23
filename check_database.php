<?php
// check_database.php - Verificar dados no banco

header('Content-Type: text/html; charset=UTF-8');
require_once 'srv/config.php';

echo "<h1>Verificação do Banco de Dados</h1>";
echo "<hr>";

try {
    // Listar todas as tabelas
    echo "<h2>1. Tabelas no banco</h2>";
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<ul>";
    foreach ($tables as $table) {
        echo "<li>$table</li>";
    }
    echo "</ul>";
    
    echo "<hr>";
    
    // Contar registros em cada tabela
    echo "<h2>2. Contagem de registros</h2>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Tabela</th><th>Registros</th></tr>";
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
        $count = $stmt->fetch()['count'];
        echo "<tr><td>$table</td><td>$count</td></tr>";
    }
    echo "</table>";
    
    echo "<hr>";
    
    // Verificar especificamente bitdefender_licenses
    echo "<h2>3. Dados da tabela bitdefender_licenses</h2>";
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM bitdefender_licenses");
    $count = $stmt->fetch()['count'];
    
    if ($count > 0) {
        echo "<p>✅ Encontrados <strong>$count</strong> registros!</p>";
        
        // Mostrar primeiros 5 registros
        $stmt = $pdo->query("SELECT id, company, email, total_licenses, expiration_date FROM bitdefender_licenses LIMIT 5");
        $records = $stmt->fetchAll();
        
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Empresa</th><th>Email</th><th>Licenças</th><th>Vencimento</th></tr>";
        foreach ($records as $record) {
            echo "<tr>";
            echo "<td>" . $record['id'] . "</td>";
            echo "<td>" . $record['company'] . "</td>";
            echo "<td>" . $record['email'] . "</td>";
            echo "<td>" . $record['total_licenses'] . "</td>";
            echo "<td>" . $record['expiration_date'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>❌ Tabela bitdefender_licenses está VAZIA!</p>";
        echo "<p><strong>AÇÃO NECESSÁRIA:</strong> Importar o backup SQL novamente!</p>";
    }
    
    echo "<hr>";
    
    // Verificar outras tabelas importantes
    $importantTables = ['fortigate_devices', 'o365_clients', 'gmail_clients', 'users'];
    
    echo "<h2>4. Tabelas importantes</h2>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Tabela</th><th>Registros</th><th>Status</th></tr>";
    
    foreach ($importantTables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM `$table`");
            $count = $stmt->fetch()['count'];
            $status = $count > 0 ? "✅ OK" : "⚠️ Vazia";
            echo "<tr><td>$table</td><td>$count</td><td>$status</td></tr>";
        } catch (Exception $e) {
            echo "<tr><td>$table</td><td>-</td><td>❌ Não existe</td></tr>";
        }
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
}

echo "<hr>";
echo "<h2>✅ Verificação completa!</h2>";
