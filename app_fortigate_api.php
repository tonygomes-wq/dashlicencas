<?php
/**
 * API Endpoint para gerenciamento da integração FortiGate API
 * 
 * Endpoints:
 * GET    /app_fortigate_api.php?action=get_config&device_id=X
 * POST   /app_fortigate_api.php?action=save_config
 * POST   /app_fortigate_api.php?action=test_connection
 * POST   /app_fortigate_api.php?action=sync_device
 * POST   /app_fortigate_api.php?action=sync_all
 * GET    /app_fortigate_api.php?action=get_history&device_id=X
 * GET    /app_fortigate_api.php?action=get_alerts
 * POST   /app_fortigate_api.php?action=resolve_alert
 * DELETE /app_fortigate_api.php?action=delete_config&device_id=X
 */

header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/srv/Database.php';
require_once __DIR__ . '/srv/FortigateSync.php';
require_once __DIR__ . '/srv/Auth.php';

// Verificar autenticação
$auth = new Auth();
if (!$auth->isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

$user = $auth->getCurrentUser();
$isAdmin = $user['role'] === 'admin';

// Conectar ao banco
try {
    $db = Database::getInstance()->getConnection();
    $sync = new FortigateSync($db);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao conectar ao banco de dados']);
    exit;
}

// Obter ação
$action = $_GET['action'] ?? $_POST['action'] ?? null;

if (!$action) {
    http_response_code(400);
    echo json_encode(['error' => 'Ação não especificada']);
    exit;
}

// Processar ações
try {
    switch ($action) {
        case 'get_config':
            handleGetConfig($sync, $_GET);
            break;
            
        case 'save_config':
            handleSaveConfig($sync, $isAdmin);
            break;
            
        case 'test_connection':
            handleTestConnection($sync);
            break;
            
        case 'sync_device':
            handleSyncDevice($sync);
            break;
            
        case 'sync_all':
            handleSyncAll($sync, $isAdmin);
            break;
            
        case 'get_history':
            handleGetHistory($db, $_GET);
            break;
            
        case 'get_extended_data':
            handleGetExtendedData($db, $_GET);
            break;
            
        case 'get_alerts':
            handleGetAlerts($db, $_GET);
            break;
            
        case 'resolve_alert':
            handleResolveAlert($db, $user['id']);
            break;
            
        case 'delete_config':
            handleDeleteConfig($db, $isAdmin, $_GET);
            break;
            
        case 'get_stats':
            handleGetStats($db);
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// ==================== HANDLERS ====================

function handleGetConfig($sync, $params) {
    $deviceId = $params['device_id'] ?? null;
    
    if (!$deviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id é obrigatório']);
        return;
    }
    
    $config = $sync->getAPIConfig($deviceId);
    
    if ($config) {
        // Remover token da resposta por segurança
        unset($config['api_token']);
        unset($config['api_token_encrypted']);
        echo json_encode($config);
    } else {
        echo json_encode(['api_enabled' => false]);
    }
}

function handleSaveConfig($sync, $isAdmin) {
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado. Apenas administradores podem configurar API.']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $deviceId = $data['device_id'] ?? null;
    $apiIp = $data['api_ip'] ?? null;
    $apiToken = $data['api_token'] ?? null;
    $apiPort = $data['api_port'] ?? 443;
    $verifySsl = $data['verify_ssl'] ?? true;
    $syncInterval = $data['sync_interval'] ?? 60;
    
    if (!$deviceId || !$apiIp || !$apiToken) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id, api_ip e api_token são obrigatórios']);
        return;
    }
    
    // Validar IP
    if (!FortigateAPI::validateIP($apiIp)) {
        http_response_code(400);
        echo json_encode(['error' => 'IP inválido']);
        return;
    }
    
    $result = $sync->saveAPIConfig($deviceId, $apiIp, $apiToken, $apiPort, $verifySsl, $syncInterval);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Configuração salva com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao salvar configuração']);
    }
}

function handleTestConnection($sync) {
    $data = json_decode(file_get_contents('php://input'), true);
    $deviceId = $data['device_id'] ?? null;
    
    if (!$deviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id é obrigatório']);
        return;
    }
    
    $result = $sync->testConnection($deviceId);
    echo json_encode($result);
}

function handleSyncDevice($sync) {
    $data = json_decode(file_get_contents('php://input'), true);
    $deviceId = $data['device_id'] ?? null;
    
    if (!$deviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id é obrigatório']);
        return;
    }
    
    $result = $sync->syncDevice($deviceId);
    echo json_encode($result);
}

function handleSyncAll($sync, $isAdmin) {
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        return;
    }
    
    $results = $sync->syncAllDevices();
    echo json_encode([
        'success' => true,
        'results' => $results,
        'total' => count($results),
        'successful' => count(array_filter($results, fn($r) => $r['success']))
    ]);
}

