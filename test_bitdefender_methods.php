<?php
/**
 * Teste de métodos disponíveis na API Bitdefender
 * Documentação: https://www.bitdefender.com/business/support/en/77209-128643-getting-started.html
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'srv/config.php';
require_once 'php_compat_helpers.php';

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Métodos Bitdefender</title>";
echo "<style>
body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; max-width: 1200px; margin: 0 auto; }
h1 { color: #333; }
.test { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #2196F3; }
.success { color: #4CAF50; font-weight: bold; }
.error { color: #f44336; font-weight: bold; }
pre { background: #f5f5f5; padding: 15px; overflow-x: auto; font-size: 12px; }
.info { background: #e3f2fd; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
</style></head><body>";

echo "<h1>🔍 Teste de Métodos API Bitdefender</h1>";

// Buscar cliente
$stmt = $pdo->query("SELECT * FROM bitdefender_licenses WHERE client_api_key IS NOT NULL LIMIT 1");
$client = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$client) {
    die("<p class='error'>Nenhum cliente com API Key encontrado</p>");
}

echo "<div class='info'>";
echo "<strong>Cliente:</strong> {$client['company']}<br>";
echo "<strong>API Key:</strong> " . substr($client['client_api_key'], 0, 15) . "...<br>";
echo "</div>";

// Métodos para testar baseados na documentação oficial
$methodsToTest = [
    // Networking
    ['module' => 'network', 'method' => 'getNetworkInventoryItems', 'params' => ['page' => 1, 'perPage' => 10]],
    
    // Reports - Formato correto segundo a documentação
    ['module' => 'reports', 'method' => 'getReportsList', 'params' => ['page' => 1, 'perPage' => 5]],
    ['module' => 'reports', 'method' => 'createReport', 'params' => [
        'type' => 12, // Malware Status
        'name' => 'Teste API',
        'options' => [
            'reportingInterval' => 'thisWeek'
        ]
    ]],
];

foreach ($methodsToTest as $test) {
    $module = $test['method'];
    $method = $test['method'];
    $params = $test['params'];
    
    echo "<div class='test'>";
    echo "<h2>Testando: {$test['module']}/{$method}</h2>";
    
    try {
        $accessUrl = rtrim($client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com', '/');
        
        // URL base segundo documentação oficial
        $url = $accessUrl . '/api/v1.0/jsonrpc/' . $test['module'];
        
        echo "<p><strong>URL:</strong> $url</p>";
        
        $payload = [
            'params' => $params,
            'jsonrpc' => '2.0',
            'method' => $method,
            'id' => uniqid('test_', true)
        ];
        
        echo "<p><strong>Payload:</strong></p>";
        echo "<pre>" . json_encode($payload, JSON_PRETTY_PRINT) . "</pre>";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($client['client_api_key'] . ':')
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "<p><strong>HTTP Status:</strong> $httpCode</p>";
        
        if ($response) {
            $decoded = json_decode($response, true);
            
            if ($decoded) {
                if (isset($decoded['result'])) {
                    echo "<p class='success'>✅ SUCESSO!</p>";
                    echo "<details><summary>Resultado</summary>";
                    echo "<pre>" . json_encode($decoded['result'], JSON_PRETTY_PRINT) . "</pre>";
                    echo "</details>";
                } elseif (isset($decoded['error'])) {
                    echo "<p class='error'>❌ Erro: {$decoded['error']['message']} (código: {$decoded['error']['code']})</p>";
                    
                    if ($decoded['error']['code'] == -32601) {
                        echo "<p><em>Método não encontrado - URL ou método incorreto</em></p>";
                    }
                } else {
                    echo "<p class='error'>❌ Resposta inesperada</p>";
                    echo "<pre>" . json_encode($decoded, JSON_PRETTY_PRINT) . "</pre>";
                }
            } else {
                echo "<p class='error'>❌ Resposta não é JSON</p>";
                echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "</pre>";
            }
        } else {
            echo "<p class='error'>❌ Sem resposta</p>";
        }
        
    } catch (Exception $e) {
        echo "<p class='error'>❌ Exceção: {$e->getMessage()}</p>";
    }
    
    echo "</div>";
    
    // Pequeno delay entre requisições
    usleep(500000); // 0.5 segundo
}

echo "<hr>";
echo "<h2>📚 Referências</h2>";
echo "<div class='info'>";
echo "<p><strong>Documentação Oficial:</strong></p>";
echo "<ul>";
echo "<li><a href='https://www.bitdefender.com/business/support/en/77209-128643-getting-started.html' target='_blank'>Bitdefender GravityZone API - Getting Started</a></li>";
echo "<li><a href='https://www.bitdefender.com/business/support/en/77209-389337-reports.html' target='_blank'>Reports API</a></li>";
echo "</ul>";
echo "</div>";

echo "</body></html>";
