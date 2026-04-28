<?php
/**
 * Script de debug para verificar endpoint de sincronização
 */

echo "<h2>🔍 DEBUG - Endpoint de Sincronização Bitdefender</h2>";

// Verificar se arquivo existe
$file = 'app_bitdefender_sync_client.php';
echo "<h3>1. Verificar Arquivo</h3>";
if (file_exists($file)) {
    echo "✅ Arquivo existe: $file<br>";
    echo "Caminho completo: " . realpath($file) . "<br>";
    echo "Tamanho: " . filesize($file) . " bytes<br>";
} else {
    echo "❌ Arquivo NÃO existe: $file<br>";
}

// Verificar permissões
echo "<h3>2. Verificar Permissões</h3>";
if (is_readable($file)) {
    echo "✅ Arquivo é legível<br>";
} else {
    echo "❌ Arquivo NÃO é legível<br>";
}

// Testar requisição
echo "<h3>3. Testar Requisição POST</h3>";
session_start();

// Simular sessão (APENAS PARA DEBUG - REMOVER EM PRODUÇÃO)
if (!isset($_SESSION['user_id'])) {
    echo "⚠️ Sessão não iniciada. Simulando usuário ID 1 para teste...<br>";
    $_SESSION['user_id'] = 1;
}

// Fazer requisição interna
$url = 'http://' . $_SERVER['HTTP_HOST'] . '/app_bitdefender_sync_client.php';
echo "URL de teste: $url<br>";

$data = json_encode(['clientId' => 1]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Cookie: ' . session_name() . '=' . session_id()
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "<h4>Resultado:</h4>";
echo "HTTP Code: $httpCode<br>";
if ($error) {
    echo "❌ Erro cURL: $error<br>";
}
echo "<h4>Resposta:</h4>";
echo "<pre>" . htmlspecialchars($response) . "</pre>";

// Verificar banco de dados
echo "<h3>4. Verificar Banco de Dados</h3>";
require_once 'srv/config.php';

try {
    $stmt = $pdo->query("SELECT id, company, client_api_key FROM bitdefender_licenses LIMIT 5");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "✅ Conexão com banco OK<br>";
    echo "Clientes encontrados: " . count($clients) . "<br>";
    
    echo "<table border='1' style='border-collapse: collapse; margin-top: 10px;'>";
    echo "<tr><th>ID</th><th>Empresa</th><th>API Key Configurada</th></tr>";
    foreach ($clients as $client) {
        $hasApiKey = !empty($client['client_api_key']) ? '✅ SIM' : '❌ NÃO';
        echo "<tr>";
        echo "<td>{$client['id']}</td>";
        echo "<td>{$client['company']}</td>";
        echo "<td>$hasApiKey</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "❌ Erro no banco: " . $e->getMessage() . "<br>";
}

// Verificar estrutura de colunas
echo "<h3>5. Verificar Colunas da Tabela</h3>";
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; margin-top: 10px;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>{$col['Field']}</td>";
        echo "<td>{$col['Type']}</td>";
        echo "<td>{$col['Null']}</td>";
        echo "<td>{$col['Key']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Verificar se colunas de uso existem
    $usageColumns = ['used_slots', 'total_slots', 'license_usage_percent'];
    echo "<h4>Colunas de Uso de Licença:</h4>";
    foreach ($usageColumns as $colName) {
        $found = false;
        foreach ($columns as $col) {
            if ($col['Field'] === $colName) {
                $found = true;
                break;
            }
        }
        echo $found ? "✅ $colName existe<br>" : "❌ $colName NÃO existe<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Erro ao verificar colunas: " . $e->getMessage() . "<br>";
}

echo "<hr>";
echo "<p><strong>⚠️ IMPORTANTE:</strong> Este script é apenas para debug. Remova após resolver o problema!</p>";
?>
