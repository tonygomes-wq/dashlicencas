<?php
/**
 * Script de Teste da API Bitdefender
 * Testa a conexão com a API de um cliente específico
 */

header('Content-Type: application/json');
require_once __DIR__ . '/srv/config.php';

// ID do cliente para testar (você pode mudar)
$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 3;

try {
    // Buscar informações do cliente
    $stmt = $pdo->prepare("
        SELECT id, company, client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE id = ?
    ");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$client) {
        throw new Exception("Cliente não encontrado");
    }

    if (!$client['client_api_key']) {
        throw new Exception("Cliente não possui API Key configurada");
    }

    $apiKey = $client['client_api_key'];
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';

    echo json_encode([
        'step' => 1,
        'message' => 'Cliente encontrado',
        'client' => $client['company'],
        'access_url' => $accessUrl,
        'api_key_length' => strlen($apiKey),
        'api_key_preview' => substr($apiKey, 0, 10) . '...'
    ], JSON_PRETTY_PRINT) . "\n\n";

    // Testar chamada à API - Método 1: getNetworkInventoryItems
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/getNetworkInventoryItems';
    
    $payload = json_encode([
        'params' => [
            'perPage' => 5,
            'page' => 1,
            'filters' => [
                'type' => ['computers', 'virtualMachines']
            ]
        ],
        'jsonrpc' => '2.0',
        'method' => 'getNetworkInventoryItems',
        'id' => '1'
    ]);

    echo json_encode([
        'step' => 2,
        'message' => 'Preparando requisição',
        'url' => $url,
        'payload' => json_decode($payload)
    ], JSON_PRETTY_PRINT) . "\n\n";

    // Fazer requisição
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_VERBOSE, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlInfo = curl_getinfo($ch);
    curl_close($ch);

    echo json_encode([
        'step' => 3,
        'message' => 'Resposta recebida',
        'http_code' => $httpCode,
        'curl_error' => $curlError ?: null,
        'response_length' => strlen($response),
        'response_preview' => substr($response, 0, 500)
    ], JSON_PRETTY_PRINT) . "\n\n";

    // Tentar decodificar resposta
    $decoded = json_decode($response, true);
    
    if (!$decoded) {
        echo json_encode([
            'step' => 4,
            'error' => 'Erro ao decodificar JSON',
            'json_error' => json_last_error_msg(),
            'raw_response' => $response
        ], JSON_PRETTY_PRINT) . "\n\n";
    } else {
        echo json_encode([
            'step' => 4,
            'message' => 'JSON decodificado com sucesso',
            'has_result' => isset($decoded['result']),
            'has_error' => isset($decoded['error']),
            'decoded' => $decoded
        ], JSON_PRETTY_PRINT) . "\n\n";
    }

    // Verificar se há endpoints
    if (isset($decoded['result']['items'])) {
        echo json_encode([
            'step' => 5,
            'message' => 'Endpoints encontrados',
            'total_endpoints' => count($decoded['result']['items']),
            'first_endpoint' => $decoded['result']['items'][0] ?? null
        ], JSON_PRETTY_PRINT) . "\n\n";
    } elseif (isset($decoded['error'])) {
        echo json_encode([
            'step' => 5,
            'error' => 'API retornou erro',
            'api_error' => $decoded['error']
        ], JSON_PRETTY_PRINT) . "\n\n";
    }

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
