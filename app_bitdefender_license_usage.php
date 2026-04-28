<?php
/**
 * API para obter informações de uso de licença Bitdefender
 * Retorna dados de assentos usados vs disponíveis para cada cliente
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

$method = $_SERVER['REQUEST_METHOD'];

// Debug: Log do método recebido
error_log("app_bitdefender_license_usage.php - Método: $method");
error_log("app_bitdefender_license_usage.php - Query String: " . ($_SERVER['QUERY_STRING'] ?? 'vazio'));

try {
    switch ($method) {
        case 'GET':
            handleGet($pdo);
            break;
        case 'POST':
            handlePost($pdo);
            break;
        default:
            error_log("app_bitdefender_license_usage.php - Método não permitido: $method");
            http_response_code(405);
            echo json_encode([
                'error' => 'Method not allowed',
                'method_received' => $method,
                'allowed_methods' => ['GET', 'POST']
            ]);
    }
} catch (Exception $e) {
    error_log("app_bitdefender_license_usage.php - Erro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * GET - Listar uso de licenças de todos os clientes
 */
function handleGet($pdo) {
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'list':
            listLicenseUsage($pdo);
            break;
        case 'alerts':
            getLicenseAlerts($pdo);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function listLicenseUsage($pdo) {
    // Verificar se colunas existem
    $hasUsageColumns = checkUsageColumns($pdo);
    
    if (!$hasUsageColumns) {
        // Retornar dados básicos se colunas não existem
        $stmt = $pdo->query("
            SELECT 
                id,
                company,
                license_key,
                total_licenses,
                expiration_date,
                0 as used_slots,
                0 as total_slots,
                0.00 as license_usage_percent,
                FALSE as license_usage_alert,
                NULL as license_usage_last_sync
            FROM bitdefender_licenses
            ORDER BY company
        ");
    } else {
        $stmt = $pdo->query("
            SELECT 
                id,
                company,
                license_key,
                total_licenses,
                expiration_date,
                used_slots,
                total_slots,
                license_usage_percent,
                license_usage_alert,
                license_usage_last_sync
            FROM bitdefender_licenses
            ORDER BY license_usage_percent DESC, company
        ");
    }
    
    $licenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calcular estatísticas gerais
    $stats = [
        'total_clients' => count($licenses),
        'clients_with_alerts' => 0,
        'total_used_slots' => 0,
        'total_available_slots' => 0,
        'average_usage_percent' => 0
    ];
    
    foreach ($licenses as &$license) {
        // Calcular valores se não existirem
        if (!$hasUsageColumns) {
            $license['used_slots'] = 0;
            $license['total_slots'] = $license['total_licenses'];
            $license['license_usage_percent'] = 0.00;
            $license['license_usage_alert'] = false;
            $license['needs_sync'] = true;
        } else {
            $license['needs_sync'] = false;
        }
        
        // Adicionar informações extras
        $license['free_slots'] = max(0, $license['total_slots'] - $license['used_slots']);
        $license['over_limit'] = $license['used_slots'] > $license['total_slots'];
        
        // Determinar status
        if ($license['over_limit']) {
            $license['status'] = 'critical';
            $license['status_message'] = 'LIMITE EXCEDIDO';
        } elseif ($license['license_usage_percent'] >= 90) {
            $license['status'] = 'warning';
            $license['status_message'] = 'Uso Alto (≥90%)';
            $stats['clients_with_alerts']++;
        } elseif ($license['license_usage_percent'] >= 70) {
            $license['status'] = 'attention';
            $license['status_message'] = 'Atenção (≥70%)';
        } else {
            $license['status'] = 'ok';
            $license['status_message'] = 'OK';
        }
        
        // Atualizar estatísticas
        $stats['total_used_slots'] += $license['used_slots'];
        $stats['total_available_slots'] += $license['total_slots'];
    }
    
    if ($stats['total_available_slots'] > 0) {
        $stats['average_usage_percent'] = round(
            ($stats['total_used_slots'] / $stats['total_available_slots']) * 100,
            2
        );
    }
    
    echo json_encode([
        'success' => true,
        'has_usage_columns' => $hasUsageColumns,
        'stats' => $stats,
        'licenses' => $licenses
    ]);
}

function getLicenseAlerts($pdo) {
    $hasUsageColumns = checkUsageColumns($pdo);
    
    if (!$hasUsageColumns) {
        echo json_encode([
            'success' => true,
            'alerts' => [],
            'message' => 'Colunas de uso não encontradas. Execute a sincronização primeiro.'
        ]);
        return;
    }
    
    $stmt = $pdo->query("
        SELECT 
            id,
            company,
            license_key,
            used_slots,
            total_slots,
            license_usage_percent,
            license_usage_last_sync
        FROM bitdefender_licenses
        WHERE license_usage_percent >= 70
        ORDER BY license_usage_percent DESC
    ");
    
    $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($alerts as &$alert) {
        $alert['free_slots'] = max(0, $alert['total_slots'] - $alert['used_slots']);
        $alert['over_limit'] = $alert['used_slots'] > $alert['total_slots'];
        
        if ($alert['over_limit']) {
            $alert['severity'] = 'critical';
            $alert['message'] = "Limite excedido! {$alert['used_slots']} de {$alert['total_slots']} assentos usados.";
        } elseif ($alert['license_usage_percent'] >= 90) {
            $alert['severity'] = 'high';
            $alert['message'] = "Uso alto: {$alert['used_slots']} de {$alert['total_slots']} assentos ({$alert['license_usage_percent']}%)";
        } else {
            $alert['severity'] = 'medium';
            $alert['message'] = "Atenção: {$alert['used_slots']} de {$alert['total_slots']} assentos ({$alert['license_usage_percent']}%)";
        }
    }
    
    echo json_encode([
        'success' => true,
        'total_alerts' => count($alerts),
        'alerts' => $alerts
    ]);
}

/**
 * POST - Sincronizar uso de licença de um cliente específico
 */
function handlePost($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['client_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'client_id é obrigatório']);
        return;
    }
    
    $result = syncClientLicenseUsage($pdo, $data['client_id']);
    echo json_encode($result);
}

function syncClientLicenseUsage($pdo, $clientId) {
    // Buscar informações do cliente
    $stmt = $pdo->prepare("
        SELECT id, company, client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE id = ?
    ");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        return ['error' => 'Cliente não encontrado'];
    }
    
    if (!$client['client_api_key']) {
        return ['error' => 'Cliente não possui API Key configurada'];
    }
    
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
    
    try {
        // Chamar API Bitdefender para obter informações de licença
        $licenseInfo = callBitdefenderAPI($accessUrl, $client['client_api_key'], 'getLicenseInfo', []);
        
        if (!$licenseInfo || !isset($licenseInfo['result'])) {
            return ['error' => 'Resposta inválida da API Bitdefender'];
        }
        
        $result = $licenseInfo['result'];
        $usedSlots = $result['usedSlots'] ?? 0;
        $totalSlots = $result['totalSlots'] ?? 0;
        $usagePercent = $totalSlots > 0 ? round(($usedSlots / $totalSlots) * 100, 2) : 0;
        $hasAlert = $usagePercent >= 90;
        
        // Verificar se colunas existem, se não, criar
        ensureUsageColumns($pdo);
        
        // Atualizar banco de dados
        $stmt = $pdo->prepare("
            UPDATE bitdefender_licenses 
            SET used_slots = ?,
                total_slots = ?,
                license_usage_percent = ?,
                license_usage_alert = ?,
                license_usage_last_sync = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$usedSlots, $totalSlots, $usagePercent, $hasAlert ? 1 : 0, $clientId]);
        
        return [
            'success' => true,
            'client' => $client['company'],
            'data' => [
                'used_slots' => $usedSlots,
                'total_slots' => $totalSlots,
                'free_slots' => max(0, $totalSlots - $usedSlots),
                'usage_percent' => $usagePercent,
                'has_alert' => $hasAlert,
                'over_limit' => $usedSlots > $totalSlots
            ]
        ];
        
    } catch (Exception $e) {
        return ['error' => $e->getMessage()];
    }
}

function callBitdefenderAPI($accessUrl, $apiKey, $method, $params = []) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/licensing';
    
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
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Erro na API Bitdefender: HTTP $httpCode");
    }
    
    return json_decode($response, true);
}

function checkUsageColumns($pdo) {
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'used_slots'");
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        return false;
    }
}

function ensureUsageColumns($pdo) {
    if (!checkUsageColumns($pdo)) {
        $pdo->exec("
            ALTER TABLE bitdefender_licenses
            ADD COLUMN used_slots INT DEFAULT 0 COMMENT 'Número de assentos usados',
            ADD COLUMN total_slots INT DEFAULT 0 COMMENT 'Número total de assentos disponíveis',
            ADD COLUMN license_usage_percent DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentual de uso da licença',
            ADD COLUMN license_usage_last_sync DATETIME NULL COMMENT 'Data da última sincronização de uso',
            ADD COLUMN license_usage_alert BOOLEAN DEFAULT FALSE COMMENT 'Alerta de uso de licença (>= 90%)'
        ");
        
        $pdo->exec("CREATE INDEX idx_license_usage_alert ON bitdefender_licenses(license_usage_alert)");
        $pdo->exec("CREATE INDEX idx_license_usage_percent ON bitdefender_licenses(license_usage_percent)");
    }
}
