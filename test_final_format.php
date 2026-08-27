<?php
/**
 * TESTE FINAL - Formato correto completo
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

echo "🔍 Buscando endpoints...\n";

$urlNetwork = $accessUrl . '/network';
$payloadEndpoints = [
    'params' => ['perPage' => 10, 'page' => 1],
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

$targetIds = [];
if (isset($decoded['result']['items']) && count($decoded['result']['items']) > 0) {
    foreach ($decoded['result']['items'] as $item) {
        $targetIds[] = $item['id'];
    }
    echo "✅ Encontrados " . count($targetIds) . " endpoints\n\n";
} else {
    die("❌ Nenhum endpoint encontrado\n");
}

echo "🚀 Criando relatório com formato CORRETO...\n\n";

$urlReports = $accessUrl . '/reports';

$payload = [
    'params' => [
        'type' => 12,
        'name' => 'Malware Status - ' . date('d/m/Y H:i'),
        'targetIds' => $targetIds,
        'options' => [
            'reportingInterval' => 5 // 5 = thisMonth
        ]
    ],
    'jsonrpc' => '2.0',
    'method' => 'createReport',
    'id' => '2'
];

echo "📦 Payload:\n";
echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n\n";

$ch = curl_init($urlReports);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($client['client_api_key'] . ':')
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

echo "📨 Resposta:\n";
echo json_encode($result, JSON_PRETTY_PRINT) . "\n\n";

if (isset($result['result']['reportId'])) {
    echo "🎉🎉🎉 SUCESSO! Relatório criado!\n";
    echo "Report ID: {$result['result']['reportId']}\n\n";
    
    echo "✅ FORMATO CORRETO CONFIRMADO:\n";
    echo "- type: obrigatório\n";
    echo "- name: obrigatório\n";
    echo "- targetIds: obrigatório (array de IDs)\n";
    echo "- options.reportingInterval: obrigatório (número 1-10)\n";
    
} elseif (isset($result['error'])) {
    echo "❌ Erro: {$result['error']['message']}\n";
    if (isset($result['error']['data']['details'])) {
        echo "Detalhes: {$result['error']['data']['details']}\n";
    }
}
