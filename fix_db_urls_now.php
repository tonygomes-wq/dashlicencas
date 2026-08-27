<?php
/**
 * CORREÇÃO EMERGENCIAL DE URLs
 * Execute uma vez para corrigir as URLs no banco
 */

// Conexão com banco - AJUSTE AS CREDENCIAIS
$host = 'localhost';
$dbname = 'dashlicencas';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>🔧 Correção de URLs</h1>";
    
    // 1. Ver URLs atuais
    echo "<h2>1. URLs Antes:</h2>";
    $stmt = $pdo->query("SELECT id, company, client_access_url FROM bitdefender_licenses WHERE client_api_key IS NOT NULL");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<ul>";
    foreach ($clients as $c) {
        echo "<li><strong>{$c['company']}:</strong> <code>{$c['client_access_url']}</code></li>";
    }
    echo "</ul>";
    
    // 2. Aplicar correções
    echo "<h2>2. Aplicando Correções...</h2>";
    
    $pdo->exec("UPDATE bitdefender_licenses SET client_access_url = REPLACE(client_access_url, '/api/api', '/api') WHERE client_access_url LIKE '%/api/api%'");
    $pdo->exec("UPDATE bitdefender_licenses SET client_access_url = TRIM(TRAILING '/api' FROM client_access_url) WHERE client_access_url LIKE '%/api'");
    $pdo->exec("UPDATE bitdefender_licenses SET client_access_url = TRIM(TRAILING '/' FROM client_access_url) WHERE client_access_url LIKE '%/'");
    
    echo "<p style='color: green;'>✅ Correções aplicadas!</p>";
    
    // 3. Ver URLs depois
    echo "<h2>3. URLs Depois:</h2>";
    $stmt = $pdo->query("SELECT id, company, client_access_url FROM bitdefender_licenses WHERE client_api_key IS NOT NULL");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<ul>";
    foreach ($clients as $c) {
        echo "<li><strong>{$c['company']}:</strong> <code>{$c['client_access_url']}</code></li>";
    }
    echo "</ul>";
    
    echo "<h2>✅ Concluído!</h2>";
    echo "<p><a href='test_download_report.php'>➡️ Testar Download Agora</a></p>";
    
} catch (PDOException $e) {
    echo "<h1>❌ Erro de Conexão</h1>";
    echo "<p>Ajuste as credenciais no arquivo fix_db_urls_now.php:</p>";
    echo "<pre>";
    echo "\$host = 'localhost';  // Host do MySQL\n";
    echo "\$dbname = 'dashlicencas';  // Nome do banco\n";
    echo "\$user = 'root';  // Usuário\n";
    echo "\$pass = '';  // Senha\n";
    echo "</pre>";
    echo "<p><strong>Erro:</strong> " . $e->getMessage() . "</p>";
}
?>
