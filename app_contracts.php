<?php
/**
 * API de Contratos
 * Gerencia contratos e renovações
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
 * GET - Listar contratos ou estatísticas
 */
function handleGet($pdo, $user) {
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'list':
            listContracts($pdo, $user);
            break;
        case 'stats':
            getStats($pdo, $user);
            break;
        case 'renewals':
            listRenewals($pdo, $user);
            break;
        case 'expiring':
            listExpiring($pdo, $user);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function listContracts($pdo, $user) {
    $status = $_GET['status'] ?? null;
    $serviceType = $_GET['service_type'] ?? null;
    $clientName = $_GET['client_name'] ?? null;

    $whereClause = "1=1";
    $params = [];

    if ($status) {
        $whereClause .= " AND status = ?";
        $params[] = $status;
    }

    if ($serviceType) {
        $whereClause .= " AND service_type = ?";
        $params[] = $serviceType;
    }

    if ($clientName) {
        $whereClause .= " AND client_name LIKE ?";
        $params[] = "%$clientName%";
    }

    $stmt = $pdo->prepare("
        SELECT 
            c.*,
            DATEDIFF(c.end_date, CURDATE()) as days_until_end,
            CASE 
                WHEN DATEDIFF(c.end_date, CURDATE()) < 0 THEN 'expired'
                WHEN DATEDIFF(c.end_date, CURDATE()) <= 30 THEN 'expiring_soon'
                ELSE 'active'
            END as contract_status
        FROM contracts c
        WHERE $whereClause
        ORDER BY c.end_date ASC
    ");
    $stmt->execute($params);
    $contracts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($contracts);
}

function getStats($pdo, $user) {
    // MRR (Monthly Recurring Revenue)
    $stmt = $pdo->query("
        SELECT 
            SUM(monthly_value) as mrr,
            SUM(annual_value) as arr,
            COUNT(*) as total_contracts,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contracts,
            SUM(CASE WHEN status = 'pending_renewal' THEN 1 ELSE 0 END) as pending_renewal,
            SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_contracts,
            SUM(CASE WHEN DATEDIFF(end_date, CURDATE()) <= 30 AND status = 'active' THEN 1 ELSE 0 END) as expiring_soon
        FROM contracts
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Por tipo de serviço
    $stmt = $pdo->query("
        SELECT 
            service_type,
            COUNT(*) as count,
            SUM(monthly_value) as monthly_revenue
        FROM contracts
        WHERE status = 'active'
        GROUP BY service_type
    ");
    $byServiceType = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'overview' => $stats,
        'by_service_type' => $byServiceType
    ]);
}

function listRenewals($pdo, $user) {
    $contractId = $_GET['contract_id'] ?? null;

    if ($contractId) {
        $stmt = $pdo->prepare("
            SELECT r.*, u.email as user_email
            FROM contract_renewals r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.contract_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$contractId]);
    } else {
        $stmt = $pdo->query("
            SELECT 
                r.*,
                c.client_name,
                c.service_type,
                u.email as user_email
            FROM contract_renewals r
            INNER JOIN contracts c ON r.contract_id = c.id
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 100
        ");
    }

    $renewals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($renewals);
}

function listExpiring($pdo, $user) {
    $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;

    $stmt = $pdo->prepare("
        SELECT 
            c.*,
            DATEDIFF(c.end_date, CURDATE()) as days_until_end
        FROM contracts c
        WHERE c.status = 'active'
          AND DATEDIFF(c.end_date, CURDATE()) <= ?
          AND DATEDIFF(c.end_date, CURDATE()) >= 0
        ORDER BY c.end_date ASC
    ");
    $stmt->execute([$days]);
    $contracts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($contracts);
}

/**
 * POST - Criar contrato ou renovação
 */
function handlePost($pdo, $user) {
    $action = $_GET['action'] ?? 'create';
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'create':
            createContract($pdo, $user, $data);
            break;
        case 'renewal':
            createRenewal($pdo, $user, $data);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function createContract($pdo, $user, $data) {
    $required = ['client_name', 'service_type', 'start_date', 'end_date'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Campo obrigatório: $field"]);
            return;
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO contracts 
        (client_name, service_type, contract_number, monthly_value, annual_value,
         start_date, end_date, payment_method, payment_day, status, auto_renew, notes, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['client_name'],
        $data['service_type'],
        $data['contract_number'] ?? null,
        $data['monthly_value'] ?? null,
        $data['annual_value'] ?? null,
        $data['start_date'],
        $data['end_date'],
        $data['payment_method'] ?? null,
        $data['payment_day'] ?? null,
        $data['status'] ?? 'active',
        $data['auto_renew'] ?? false,
        $data['notes'] ?? null,
        $user['id']
    ]);

    $id = $pdo->lastInsertId();
    echo json_encode(['id' => $id, 'success' => true]);
}

function createRenewal($pdo, $user, $data) {
    if (!isset($data['contract_id']) || !isset($data['stage'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Campos obrigatórios: contract_id, stage']);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO contract_renewals 
        (contract_id, stage, previous_value, proposed_value, notes, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['contract_id'],
        $data['stage'],
        $data['previous_value'] ?? null,
        $data['proposed_value'] ?? null,
        $data['notes'] ?? null,
        $user['id']
    ]);

    // Atualizar status do contrato
    if ($data['stage'] === 'renewed') {
        $pdo->prepare("UPDATE contracts SET status = 'active' WHERE id = ?")
            ->execute([$data['contract_id']]);
    } elseif ($data['stage'] === 'cancelled') {
        $pdo->prepare("UPDATE contracts SET status = 'cancelled' WHERE id = ?")
            ->execute([$data['contract_id']]);
    } else {
        $pdo->prepare("UPDATE contracts SET status = 'pending_renewal' WHERE id = ?")
            ->execute([$data['contract_id']]);
    }

    $id = $pdo->lastInsertId();
    echo json_encode(['id' => $id, 'success' => true]);
}

/**
 * PUT - Atualizar contrato ou renovação
 */
function handlePut($pdo, $user) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        return;
    }

    $action = $_GET['action'] ?? 'update';
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'update':
            updateContract($pdo, $user, $id, $data);
            break;
        case 'renewal':
            updateRenewal($pdo, $user, $id, $data);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function updateContract($pdo, $user, $id, $data) {
    $allowedFields = [
        'client_name', 'service_type', 'contract_number', 'monthly_value', 'annual_value',
        'start_date', 'end_date', 'payment_method', 'payment_day', 'status', 'auto_renew', 'notes'
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

    $params[] = $id;
    $stmt = $pdo->prepare("
        UPDATE contracts 
        SET " . implode(', ', $updates) . "
        WHERE id = ?
    ");
    $stmt->execute($params);

    echo json_encode(['success' => true]);
}

function updateRenewal($pdo, $user, $id, $data) {
    $allowedFields = ['stage', 'previous_value', 'proposed_value', 'notes'];

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

    $params[] = $id;
    $stmt = $pdo->prepare("
        UPDATE contract_renewals 
        SET " . implode(', ', $updates) . "
        WHERE id = ?
    ");
    $stmt->execute($params);

    echo json_encode(['success' => true]);
}

/**
 * DELETE - Remover contrato
 */
function handleDelete($pdo, $user) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        return;
    }

    // Apenas admins podem deletar contratos
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM contracts WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
}
