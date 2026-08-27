<?php
/**
 * Teste com base no erro anterior que mostrou "name is required"
 * Agora vamos testar variações COM name
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'srv/config.php';
require_once 'php_compat_helpers.php';

header('Content-Type: text/plain; charset=UTF-8');

$stmt = $pdo->query("SELECT * FROM bitdefender_licenses WHERE client_api_key IS NOT NULL LIMIT 1");
$client = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$client) {
    die("Cliente não encontrado\n");
}

$accessUrl = rtrim($client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com', '/');

if (!str_ends_with($accessUrl, '/jsonrpc')) {
    if (!str_ends_with($accessUrl, '/api')) {
        $accessUrl .= '/api';
    }
    $accessUrl .= '/v1.0/jsonrpc';
}

$url = $accessUrl . '/reports';

echo "==============================================\n";
echo "TESTE DE PAYLOADS PARA createReport\n";
echo "==============================================\n\n";

// TESTE 1: type + name (mínimo com name)
echo "TESTE 1: type + name\n";
echo "--------------------\n";
$test1 = testPayload($url, $client['client_api_key'], [
    'type' => 12,
    'name' => 'Test Report 1'
]);
echo json_encode($test1, JSON_PRETTY_PRINT) . "\n\n";

// TESTE 2: type + name + reportingInterval (string)
echo "TESTE 2: type + name + reportingInterval (string)\n";
echo "--------------------\n";
$test2 = testPayload($url, $client['client_api_key'], [
    'type' => 12,
    'name' => 'Test Report 2',
    'reportingInterval' => 'thisWeek'
]);
echo json_encode($test2, JSON_PRETTY_PRINT) . "\n\n";

// TESTE 3: type + name + reportingInterval (número)
echo "TESTE 3: type + name + reportingInterval (número)\n";
echo "--------------------\n";
$test3 = testPayload($url, $client['client_api_key'], [
    'type' => 12,
    'name' => 'Test Report 3',
    'reportingInterval' => 1 // 1 = today
]);
echo json_encode($test3, JSON_PRETTY_PRINT) . "\n\n";

// TESTE 4: Formato completo (type, name, todos os campos)
echo "TESTE 4: Formato completo\n";
echo "--------------------\n";
$test4 = testPayload($url, $client['client_api_key'], [
    'type' => 12,
    'name' => 'Test Report 4',
    'reportingInterval' => 1,
    'filterType' => 0
]);
echo json_encode($test4, JSON_PRETTY_PRINT) . "\n\n";

// TESTE 5: Scheduled report (não instant)
echo "TESTE 5: Scheduled report\n";
echo "--------------------\n";
$test5 = testPayload($url, $client['client_api_key'], [
    'type' => 12,
    'name' => 'Test Report 5',
    'scheduledInfo' => [
        'recurrence' => 'daily',
        'timeOfDay' => '08:00'
    ]
]);
echo json_encode($test5, JSON_PRETTY_PRINT) . "\n\n";

// Resumo
echo "\n==============================================\n";
echo "RESUMO\n";
echo "==============================================\n";

$tests = [$test1, $test2, $test3, $test4, $test5];
foreach ($tests as $i => $test) {
    $num = $i + 1;
    if (isset($test['response']['result'])) {
        echo "✅ TESTE $num: FUNCIONOU!\n";
    } elseif (isset($test['response']['error'])) {
        echo "❌ TESTE $num: {$test['response']['error']['message']}\n";
        if (isset($test['response']['error']['data']['details'])) {
            echo "   Detalhes: {$test['response']['error']['data']['details']}\n";
        }
    }
}

function testPayload($url, $apiKey, $params) {
    $payload = [
        'params' => $params,
        'jsonrpc' => '2.0',
        'method' => 'createReport',
        'id' => uniqid()
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'http_code' => $httpCode,
        'params_sent' => $params,
        'response' => json_decode($response, true)
    ];
}