function handleGetHistory($db, $params) {
    $deviceId = $params['device_id'] ?? null;
    $limit = $params['limit'] ?? 50;
    
    if (!$deviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id é obrigatório']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT * FROM fortigate_sync_history
        WHERE device_id = ?
        ORDER BY sync_started_at DESC
        LIMIT ?
    ");
    $stmt->execute([$deviceId, (int)$limit]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($history);
}

function handleGetExtendedData($db, $params) {
    $deviceId = $params['device_id'] ?? null;
    
    if (!$deviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id é obrigatório']);
        return;
    }
    
    $stmt = $db->prepare("
        SELECT * FROM fortigate_devices_extended
        WHERE device_id = ?
    ");
    $stmt->execute([$deviceId]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo json_encode($data);
    } else {
        echo json_encode(['message' => 'Nenhum dado encontrado']);
    }
}

function handleGetAlerts($db, $params) {
    $deviceId = $params['device_id'] ?? null;
    $unreadOnly = isset($params['unread_only']) && $params['unread_only'] === 'true';
    $limit = $params['limit'] ?? 100;
    
    $sql = "SELECT a.*, d.client, d.serial 
            FROM fortigate_alerts a
            JOIN fortigate_devices d ON a.device_id = d.id
            WHERE 1=1";
    
    $bindings = [];
    
    if ($deviceId) {
        $sql .= " AND a.device_id = ?";
        $bindings[] = $deviceId;
    }
    
    if ($unreadOnly) {
        $sql .= " AND a.is_read = FALSE";
    }
    
    $sql .= " AND a.is_resolved = FALSE";
    $sql .= " ORDER BY a.created_at DESC LIMIT ?";
    $bindings[] = (int)$limit;
    
    $stmt = $db->prepare($sql);
    $stmt->execute($bindings);
    $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($alerts);
}

function handleResolveAlert($db, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    $alertId = $data['alert_id'] ?? null;
    
    if (!$alertId) {
        http_response_code(400);
        echo json_encode(['error' => 'alert_id é obrigatório']);
        return;
    }
    
    $stmt = $db->prepare("
        UPDATE fortigate_alerts
        SET is_resolved = TRUE,
            resolved_at = NOW(),
            resolved_by = ?
        WHERE id = ?
    ");
    
    $result = $stmt->execute([$userId, $alertId]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Alerta resolvido']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao resolver alerta']);
    }
}

function handleDeleteConfig($db, $isAdmin, $params) {
    if (!$isAdmin) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        return;
    }
    
    $deviceId = $params['device_id'] ?? null;
    
    if (!$deviceId) {
        http_response_code(400);
        echo json_encode(['error' => 'device_id é obrigatório']);
        return;
    }
    
    $stmt = $db->prepare("DELETE FROM fortigate_api_config WHERE device_id = ?");
    $result = $stmt->execute([$deviceId]);
    
    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Configuração removida']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao remover configuração']);
    }
}

function handleGetStats($db) {
    // Estatísticas gerais da API
    $stats = [];
    
    // Total de dispositivos com API configurada
    $stmt = $db->query("SELECT COUNT(*) as total FROM fortigate_api_config WHERE api_enabled = TRUE");
    $stats['devices_with_api'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Última sincronização bem-sucedida
    $stmt = $db->query("
        SELECT COUNT(*) as total 
        FROM fortigate_api_config 
        WHERE last_sync_status = 'success' 
        AND last_sync_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ");
    $stats['synced_last_hour'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Alertas não resolvidos
    $stmt = $db->query("SELECT COUNT(*) as total FROM fortigate_alerts WHERE is_resolved = FALSE");
    $stats['unresolved_alerts'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Alertas críticos
    $stmt = $db->query("
        SELECT COUNT(*) as total 
        FROM fortigate_alerts 
        WHERE is_resolved = FALSE AND severity = 'critical'
    ");
    $stats['critical_alerts'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Dispositivos com licenças expirando (próximos 30 dias)
    $stmt = $db->query("
        SELECT COUNT(DISTINCT device_id) as total
        FROM fortigate_devices_extended
        WHERE (
            forticare_expiration BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
            OR antivirus_expiration BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
            OR ips_expiration BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
            OR web_filtering_expiration BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
        )
    ");
    $stats['licenses_expiring_30_days'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode($stats);
}
