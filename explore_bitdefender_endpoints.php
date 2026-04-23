<?php
// explore_bitdefender_endpoints.php - Explorar endpoints da API Bitdefender

session_start();
$_SESSION['user_id'] = 1;

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Buscar cliente MAGLON
    $stmt = $pdo->prepare("SELECT * FROM bitdefender_licenses WHERE company LIKE '%MAGLON%'");
    $stmt->execute();
    $client = $stmt->fetch();
    
    if (!$client || empty($client['client_api_key'])) {
        throw new Exception('Cliente não encontrado ou sem API Key');
    }
    
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
    $apiKey = $client['client_api_key'];
    
    $results = [];
    
    // Endpoint 1: getLicenseInfo (já conhecemos)
    $results['licensing_getLicenseInfo'] = callAPI($apiKey, $accessUrl, 'licensing', 'getLicenseInfo', []);
    
    // Endpoint 2: getEndpointsList (lista de computadores)
    $results['network_getEndpointsList'] = callAPI($apiKey, $accessUrl, 'network', 'getEndpointsList', [
        'perPage' => 100,
        'page' => 1
    ]);
    
    // Endpoint 3: getManagedEndpointDetails (detalhes de endpoints)
    $results['network_getManagedEndpointDetails'] = callAPI($apiKey, $accessUrl, 'network', 'getManagedEndpointDetails', [
        'filters' => [
            'depth' => [
                'allItemsRecursively' => true
            ]
        ]
    ]);
    
    // Endpoint 4: getCompaniesStats (estatísticas)
    $results['accounts_getCompaniesStats'] = callAPI($apiKey, $accessUrl, 'accounts', 'getCompaniesStats', []);
    
    echo json_encode([
        'success' => true,
        'client' => [
            'id' => $client['id'],
            'company' => $client['company']
        ],
        'endpoints_tested' => [
            'licensing/getLicenseInfo' => 'Informações de licença',
            'network/getEndpointsList' => 'Lista de computadores',
            'network/getManagedEndpointDetails' => 'Detalhes de endpoints',
            'accounts/getCompaniesStats' => 'Estatísticas da conta'
        ],
        'results' => $results,
        'summary' => analyzeLicenseUsage($results)
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

function callAPI($apiKey, $accessUrl, $api, $method, $params) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/' . $api;
    
    $payload = [
        'id' => uniqid(),
        'jsonrpc' => '2.0',
        'method' => $method,
        'params' => $params
    ];
    
    $auth = base64_encode($apiKey . ':');
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . $auth
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $decoded = json_decode($response, true);
    
    return [
        'http_code' => $httpCode,
        'success' => $httpCode === 200 && isset($decoded['result']),
        'response' => $decoded,
        'error' => $decoded['error'] ?? null
    ];
}

function analyzeLicenseUsage($results) {
    $summary = [
        'total_licenses' => 0,
        'used_licenses' => 0,
        'free_licenses' => 0,
        'total_computers' => 0,
        'protected_computers' => 0,
        'unprotected_computers' => 0,
        'over_limit' => false
    ];
    
    // Dados de licença
    if (isset($results['licensing_getLicenseInfo']['response']['result'])) {
        $license = $results['licensing_getLicenseInfo']['response']['result'];
        $summary['total_licenses'] = $license['totalSlots'] ?? 0;
        $summary['used_licenses'] = $license['usedSlots'] ?? 0;
        $summary['free_licenses'] = $summary['total_licenses'] - $summary['used_licenses'];
    }
    
    // Dados de endpoints
    if (isset($results['network_getEndpointsList']['response']['result'])) {
        $endpoints = $results['network_getEndpointsList']['response']['result'];
        $summary['total_computers'] = $endpoints['total'] ?? 0;
        $summary['computers_list'] = $endpoints['items'] ?? [];
    }
    
    // Verificar se ultrapassou limite
    $summary['over_limit'] = $summary['used_licenses'] > $summary['total_licenses'];
    
    return $summary;
}
