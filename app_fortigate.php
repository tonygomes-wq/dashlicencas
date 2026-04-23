<?php
// api/fortigate.php - CRUD for Fortigate Devices
session_start();

require_once 'srv/config.php';
require_once 'srv/permissions.php';

header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check Dashboard Access
if (!hasPermission('fortigate')) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: You do not have access to this dashboard']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare('SELECT * FROM fortigate_devices WHERE id = ?');
            $stmt->execute([$id]);
            $result = $stmt->fetch();

            if ($result && !isAllowed($result['client'], 'fortigate')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: You do not have access to this device']);
                exit;
            }
        } else {
            $sql = 'SELECT * FROM fortigate_devices';
            $filter = getClientFilter('fortigate');

            if ($filter) {
                $placeholders = implode(',', array_fill(0, count($filter), '?'));
                $sql .= " WHERE client IN ($placeholders)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($filter);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            $result = $stmt->fetchAll();
        }
        echo json_encode($result);
        break;

    case 'POST':
        if (!hasPermission('fortigate', 'edit')) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have permission to create records']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO fortigate_devices (user_id, serial, model, client, vencimento, registration_date, email, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $user_id,
            $data['serial'] ?? null,
            $data['model'] ?? null,
            $data['client'] ?? null,
            $data['vencimento'] ?? null,
            $data['registration_date'] ?? null,
            $data['email'] ?? null,
            $data['renewal_status'] ?? 'Pendente'
        ]);
        $new_id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM fortigate_devices WHERE id = ?');
        $stmt->execute([$new_id]);
        echo json_encode($stmt->fetch());
        break;

    case 'PUT':
        if (!hasPermission('fortigate', 'edit')) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have permission to update records']);
            exit;
        }
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required for update']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);

        $fields = [];
        $params = [];
        foreach ($data as $key => $value) {
            if ($key === 'id' || $key === 'user_id' || $key === 'created_at') continue;
            $fields[] = "$key = ?";
            $params[] = $value;
        }

        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit;
        }

        $params[] = $id;
        $sql = "UPDATE fortigate_devices SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM fortigate_devices WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch());
        break;

    case 'DELETE':
        if (!hasPermission('fortigate', 'delete')) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have permission to delete records']);
            exit;
        }
        $id = $_GET['id'] ?? null;
        if (!$id) {
            $data = json_decode(file_get_contents('php://input'), true);
            $ids = $data['ids'] ?? null;
            if (!$ids || !is_array($ids)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID or IDs array is required for deletion']);
                exit;
            }
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "DELETE FROM fortigate_devices WHERE id IN ($placeholders)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ids);
            echo json_encode(['success' => true, 'count' => $stmt->rowCount()]);
        } else {
            $stmt = $pdo->prepare('DELETE FROM fortigate_devices WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
