<?php
// app_bitdefender_sync_client_DEBUG.php - Versão com debug detalhado
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
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

function syncSingleClient($pdo, $client, $accessUrl) {
    $startTime = microtime(true);
    $debugInfo = [];
    
    try {
        // Log da requisição
        $debugInfo['request'] = [
            'url' => $accessUrl,
            'client_id' => $client['id'],
            'company' => $client['company']
        ];
        
        // Obter informações de licença da API
        $response = makeBitdefenderRequest(
            $client['client_api_key'],
            $accessUrl,
            'licensing',
            'getLicenseInfo',
            []
        );
        
        $debugInfo['raw_response'] = $response;
        
        if (!isset($response['result'])) {
            // Se não tem 'result', pode ter 'error'
            if (isset($response['error'])) {
                throw new Exception('Erro da API: ' . json_encode($response['error']));
            }
            throw new Exception('Resposta inválida da API: ' . json_encode($response));
        }
        
        $licenseInfo = $response['result'];
        $debugInfo['license_info'] = $licenseInfo;
        
        // Extrair dados (a estrutura pode variar)
        $newLicenseKey = null;
        $newTotalLicenses = null;
        $newExpirationDate = null;
        
        // Tentar diferentes estruturas de resposta
        if (isset($licenseInfo['licenseKey'])) {
            $newLicenseKey = $licenseInfo['licenseKey'];
        } elseif (isset($licenseInfo['license_key'])) {
            $newLicenseKey = $licenseInfo['license_key'];
        } elseif (isset($licenseInfo['key'])) {
            $newLicenseKey = $licenseInfo['key'];
        }
        
        if (isset($licenseInfo['seats'])) {
            $newTotalLicenses = $licenseInfo['seats'];
        } elseif (isset($licenseInfo['totalSeats'])) {
            $newTotalLicenses = $licenseInfo['totalSeats'];
        } elseif (isset($licenseInfo['total_licenses'])) {
            $newTotalLicenses = $licenseInfo['total_licenses'];
        } elseif (isset($licenseInfo['licensesCount'])) {
            $newTotalLicenses = $licenseInfo['licensesCount'];
        }
        
        if (isset($licenseInfo['expirationDate'])) {
            $newExpirationDate = $licenseInfo['expirationDate'];
        } elseif (isset($licenseInfo['expiration_date'])) {
            $newExpirationDate = $licenseInfo['expiration_date'];
        } elseif (isset($licenseInfo['expiry'])) {
            $newExpirationDate = $licenseInfo['expiry'];
        }
        
        // Converter data se necessário (timestamp para Y-m-d)
        if ($newExpirationDate && is_numeric($newExpirationDate)) {
            $newExpirationDate = date('Y-m-d', $newExpirationDate);
        }
        
        $debugInfo['extracted_data'] = [
            'license_key' => $newLicenseKey,
            'total_licenses' => $newTotalLicenses,
            'expiration_date' => $newExpirationDate
        ];
        
        // Usar valores atuais se não encontrou na API
        $finalLicenseKey = $newLicenseKey ?: $client['license_key'];
        $finalTotalLicenses = $newTotalLicenses ?: $client['total_licenses'];
        $finalExpirationDate = $newExpirationDate ?: $client['expiration_date'];
        
        $debugInfo['final_data'] = [
            'license_key' => $finalLicenseKey,
            'total_licenses' => $finalTotalLicenses,
            'expiration_date' => $finalExpirationDate
        ];
        
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
            $finalLicenseKey,
            $finalTotalLicenses,
            $finalExpirationDate,
            $client['id']
        ]);
        
        $duration = round(microtime(true) - $startTime, 2);
        
        // Registrar log
        logClientSync($pdo, $client['id'], 'success', "Cliente sincronizado em {$duration}s", $debugInfo);
        
        return [
            'success' => true,
            'message' => 'Cliente sincronizado com sucesso!',
            'duration' => $duration,
            'data' => [
                'licenseKey' => $finalLicenseKey,
                'totalLicenses' => $finalTotalLicenses,
                'expirationDate' => $finalExpirationDate
            ],
            'debug' => $debugInfo
        ];
        
    } catch (Exception $e) {
        $debugInfo['error'] = $e->getMessage();
        logClientSync($pdo, $client['id'], 'error', $e->getMessage(), $debugInfo);
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
        throw new Exception("Erro HTTP $httpCode - Resposta: " . substr($response, 0, 500));
    }
    
    $decoded = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar JSON: " . json_last_error_msg() . " - Resposta: " . substr($response, 0, 500));
    }
    
    return $decoded;
}

function logClientSync($pdo, $clientId, $status, $message, $debugInfo = []) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO bitdefender_sync_log (status, message, details)
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([
            $status,
            "Cliente ID $clientId: $message",
            json_encode(array_merge(['client_id' => $clientId], $debugInfo))
        ]);
    } catch (Exception $e) {
        // Ignorar erro de log
    }
}
