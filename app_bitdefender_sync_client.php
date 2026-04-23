<?php
// app_bitdefender_sync_client.php - Sincronização individual por cliente
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
    $clientId = $data['clientId'] ?? null;
    
    if (!$clientId) {
        throw new Exception('ID do cliente não fornecido');
    }
    
    // Buscar dados do cliente
    $stmt = $pdo->prepare("SELECT * FROM bitdefender_licenses WHERE id = ?");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch();
    
    if (!$client) {
        throw new Exception('Cliente não encontrado');
    }
    
    // Verificar se o cliente tem API Key própria
    if (empty($client['client_api_key'])) {
        throw new Exception('Este cliente não possui API Key configurada');
    }
    
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
    
    // Sincronizar dados do cliente
    $result = syncSingleClient($pdo, $client, $accessUrl);
    
    echo json_encode($result);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function syncSingleClient($pdo, $client, $accessUrl) {
    $startTime = microtime(true);
    
    try {
        // Obter informações de licença da API
        $response = makeBitdefenderRequest(
            $client['client_api_key'],
            $accessUrl,
            'licensing',
            'getLicenseInfo',
            []
        );
        
        if (!isset($response['result'])) {
            throw new Exception('Resposta inválida da API');
        }
        
        $licenseInfo = $response['result'];
        
        // Atualizar registro no banco
        $updateStmt = $pdo->prepare("
            UPDATE bitdefender_licenses 
            SET license_key = ?,
                total_licenses = ?,
                expiration_date = ?,
                last_sync = NOW()
            WHERE id = ?
        ");
        
        $updateStmt->execute([
            $licenseInfo['licenseKey'] ?? $client['license_key'],
            $licenseInfo['seats'] ?? $client['total_licenses'],
            $licenseInfo['expirationDate'] ?? $client['expiration_date'],
            $client['id']
        ]);
        
        $duration = round(microtime(true) - $startTime, 2);
        
        // Registrar log
        logClientSync($pdo, $client['id'], 'success', "Cliente sincronizado em {$duration}s");
        
        return [
            'success' => true,
            'message' => 'Cliente sincronizado com sucesso!',
            'duration' => $duration,
            'data' => [
                'licenseKey' => $licenseInfo['licenseKey'] ?? null,
                'totalLicenses' => $licenseInfo['seats'] ?? null,
                'expirationDate' => $licenseInfo['expirationDate'] ?? null
            ]
        ];
        
    } catch (Exception $e) {
        logClientSync($pdo, $client['id'], 'error', $e->getMessage());
        throw $e;
    }
}

function makeBitdefenderRequest($apiKey, $accessUrl, $api, $method, $params = []) {
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
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        throw new Exception("Erro cURL: $error");
    }
    
    if ($httpCode === 429) {
        throw new Exception("Limite de requisições excedido");
    }
    
    if ($httpCode !== 200) {
        throw new Exception("Erro HTTP $httpCode");
    }
    
    $decoded = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar JSON");
    }
    
    return $decoded;
}

function logClientSync($pdo, $clientId, $status, $message) {
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_sync_log (status, message, details)
        VALUES (?, ?, ?)
    ");
    
    $stmt->execute([
        $status,
        "Cliente ID $clientId: $message",
        json_encode(['client_id' => $clientId])
    ]);
}
