<?php
require_once 'app_config.php';

header('Content-Type: application/json');

// Session check
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

try {
    switch ($method) {
        case 'GET':
            // List all diagrams or get a specific one
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM network_diagrams WHERE id = ? AND user_id = ?");
                $stmt->execute([$id, $user_id]);
                $diagram = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!$diagram) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Diagram not found']);
                    exit;
                }
                echo json_encode($diagram);
            } else {
                $stmt = $pdo->prepare("SELECT id, name, created_at, updated_at FROM network_diagrams WHERE user_id = ? ORDER BY updated_at DESC");
                $stmt->execute([$user_id]);
                $diagrams = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($diagrams);
            }
            break;

        case 'POST':
            // Create or Update diagram
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON data']);
                exit;
            }

            $id = $data['id'] ?? null;
            $name = $data['name'] ?? 'Novo Diagrama';
            $json_data = json_encode($data['data']);

            if ($id) {
                $stmt = $pdo->prepare("UPDATE network_diagrams SET name = ?, data = ?, updated_at = NOW() WHERE id = ? AND user_id = ?");
                $stmt->execute([$name, $json_data, $id, $user_id]);
                echo json_encode(['success' => true, 'id' => (int)$id]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO network_diagrams (user_id, name, data) VALUES (?, ?, ?)");
                $stmt->execute([$user_id, $name, $json_data]);
                echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
            }
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM network_diagrams WHERE id = ? AND user_id = ?");
            $stmt->execute([$id, $user_id]);
            echo json_encode(['success' => true]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    error_log("Database error in app_diagrams.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("Error in app_diagrams.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
