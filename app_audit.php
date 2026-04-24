<?php
/**
 * API de Auditoria
 * Gerencia logs de auditoria do sistema
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

// Verificar autenticação
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
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Listar logs de auditoria
 */
function handleGet($pdo, $user) {
    // Apenas admins podem ver logs de auditoria
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        return;
    }

    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;

    // Filtros
    $filters = [];
    $params = [];

    if (isset($_GET['user_id'])) {
        $filters[] = "user_id = ?";
        $params[] = $_GET['user_id'];
    }

    if (isset($_GET['action'])) {
        $filters[] = "action = ?";
        $params[] = $_GET['action'];
    }

    if (isset($_GET['table_name'])) {
        $filters[] = "table_name = ?";
        $params[] = $_GET['table_name'];
    }

    if (isset($_GET['date_from'])) {
        $filters[] = "created_at >= ?";
        $params[] = $_GET['date_from'] . ' 00:00:00';
    }

    if (isset($_GET['date_to'])) {
        $filters[] = "created_at <= ?";
        $params[] = $_GET['date_to'] . ' 23:59:59';
    }

    $whereClause = !empty($filters) ? 'WHERE ' . implode(' AND ', $filters) : '';

    // Contar total
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM audit_log $whereClause");
    $countStmt->execute($params);
    $total = $countStmt->fetchColumn();

    // Buscar logs
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare("
        SELECT * FROM audit_log 
        $whereClause
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute($params);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decodificar JSON
    foreach ($logs as &$log) {
        if ($log['old_values']) {
            $log['old_values'] = json_decode($log['old_values'], true);
        }
        if ($log['new_values']) {
            $log['new_values'] = json_decode($log['new_values'], true);
        }
    }

    echo json_encode([
        'logs' => $logs,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Criar log de auditoria
 */
function handlePost($pdo, $user) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['action']) || !isset($data['table_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios: action, table_name']);
        return;
    }

    createAuditLog(
        $pdo,
        $user['id'],
        $user['email'],
        $data['action'],
        $data['table_name'],
        $data['record_id'] ?? null,
        $data['old_values'] ?? null,
        $data['new_values'] ?? null
    );

    echo json_encode(['success' => true]);
}

/**
 * Função auxiliar para criar log de auditoria
 * Pode ser chamada de outros arquivos PHP
 */
function createAuditLog($pdo, $userId, $userEmail, $action, $tableName, $recordId = null, $oldValues = null, $newValues = null) {
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

    $stmt = $pdo->prepare("
        INSERT INTO audit_log 
        (user_id, user_email, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $userId,
        $userEmail,
        $action,
        $tableName,
        $recordId,
        $oldValues ? json_encode($oldValues) : null,
        $newValues ? json_encode($newValues) : null,
        $ipAddress,
        $userAgent
    ]);

    return $pdo->lastInsertId();
}

/**
 * Função para registrar ações automaticamente
 * Uso: logAuditAction($pdo, $user, 'create', 'bitdefender_licenses', $id, null, $newData);
 */
function logAuditAction($pdo, $user, $action, $tableName, $recordId, $oldValues = null, $newValues = null) {
    try {
        createAuditLog(
            $pdo,
            $user['id'],
            $user['email'],
            $action,
            $tableName,
            $recordId,
            $oldValues,
            $newValues
        );
    } catch (Exception $e) {
        // Log silencioso - não deve quebrar a operação principal
        error_log("Erro ao criar log de auditoria: " . $e->getMessage());
    }
}
