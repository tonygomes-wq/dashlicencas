<?php
/**
 * API de Configuração do Bitdefender
 * Gerencia configurações globais da API Bitdefender
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_auth.php';

$auth = check_auth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

$user = $auth['user'];

// Apenas admins podem gerenciar configurações
if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado. Apenas administradores podem gerenciar configurações.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'get_config';

try {
    switch ($action) {
        case 'get_config':
            getConfig($pdo);
            break;
        case 'save_config':
            saveConfig($pdo);
            break;
        case 'test_connection':
            testConnection($pdo);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Obter configuração atual
 */
function getConfig($pdo) {
    $settings = [
        'api_key' => getSetting($pdo, 'bitdefender_api_key'),
        'access_url' => getSetting($pdo, 'bitdefender_access_url') ?: 'https://cloud.gravityzone.bitdefender.com/api',
        'auto_sync' => (bool)getSetting($pdo, 'bitdefender_auto_sync'),
        'sync_interval' => (int)(getSetting($pdo, 'sync_interval_hours') ?: 6),
        'last_sync' => getSetting($pdo, 'bitdefender_last_sync')
    ];

    echo json_encode($settings);
}

/**
 * Salvar configuração
 */
function saveConfig($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['api_key']) || empty($data['api_key'])) {
        http_response_code(400);
        echo json_encode(['error' => 'API Key é obrigatória']);
        return;
    }

    try {
        // Salvar configurações
        setSetting($pdo, 'bitdefender_api_key', $data['api_key']);
        setSetting($pdo, 'bitdefender_access_url', $data['access_url'] ?? 'https://cloud.gravityzone.bitdefender.com/api');
        setSetting($pdo, 'bitdefender_auto_sync', $data['auto_sync'] ? '1' : '0');
        setSetting($pdo, 'sync_interval_hours', $data['sync_interval'] ?? 6);

        echo json_encode([
            'success' => true,
            'message' => 'Configuração salva com sucesso'
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar configuração: ' . $e->getMessage()]);
    }
}

/**
 * Testar conexão com a API Bitdefender
 */
function testConnection($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['api_key']) || empty($data['api_key'])) {
        http_response_code(400);
        echo json_encode(['error' => 'API Key é obrigatória']);
        return;
    }

    $apiKey = $data['api_key'];
    $accessUrl = $data['access_url'] ?? 'https://cloud.gravityzone.bitdefender.com/api';

    try {
        // Testar conexão chamando um endpoint simples
        $result = callBitdefenderAPI($accessUrl, $apiKey, 'getApiKeyDetails');

        if ($result && isset($result['result'])) {
            // Salvar timestamp da última sincronização bem-sucedida
            setSetting($pdo, 'bitdefender_last_sync', date('Y-m-d H:i:s'));

            echo json_encode([
                'success' => true,
                'message' => 'Conexão estabelecida com sucesso',
                'details' => [
                    'api_name' => $result['result']['name'] ?? 'N/A',
                    'permissions' => $result['result']['rights'] ?? []
                ]
            ]);
        } else {
            throw new Exception('Resposta inválida da API Bitdefender');
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Falha na conexão: ' . $e->getMessage()
        ]);
    }
}

/**
 * Chamar API Bitdefender
 */
function callBitdefenderAPI($accessUrl, $apiKey, $method, $params = []) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/' . $method;

    $payload = json_encode([
        'params' => $params,
        'jsonrpc' => '2.0',
        'method' => $method,
        'id' => uniqid()
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        throw new Exception("Erro cURL: $error");
    }

    if ($httpCode !== 200) {
        throw new Exception("Erro HTTP $httpCode");
    }

    $result = json_decode($response, true);

    if (isset($result['error'])) {
        throw new Exception($result['error']['message'] ?? 'Erro desconhecido da API');
    }

    return $result;
}

/**
 * Obter configuração do sistema
 */
function getSetting($pdo, $key) {
    $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ? $result['setting_value'] : null;
}

/**
 * Salvar configuração do sistema
 */
function setSetting($pdo, $key, $value) {
    $stmt = $pdo->prepare("
        INSERT INTO system_settings (setting_key, setting_value, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()
    ");
    $stmt->execute([$key, $value, $value]);
}
