<?php
// app_bitdefender_sync_client.php - Versão V3 com informações extras
session_start();
require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    
    $stmt = $pdo->prepare("SELECT * FROM bitdefender_licenses WHERE id = ?");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch();
    
    if (!$client) {
        throw new Exception('Cliente não encontrado');
    }
    
    if (empty($client['client_api_key'])) {
        throw new Exception('Este cliente não possui API Key configurada');
    }
    
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
    
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
    
    try {
        $response = makeBitdefenderRequest(
            $client['client_api_key'],
            $accessUrl,
            'licensing',
            'getLicenseInfo',
            []
        );
        
        if (!isset($response['result'])) {
            throw new Exception('Resposta inválida da API: ' . json_encode($response));
        }
        
        $licenseInfo = $response['result'];
        
        // Mapear campos corretos da API Bitdefender
        $licenseKey = $licenseInfo['licenseKey'] ?? $client['license_key'];
        $totalLicenses = $licenseInfo['totalSlots'] ?? $client['total_licenses'];
        $usedLicenses = $licenseInfo['usedSlots'] ?? 0;
        $expirationDate = $licenseInfo['expiryDate'] ?? $client['expiration_date'];
        
        // Calcular informações extras
        $freeLicenses = $totalLicenses - $usedLicenses;
        $usagePercentage = $totalLicenses > 0 ? round(($usedLicenses / $totalLicenses) * 100, 2) : 0;
        $overLimit = $usedLicenses > $totalLicenses;
        
        // Converter data ISO para MySQL
        if ($expirationDate && strpos($expirationDate, 'T') !== false) {
            $expirationDate = date('Y-m-d', strtotime($expirationDate));
        }
        
        // Verificar se colunas extras existem
        $hasExtraColumns = checkExtraColumns($pdo);
        
        if ($hasExtraColumns) {
            // Atualizar com campos extras
            $updateStmt = $pdo->prepare("
                UPDATE bitdefender_licenses 
                SET license_key = ?,
                    total_licenses = ?,
                    used_licenses = ?,
                    free_licenses = ?,
                    usage_percentage = ?,
                    over_limit = ?,
                    expiration_date = ?,
                    last_sync = NOW()
                WHERE id = ?
            ");
            
            $updateStmt->execute([
                $licenseKey,
                $totalLicenses,
                $usedLicenses,
                $freeLicenses,
                $usagePercentage,
                $overLimit ? 1 : 0,
                $expirationDate,
                $client['id']
            ]);
        } else {
            // Atualizar apenas campos básicos
            $updateStmt = $pdo->prepare("
                UPDATE bitdefender_licenses 
                SET license_key = ?,
                    total_licenses = ?,
                    expiration_date = ?,
                    last_sync = NOW()
                WHERE id = ?
            ");
            
            $updateStmt->execute([
                $licenseKey,
                $totalLicenses,
                $expirationDate,
                $client['id']
            ]);
        }
        
        $duration = round(microtime(true) - $startTime, 2);
        
        logClientSync($pdo, $client['id'], 'success', "Cliente sincronizado em {$duration}s", [
            'license_key' => $licenseKey,
            'total_licenses' => $totalLicenses,
            'used_licenses' => $usedLicenses,
            'free_licenses' => $freeLicenses,
            'usage_percentage' => $usagePercentage,
            'over_limit' => $overLimit
        ]);
        
        // Determinar status visual
        $status = 'ok';
        $statusMessage = 'OK';
        if ($overLimit) {
            $status = 'critical';
            $statusMessage = 'LIMITE EXCEDIDO!';
        } elseif ($usagePercentage >= 90) {
            $status = 'warning';
            $statusMessage = 'Uso alto';
        } elseif ($usagePercentage >= 70) {
            $status = 'attention';
            $statusMessage = 'Atenção';
        }
        
        return [
            'success' => true,
            'message' => 'Cliente sincronizado com sucesso!',
            'duration' => $duration,
            'data' => [
                'licenseKey' => $licenseKey,
                'totalLicenses' => $totalLicenses,
                'usedLicenses' => $usedLicenses,
                'freeLicenses' => $freeLicenses,
                'usagePercentage' => $usagePercentage,
                'overLimit' => $overLimit,
                'expirationDate' => $expirationDate,
                'status' => $status,
                'statusMessage' => $statusMessage
            ],
            'extra_columns_available' => $hasExtraColumns
        ];
        
    } catch (Exception $e) {
        logClientSync($pdo, $client['id'], 'error', $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        throw $e;
    }
}

function checkExtraColumns($pdo) {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'used_licenses'");
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        return false;
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
        throw new Exception("Limite de requisições excedido (HTTP 429)");
    }
    
    if ($httpCode !== 200) {
        throw new Exception("Erro HTTP $httpCode: $response");
    }
    
    $decoded = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar JSON: " . json_last_error_msg());
    }
    
    if (isset($decoded['error'])) {
        throw new Exception("Erro da API: " . json_encode($decoded['error']));
    }
    
    return $decoded;
}

function logClientSync($pdo, $clientId, $status, $message, $details = []) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO bitdefender_sync_log (status, message, details)
            VALUES (?, ?, ?)
        ");
        
        $stmt->execute([
            $status,
            "Cliente ID $clientId: $message",
            json_encode(array_merge(['client_id' => $clientId], $details))
        ]);
    } catch (Exception $e) {
        error_log("Erro ao registrar log: " . $e->getMessage());
    }
}
