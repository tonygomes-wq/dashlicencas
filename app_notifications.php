<?php
/**
 * API de Notificações
 * Gerencia notificações do sistema e configurações de usuário
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($pdo, $user);
            break;
        case 'POST':
            handlePost($pdo, $user);
            break;
        case 'PUT':
            handlePut($pdo, $user);
            break;
        case 'DELETE':
            handleDelete($pdo, $user);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * GET - Listar notificações ou configurações
 */
function handleGet($pdo, $user) {
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'list':
            listNotifications($pdo, $user);
            break;
        case 'unread_count':
            getUnreadCount($pdo, $user);
            break;
        case 'settings':
            getSettings($pdo, $user);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function listNotifications($pdo, $user) {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $onlyUnread = isset($_GET['unread']) && $_GET['unread'] === 'true';

    $whereClause = "user_id = ?";
    $params = [$user['id']];

    if ($onlyUnread) {
        $whereClause .= " AND is_read = FALSE";
    }

    $stmt = $pdo->prepare("
        SELECT * FROM notifications
        WHERE $whereClause
        ORDER BY created_at DESC
        LIMIT ?
    ");
    $params[] = $limit;
    $stmt->execute($params);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($notifications);
}

function getUnreadCount($pdo, $user) {
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ? AND is_read = FALSE
    ");
    $stmt->execute([$user['id']]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['count' => (int)$result['count']]);
}

function getSettings($pdo, $user) {
    $stmt = $pdo->prepare("SELECT * FROM notification_settings WHERE user_id = ?");
    $stmt->execute([$user['id']]);
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$settings) {
        // Criar configurações padrão
        $stmt = $pdo->prepare("
            INSERT INTO notification_settings (user_id) VALUES (?)
        ");
        $stmt->execute([$user['id']]);
        
        $stmt = $pdo->prepare("SELECT * FROM notification_settings WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    echo json_encode($settings);
}

/**
 * POST - Criar notificação
 */
function handlePost($pdo, $user) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['type']) || !isset($data['title'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios: type, title']);
        return;
    }

    $notificationId = createNotification(
        $pdo,
        $data['user_id'] ?? $user['id'],
        $data['type'],
        $data['title'],
        $data['message'] ?? null,
        $data['related_table'] ?? null,
        $data['related_id'] ?? null,
        $data['priority'] ?? 'normal'
    );

    echo json_encode(['id' => $notificationId, 'success' => true]);
}

/**
 * PUT - Atualizar notificação ou configurações
 */
function handlePut($pdo, $user) {
    $action = $_GET['action'] ?? 'mark_read';
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'mark_read':
            markAsRead($pdo, $user, $data);
            break;
        case 'mark_all_read':
            markAllAsRead($pdo, $user);
            break;
        case 'settings':
            updateSettings($pdo, $user, $data);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function markAsRead($pdo, $user, $data) {
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'ID da notificação é obrigatório']);
        return;
    }

    $stmt = $pdo->prepare("
        UPDATE notifications 
        SET is_read = TRUE, read_at = NOW()
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$data['id'], $user['id']]);

    echo json_encode(['success' => true]);
}

function markAllAsRead($pdo, $user) {
    $stmt = $pdo->prepare("
        UPDATE notifications 
        SET is_read = TRUE, read_at = NOW()
        WHERE user_id = ? AND is_read = FALSE
    ");
    $stmt->execute([$user['id']]);

    echo json_encode(['success' => true, 'updated' => $stmt->rowCount()]);
}

function updateSettings($pdo, $user, $data) {
    $allowedFields = [
        'email_enabled', 'email_frequency',
        'notify_license_30_days', 'notify_license_7_days', 'notify_license_expired',
        'notify_warranty_30_days', 'notify_sync_failed'
    ];

    $updates = [];
    $params = [];

    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        return;
    }

    $params[] = $user['id'];
    $stmt = $pdo->prepare("
        UPDATE notification_settings 
        SET " . implode(', ', $updates) . "
        WHERE user_id = ?
    ");
    $stmt->execute($params);

    echo json_encode(['success' => true]);
}

/**
 * DELETE - Remover notificação
 */
function handleDelete($pdo, $user) {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID da notificação é obrigatório']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user['id']]);

    echo json_encode(['success' => true]);
}

/**
 * Função auxiliar para criar notificação
 */
function createNotification($pdo, $userId, $type, $title, $message = null, $relatedTable = null, $relatedId = null, $priority = 'normal') {
    $stmt = $pdo->prepare("
        INSERT INTO notifications 
        (user_id, type, title, message, related_table, related_id, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $userId,
        $type,
        $title,
        $message,
        $relatedTable,
        $relatedId,
        $priority
    ]);

    return $pdo->lastInsertId();
}

/**
 * Função para criar notificação para todos os admins
 */
function notifyAdmins($pdo, $type, $title, $message = null, $relatedTable = null, $relatedId = null, $priority = 'normal') {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    $stmt->execute();
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($admins as $admin) {
        createNotification($pdo, $admin['id'], $type, $title, $message, $relatedTable, $relatedId, $priority);
    }
}
