<?php
// api/bitdefender.php - CRUD for Bitdefender Licenses
session_start();

require_once 'srv/config.php';
require_once 'srv/permissions.php';

// Middleware to check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check Dashboard Access
if (!hasPermission('bitdefender')) {
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
            $stmt = $pdo->prepare('SELECT * FROM bitdefender_licenses WHERE id = ?');
            $stmt->execute([$id]);
            $result = $stmt->fetch();

            if ($result && !isAllowed($result['company'], 'bitdefender')) {
                http_response_code(403);
                echo json_encode(['error' => 'Forbidden: You do not have access to this client']);
                exit;
            }
        } else {
            $sql = 'SELECT * FROM bitdefender_licenses';
            $filter = getClientFilter('bitdefender');

            if ($filter) {
                $placeholders = implode(',', array_fill(0, count($filter), '?'));
                $sql .= " WHERE company IN ($placeholders)";
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
        if (!hasPermission('bitdefender', 'edit')) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have permission to create records']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $sql = "INSERT INTO bitdefender_licenses (user_id, company, contact_person, email, expiration_date, total_licenses, license_key, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $user_id,
            $data['company'] ?? null,
            $data['contact_person'] ?? null,
            $data['email'] ?? null,
            $data['expiration_date'] ?? null,
            $data['total_licenses'] ?? 0,
            $data['license_key'] ?? null,
            $data['renewal_status'] ?? 'Pendente'
        ]);
        $new_id = $pdo->lastInsertId();

        $stmt = $pdo->prepare('SELECT * FROM bitdefender_licenses WHERE id = ?');
        $stmt->execute([$new_id]);
        echo json_encode($stmt->fetch());
        break;

    case 'PUT':
        if (!hasPermission('bitdefender', 'edit')) {
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

        // Build dynamic query
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
        $sql = "UPDATE bitdefender_licenses SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $stmt = $pdo->prepare('SELECT * FROM bitdefender_licenses WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch());
        break;

    case 'DELETE':
        if (!hasPermission('bitdefender', 'delete')) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You do not have permission to delete records']);
            exit;
        }
        $id = $_GET['id'] ?? null;
        if (!$id) {
            // Bulk delete if ids are provided in body
            $data = json_decode(file_get_contents('php://input'), true);
            $ids = $data['ids'] ?? null;
            if (!$ids || !is_array($ids)) {
                http_response_code(400);
                echo json_encode(['error' => 'ID or IDs array is required for deletion']);
                exit;
            }
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "DELETE FROM bitdefender_licenses WHERE id IN ($placeholders)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ids);
            echo json_encode(['success' => true, 'count' => $stmt->rowCount()]);
        } else {
            $stmt = $pdo->prepare('DELETE FROM bitdefender_licenses WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
