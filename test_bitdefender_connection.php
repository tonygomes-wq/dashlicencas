<?php
// test_bitdefender_connection.php - Testar conexão com API Bitdefender
session_start();
require_once 'srv/config.php';

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $apiKey = $data['apiKey'] ?? null;
    $accessUrl = $data['accessUrl'] ?? 'https://cloud.gravityzone.bitdefender.com/api';
    
    if (!$apiKey) {
        throw new Exception('API Key não fornecida');
    }
    
    $results = [];
    
    // Teste 1: Verificar se cURL está disponível
    $results['curl_available'] = function_exists('curl_init');
    
    // Teste 2: Verificar versão do cURL
    if ($results['curl_available']) {
        $results['curl_version'] = curl_version();
    }
    
    // Teste 3: Testar conexão básica (sem autenticação)
    $results['basic_connection'] = testBasicConnection($accessUrl);
    
    // Teste 4: Testar com API Key
    $results['api_test'] = testApiConnection($apiKey, $accessUrl);
    
    echo json_encode([
        'success' => true,
        'results' => $results
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

function testBasicConnection($accessUrl) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/licensing';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD request
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desabilitar verificação SSL temporariamente
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    
    return [
        'success' => empty($error),
        'http_code' => $httpCode,
        'error' => $error ?: null,
        'connect_time' => $info['connect_time'] ?? null,
        'total_time' => $info['total_time'] ?? null,
        'url' => $url
    ];
}

function testApiConnection($apiKey, $accessUrl) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/licensing';
    
    $payload = [
        'id' => uniqid(),
        'jsonrpc' => '2.0',
        'method' => 'getLicenseInfo',
        'params' => []
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Desabilitar verificação SSL temporariamente
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    
    // Capturar verbose output
    $verbose = fopen('php://temp', 'w+');
    curl_setopt($ch, CURLOPT_STDERR, $verbose);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    
    rewind($verbose);
    $verboseLog = stream_get_contents($verbose);
    fclose($verbose);
    
    curl_close($ch);
    
    $decoded = null;
    if ($response && !$error) {
        $decoded = json_decode($response, true);
    }
    
    return [
        'success' => empty($error) && $httpCode === 200,
        'http_code' => $httpCode,
        'error' => $error ?: null,
        'connect_time' => $info['connect_time'] ?? null,
        'total_time' => $info['total_time'] ?? null,
        'response_preview' => $response ? substr($response, 0, 500) : null,
        'decoded_response' => $decoded,
        'verbose_log' => $verboseLog,
        'url' => $url
    ];
}
