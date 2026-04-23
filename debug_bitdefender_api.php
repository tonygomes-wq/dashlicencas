<?php
// debug_bitdefender_api.php - Debug da resposta da API Bitdefender

session_start();
$_SESSION['user_id'] = 1;

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Buscar cliente MAGLON
    $stmt = $pdo->prepare("SELECT * FROM bitdefender_licenses WHERE company LIKE '%MAGLON%'");
    $stmt->execute();
    $client = $stmt->fetch();
    
    if (!$client) {
        throw new Exception('Cliente MAGLON não encontrado');
    }
    
    if (empty($client['client_api_key'])) {
        throw new Exception('Cliente não tem API Key configurada');
    }
    
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/licensing';
    
    // Fazer requisição à API
    $payload = [
        'id' => uniqid(),
        'jsonrpc' => '2.0',
        'method' => 'getLicenseInfo',
        'params' => []
    ];
    
    $auth = base64_encode($client['client_api_key'] . ':');
    
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
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("Erro cURL: $error");
    }
    
    $decoded = json_decode($response, true);
    
    echo json_encode([
        'success' => true,
        'client_info' => [
            'id' => $client['id'],
            'company' => $client['company'],
            'current_license_key' => $client['license_key'],
            'current_total_licenses' => $client['total_licenses']
        ],
        'api_request' => [
            'url' => $url,
            'method' => 'getLicenseInfo',
            'http_code' => $httpCode
        ],
        'api_response_raw' => $response,
        'api_response_decoded' => $decoded,
        'field_mapping' => [
            'licenseKey' => $decoded['result']['licenseKey'] ?? 'NOT FOUND',
            'seats' => $decoded['result']['seats'] ?? 'NOT FOUND',
            'usedSeats' => $decoded['result']['usedSeats'] ?? 'NOT FOUND',
            'expirationDate' => $decoded['result']['expirationDate'] ?? 'NOT FOUND',
            'all_fields' => array_keys($decoded['result'] ?? [])
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
