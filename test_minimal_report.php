<?php
/**
 * Teste MINIMALISTA - apenas campos obrigatórios
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'srv/config.php';
require_once 'php_compat_helpers.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Buscar cliente
    $stmt = $pdo->query("SELECT * FROM bitdefender_licenses WHERE client_api_key IS NOT NULL LIMIT 1");
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        throw new Exception('Cliente não encontrado');
    }
    
    $accessUrl = rtrim($client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com', '/');
    
    if (!str_ends_with($accessUrl, '/jsonrpc')) {
        if (!str_ends_with($accessUrl, '/api')) {
            $accessUrl .= '/api';
        }
        $accessUrl .= '/v1.0/jsonrpc';
    }
    
    $url = $accessUrl . '/reports';
    
    // TESTE 1: Apenas type (mínimo absoluto)
    echo "=== TESTE 1: Apenas type ===\n";
    $payload1 = [
        'params' => [
            'type' => 12
        ],
        'jsonrpc' => '2.0',
        'method' => 'createReport',
        'id' => '1'
    ];
    
    $result1 = testAPI($url, $client['client_api_key'], $payload1);
    echo json_encode($result1, JSON_PRETTY_PRINT) . "\n\n";
    
    if (!isset($result1['error'])) {
        echo "✅ SUCESSO COM TESTE 1!\n";
        exit;
    }
    
    // TESTE 2: type + reportingInterval
    echo "=== TESTE 2: type + reportingInterval ===\n";
    $payload2 = [
        'params' => [
            'type' => 12,
            'reportingInterval' => 1 // Código numérico: 1 = Today
        ],
        'jsonrpc' => '2.0',
        'method' => 'createReport',
        'id' => '2'
    ];
    
    $result2 = testAPI($url, $client['client_api_key'], $payload2);
    echo json_encode($result2, JSON_PRETTY_PRINT) . "\n\n";
    
    if (!isset($result2['error'])) {
        echo "✅ SUCESSO COM TESTE 2!\n";
        exit;
    }
    
    // TESTE 3: Formato alternativo com scheduledInfo
    echo "=== TESTE 3: Instant report (scheduledInfo vazio) ===\n";
    $payload3 = [
        'params' => [
            'type' => 12,
            'scheduledInfo' => (object)[] // Objeto vazio = instant report
        ],
        'jsonrpc' => '2.0',
        'method' => 'createReport',
        'id' => '3'
    ];
    
    $result3 = testAPI($url, $client['client_api_key'], $payload3);
    echo json_encode($result3, JSON_PRETTY_PRINT) . "\n\n";
    
    if (!isset($result3['error'])) {
        echo "✅ SUCESSO COM TESTE 3!\n";
        exit;
    }
    
    // TESTE 4: Listar relatórios existentes (para ver o formato correto)
    echo "=== TESTE 4: Listar relatórios (getReportsList) ===\n";
    $payload4 = [
        'params' => [
            'page' => 1,
            'perPage' => 5
        ],
        'jsonrpc' => '2.0',
        'method' => 'getReportsList',
        'id' => '4'
    ];
    
    $result4 = testAPI($url, $client['client_api_key'], $payload4);
    echo json_encode($result4, JSON_PRETTY_PRINT) . "\n\n";
    
    echo "❌ Todos os testes falharam. Veja os erros acima.\n";
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}

function testAPI($url, $apiKey, $payload) {
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
    
    $decoded = json_decode($response, true);
    
    return [
        'http_code' => $httpCode,
        'payload_sent' => $payload,
        'response' => $decoded
    ];
}
