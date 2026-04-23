<?php
// app_bitdefender_sync.php - Sincronização com API Bitdefender
session_start();
require_once 'srv/config.php';

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

// Check admin permission
$stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Apenas administradores podem sincronizar com a API']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Retorna configuração atual
            $action = $_GET['action'] ?? 'config';
            
            if ($action === 'config') {
                $stmt = $pdo->query("SELECT * FROM bitdefender_api_config WHERE id = 1");
                $config = $stmt->fetch();
                
                if ($config) {
                    // Ocultar API key parcialmente
                    $config['api_key'] = substr($config['api_key'], 0, 8) . '...' . substr($config['api_key'], -4);
                }
                
                echo json_encode($config ?: ['enabled' => false]);
            } elseif ($action === 'test') {
                // Testar conexão
                $result = testBitdefenderConnection($pdo);
                echo json_encode($result);
            } elseif ($action === 'logs') {
                // Retornar últimos logs
                $stmt = $pdo->query("SELECT * FROM bitdefender_sync_log ORDER BY created_at DESC LIMIT 20");
                echo json_encode($stmt->fetchAll());
            }
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $action = $data['action'] ?? 'sync';
            
            if ($action === 'config') {
                // Salvar configuração
                saveConfig($pdo, $data);
                echo json_encode(['success' => true, 'message' => 'Configuração salva com sucesso']);
                
            } elseif ($action === 'sync') {
                // Executar sincronização
                $result = syncBitdefenderLicenses($pdo);
                echo json_encode($result);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ============= FUNÇÕES =============

function saveConfig($pdo, $data) {
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_api_config (id, api_key, access_url, enabled, sync_interval)
        VALUES (1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            api_key = VALUES(api_key),
            access_url = VALUES(access_url),
            enabled = VALUES(enabled),
            sync_interval = VALUES(sync_interval)
    ");
    
    $stmt->execute([
        $data['api_key'],
        $data['access_url'],
        $data['enabled'] ? 1 : 0,
        $data['sync_interval'] ?? 3600
    ]);
}

function testBitdefenderConnection($pdo) {
    $stmt = $pdo->query("SELECT * FROM bitdefender_api_config WHERE id = 1");
    $config = $stmt->fetch();
    
    if (!$config || !$config['enabled']) {
        return ['success' => false, 'message' => 'API não configurada'];
    }
    
    try {
        $response = makeBitdefenderRequest(
            $config['api_key'],
            $config['access_url'],
            'licensing',
            'getLicenseInfo',
            []
        );
        
        if (isset($response['result'])) {
            return [
                'success' => true,
                'message' => 'Conexão estabelecida com sucesso!',
                'data' => $response['result']
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Erro na resposta da API',
                'error' => $response['error'] ?? 'Desconhecido'
            ];
        }
    } catch (Exception $e) {
        return ['success' => false, 'message' => $e->getMessage()];
    }
}

function syncBitdefenderLicenses($pdo) {
    $stmt = $pdo->query("SELECT * FROM bitdefender_api_config WHERE id = 1");
    $config = $stmt->fetch();
    
    if (!$config || !$config['enabled']) {
        throw new Exception('API do Bitdefender não está configurada ou habilitada');
    }
    
    $startTime = microtime(true);
    $updated = 0;
    $errors = [];
    
    try {
        // Obter informações de licença da API
        $response = makeBitdefenderRequest(
            $config['api_key'],
            $config['access_url'],
            'licensing',
            'getLicenseInfo',
            []
        );
        
        if (!isset($response['result'])) {
            throw new Exception('Resposta inválida da API: ' . json_encode($response));
        }
        
        $licenseInfo = $response['result'];
        
        // Obter todas as empresas (companies) da API
        $companiesResponse = makeBitdefenderRequest(
            $config['api_key'],
            $config['access_url'],
            'companies',
            'getCompaniesList',
            ['page' => 1, 'perPage' => 100]
        );
        
        if (isset($companiesResponse['result']['items'])) {
            $companies = $companiesResponse['result']['items'];
            
            foreach ($companies as $company) {
                // Para cada empresa, obter detalhes da licença
                $companyDetails = makeBitdefenderRequest(
                    $config['api_key'],
                    $config['access_url'],
                    'companies',
                    'getCompanyDetails',
                    ['companyId' => $company['id']]
                );
                
                if (isset($companyDetails['result'])) {
                    $details = $companyDetails['result'];
                    
                    // Verificar se já existe no banco local
                    $stmt = $pdo->prepare("
                        SELECT id FROM bitdefender_licenses 
                        WHERE company = ? OR license_key = ?
                        LIMIT 1
                    ");
                    $stmt->execute([
                        $company['name'],
                        $details['licenseKey'] ?? ''
                    ]);
                    $existing = $stmt->fetch();
                    
                    if ($existing) {
                        // Atualizar registro existente
                        $updateStmt = $pdo->prepare("
                            UPDATE bitdefender_licenses 
                            SET license_key = ?,
                                total_licenses = ?,
                                expiration_date = ?
                            WHERE id = ?
                        ");
                        
                        $updateStmt->execute([
                            $details['licenseKey'] ?? '',
                            $details['seats'] ?? 0,
                            $details['expirationDate'] ?? null,
                            $existing['id']
                        ]);
                        
                        $updated++;
                    } else {
                        // Criar novo registro
                        $insertStmt = $pdo->prepare("
                            INSERT INTO bitdefender_licenses 
                            (user_id, company, license_key, total_licenses, expiration_date, renewal_status)
                            VALUES (?, ?, ?, ?, ?, 'Pendente')
                        ");
                        
                        $insertStmt->execute([
                            $_SESSION['user_id'],
                            $company['name'],
                            $details['licenseKey'] ?? '',
                            $details['seats'] ?? 0,
                            $details['expirationDate'] ?? null
                        ]);
                        
                        $updated++;
                    }
                }
            }
        }
        
        $duration = round(microtime(true) - $startTime, 2);
        
        // Registrar log de sucesso
        logSync($pdo, 'success', "Sincronizados $updated registros em {$duration}s", [
            'updated' => $updated,
            'duration' => $duration
        ]);
        
        // Atualizar última sincronização
        $pdo->query("UPDATE bitdefender_api_config SET last_sync = NOW() WHERE id = 1");
        
        return [
            'success' => true,
            'message' => "Sincronização concluída com sucesso!",
            'updated' => $updated,
            'duration' => $duration,
            'errors' => $errors
        ];
        
    } catch (Exception $e) {
        logSync($pdo, 'error', $e->getMessage());
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
        throw new Exception("Limite de requisições excedido. Aguarde alguns segundos.");
    }
    
    if ($httpCode !== 200) {
        throw new Exception("Erro HTTP $httpCode: $response");
    }
    
    $decoded = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erro ao decodificar JSON: " . json_last_error_msg());
    }
    
    return $decoded;
}

function logSync($pdo, $status, $message, $details = null) {
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_sync_log (status, message, details)
        VALUES (?, ?, ?)
    ");
    
    $stmt->execute([
        $status,
        $message,
        $details ? json_encode($details) : null
    ]);
}
