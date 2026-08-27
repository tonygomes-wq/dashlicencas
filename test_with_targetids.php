<?php
/**
 * Teste COM targetIds (obrigatório!)
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

echo "==============================================\n";
echo "PASSO 1: Buscar endpoints disponíveis\n";
echo "==============================================\n";

$urlNetwork = $accessUrl . '/network';

$payloadEndpoints = [
    'params' => [
        'perPage' => 5,
        'page' => 1
    ],
    'jsonrpc' => '2.0',
    'method' => 'getNetworkInventoryItems',
    'id' => '1'
];

$ch = curl_init($urlNetwork);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payloadEndpoints));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($client['client_api_key'] . ':')
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
curl_close($ch);

$decoded = json_decode($response, true);

if (isset($decoded['result']['items']) && count($decoded['result']['items']) > 0) {
    echo "✅ Encontrados " . count($decoded['result']['items']) . " endpoints\n\n";
    
    // Pegar IDs dos primeiros 3 endpoints
    $targetIds = [];
    foreach (array_slice($decoded['result']['items'], 0, 3) as $item) {
        $targetIds[] = $item['id'];
        echo "- {$item['name']} (ID: {$item['id']})\n";
    }
    echo "\n";
    
} else {
    echo "❌ Nenhum endpoint encontrado ou erro na API\n";
    echo json_encode($decoded, JSON_PRETTY_PRINT) . "\n\n";
    
    // Usar IDs fictícios para teste
    echo "⚠️  Usando targetIds fictícios para continuar teste...\n\n";
    $targetIds = ['test_id_1'];
}

echo "==============================================\n";
echo "PASSO 2: Criar relatório COM targetIds\n";
echo "==============================================\n";

$urlReports = $accessUrl . '/reports';

// TESTE 1: Com targetIds (formato correto!)
echo "TESTE 1: type + name + targetIds\n";
echo "--------------------\n";
$payload1 = [
    'params' => [
        'type' => 12,
        'name' => 'Malware Status - ' . date('d/m/Y H:i'),
        'targetIds' => $targetIds
    ],
    'jsonrpc' => '2.0',
    'method' => 'createReport',
    'id' => '2'
];

echo "Payload:\n";
echo json_encode($payload1, JSON_PRETTY_PRINT) . "\n\n";

$ch = curl_init($urlReports);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload1));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($client['client_api_key'] . ':')
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

echo "Resposta:\n";
echo json_encode($result, JSON_PRETTY_PRINT) . "\n\n";

if (isset($result['result']['reportId'])) {
    echo "🎉🎉🎉 SUCESSO! Relatório criado!\n";
    echo "Report ID: {$result['result']['reportId']}\n";
} elseif (isset($result['error'])) {
    echo "❌ Erro: {$result['error']['message']}\n";
    if (isset($result['error']['data']['details'])) {
        echo "Detalhes: {$result['error']['data']['details']}\n";
    }
}
