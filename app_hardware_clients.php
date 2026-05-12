<?php
// app_hardware_clients.php - Hardware Clients API
session_start();
require_once 'srv/config.php';

header('Content-Type: application/json');

// Check authentication
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'];

try {
    switch ($method) {
        case 'GET':
            handleGet($pdo, $userId);
            break;
        case 'POST':
            handlePost($pdo, $userId);
            break;
        case 'PUT':
            handlePut($pdo, $userId);
            break;
        case 'DELETE':
            handleDelete($pdo, $userId);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handleGet($pdo, $userId) {
    $id = $_GET['id'] ?? null;
    
    if ($id) {
        // Get single client
        $stmt = $pdo->prepare("SELECT * FROM hardware_clients WHERE id = ?");
        $stmt->execute([$id]);
        $client = $stmt->fetch();
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente não encontrado']);
            return;
        }
        
        // Get device count
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as device_count FROM hardware_devices WHERE client_name = ?");
        $stmtCount->execute([$client['client_name']]);
        $count = $stmtCount->fetch();
        $client['device_count'] = $count['device_count'];
        
        echo json_encode($client);
    } else {
        // Get all clients with device counts
        $stmt = $pdo->query("SELECT * FROM hardware_clients ORDER BY client_name");
        $clients = $stmt->fetchAll();
        
        foreach ($clients as &$client) {
            $stmtCount = $pdo->prepare("SELECT COUNT(*) as device_count FROM hardware_devices WHERE client_name = ?");
            $stmtCount->execute([$client['client_name']]);
            $count = $stmtCount->fetch();
            $client['device_count'] = $count['device_count'];
        }
        
        echo json_encode($clients);
    }
}

function handlePost($pdo, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || empty($data['client_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome do cliente é obrigatório']);
        return;
    }
    
    // Check if client already exists
    $stmtCheck = $pdo->prepare("SELECT id FROM hardware_clients WHERE client_name = ?");
    $stmtCheck->execute([$data['client_name']]);
    if ($stmtCheck->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Cliente já existe']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO hardware_clients (
                client_name, contact_person, email, phone, address, notes, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['client_name'],
            $data['contact_person'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['notes'] ?? null,
            $userId
        ]);
        
        $clientId = $pdo->lastInsertId();
        
        // Return created client
        $stmt = $pdo->prepare("SELECT * FROM hardware_clients WHERE id = ?");
        $stmt->execute([$clientId]);
        $client = $stmt->fetch();
        $client['device_count'] = 0;
        
        http_response_code(201);
        echo json_encode($client);
        
    } catch (Exception $e) {
        throw $e;
    }
}

function handlePut($pdo, $userId) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['client_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome do cliente é obrigatório']);
        return;
    }
    
    try {
        // Get old client name
        $stmtOld = $pdo->prepare("SELECT client_name FROM hardware_clients WHERE id = ?");
        $stmtOld->execute([$id]);
        $oldClient = $stmtOld->fetch();
        
        if (!$oldClient) {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente não encontrado']);
            return;
        }
        
        $pdo->beginTransaction();
        
        // Update client
        $stmt = $pdo->prepare("
            UPDATE hardware_clients SET
                client_name = ?, contact_person = ?, email = ?, phone = ?, address = ?, notes = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['client_name'],
            $data['contact_person'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['notes'] ?? null,
            $id
        ]);
        
        // If client name changed, update all devices
        if ($oldClient['client_name'] !== $data['client_name']) {
            $stmtDevices = $pdo->prepare("UPDATE hardware_devices SET client_name = ? WHERE client_name = ?");
            $stmtDevices->execute([$data['client_name'], $oldClient['client_name']]);
        }
        
        $pdo->commit();
        
        // Return updated client
        $stmt = $pdo->prepare("SELECT * FROM hardware_clients WHERE id = ?");
        $stmt->execute([$id]);
        $client = $stmt->fetch();
        
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as device_count FROM hardware_devices WHERE client_name = ?");
        $stmtCount->execute([$client['client_name']]);
        $count = $stmtCount->fetch();
        $client['device_count'] = $count['device_count'];
        
        echo json_encode($client);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handleDelete($pdo, $userId) {
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        return;
    }
    
    try {
        // Get client name
        $stmt = $pdo->prepare("SELECT client_name FROM hardware_clients WHERE id = ?");
        $stmt->execute([$id]);
        $client = $stmt->fetch();
        
        if (!$client) {
            http_response_code(404);
            echo json_encode(['error' => 'Cliente não encontrado']);
            return;
        }
        
        // Check if client has devices
        $stmtCount = $pdo->prepare("SELECT COUNT(*) as device_count FROM hardware_devices WHERE client_name = ?");
        $stmtCount->execute([$client['client_name']]);
        $count = $stmtCount->fetch();
        
        if ($count['device_count'] > 0) {
            http_response_code(409);
            echo json_encode([
                'error' => 'Não é possível excluir cliente com dispositivos cadastrados',
                'device_count' => $count['device_count']
            ]);
            return;
        }
        
        // Delete client
        $stmt = $pdo->prepare("DELETE FROM hardware_clients WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
        
    } catch (Exception $e) {
        throw $e;
    }
}
