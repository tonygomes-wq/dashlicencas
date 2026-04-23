<?php
// app_hardware.php - Hardware Inventory API
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
        // Get single device with storage
        $stmt = $pdo->prepare("SELECT * FROM hardware_devices WHERE id = ?");
        $stmt->execute([$id]);
        $device = $stmt->fetch();
        
        if (!$device) {
            http_response_code(404);
            echo json_encode(['error' => 'Dispositivo não encontrado']);
            return;
        }
        
        // Get storage devices
        $stmtStorage = $pdo->prepare("SELECT * FROM storage_devices WHERE hardware_id = ?");
        $stmtStorage->execute([$id]);
        $device['storage_devices'] = $stmtStorage->fetchAll();
        
        echo json_encode($device);
    } else {
        // Get all devices with storage
        $stmt = $pdo->query("SELECT * FROM hardware_devices ORDER BY device_name");
        $devices = $stmt->fetchAll();
        
        foreach ($devices as &$device) {
            $stmtStorage = $pdo->prepare("SELECT * FROM storage_devices WHERE hardware_id = ?");
            $stmtStorage->execute([$device['id']]);
            $device['storage_devices'] = $stmtStorage->fetchAll();
        }
        
        echo json_encode($devices);
    }
}

function handlePost($pdo, $userId) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        return;
    }
    
    $pdo->beginTransaction();
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO hardware_devices (
                device_name, device_type, client_name, location,
                cpu_model, cpu_cores, cpu_frequency,
                ram_size, ram_type, ram_speed,
                os_name, os_version,
                mac_address, ip_address,
                serial_number, manufacturer, model,
                purchase_date, warranty_expiration, notes,
                status, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['device_name'],
            $data['device_type'],
            $data['client_name'],
            $data['location'] ?? null,
            $data['cpu_model'],
            $data['cpu_cores'] ?? null,
            $data['cpu_frequency'] ?? null,
            $data['ram_size'],
            $data['ram_type'] ?? null,
            $data['ram_speed'] ?? null,
            $data['os_name'] ?? null,
            $data['os_version'] ?? null,
            $data['mac_address'] ?? null,
            $data['ip_address'] ?? null,
            $data['serial_number'] ?? null,
            $data['manufacturer'] ?? null,
            $data['model'] ?? null,
            $data['purchase_date'] ?? null,
            $data['warranty_expiration'] ?? null,
            $data['notes'] ?? null,
            $data['status'] ?? 'Ativo',
            $userId
        ]);
        
        $deviceId = $pdo->lastInsertId();
        
        // Insert storage devices
        if (!empty($data['storage_devices'])) {
            $stmtStorage = $pdo->prepare("
                INSERT INTO storage_devices (hardware_id, type, capacity, manufacturer, model, interface)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            foreach ($data['storage_devices'] as $storage) {
                $stmtStorage->execute([
                    $deviceId,
                    $storage['type'],
                    $storage['capacity'],
                    $storage['manufacturer'] ?? null,
                    $storage['model'] ?? null,
                    $storage['interface'] ?? null
                ]);
            }
        }
        
        $pdo->commit();
        
        // Return created device
        $stmt = $pdo->prepare("SELECT * FROM hardware_devices WHERE id = ?");
        $stmt->execute([$deviceId]);
        $device = $stmt->fetch();
        
        $stmtStorage = $pdo->prepare("SELECT * FROM storage_devices WHERE hardware_id = ?");
        $stmtStorage->execute([$deviceId]);
        $device['storage_devices'] = $stmtStorage->fetchAll();
        
        http_response_code(201);
        echo json_encode($device);
        
    } catch (Exception $e) {
        $pdo->rollBack();
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
    
    $pdo->beginTransaction();
    
    try {
        $stmt = $pdo->prepare("
            UPDATE hardware_devices SET
                device_name = ?, device_type = ?, client_name = ?, location = ?,
                cpu_model = ?, cpu_cores = ?, cpu_frequency = ?,
                ram_size = ?, ram_type = ?, ram_speed = ?,
                os_name = ?, os_version = ?,
                mac_address = ?, ip_address = ?,
                serial_number = ?, manufacturer = ?, model = ?,
                purchase_date = ?, warranty_expiration = ?, notes = ?,
                status = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['device_name'],
            $data['device_type'],
            $data['client_name'],
            $data['location'] ?? null,
            $data['cpu_model'],
            $data['cpu_cores'] ?? null,
            $data['cpu_frequency'] ?? null,
            $data['ram_size'],
            $data['ram_type'] ?? null,
            $data['ram_speed'] ?? null,
            $data['os_name'] ?? null,
            $data['os_version'] ?? null,
            $data['mac_address'] ?? null,
            $data['ip_address'] ?? null,
            $data['serial_number'] ?? null,
            $data['manufacturer'] ?? null,
            $data['model'] ?? null,
            $data['purchase_date'] ?? null,
            $data['warranty_expiration'] ?? null,
            $data['notes'] ?? null,
            $data['status'] ?? 'Ativo',
            $id
        ]);
        
        // Update storage devices
        if (isset($data['storage_devices'])) {
            // Delete existing storage
            $pdo->prepare("DELETE FROM storage_devices WHERE hardware_id = ?")->execute([$id]);
            
            // Insert new storage
            if (!empty($data['storage_devices'])) {
                $stmtStorage = $pdo->prepare("
                    INSERT INTO storage_devices (hardware_id, type, capacity, manufacturer, model, interface)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                foreach ($data['storage_devices'] as $storage) {
                    $stmtStorage->execute([
                        $id,
                        $storage['type'],
                        $storage['capacity'],
                        $storage['manufacturer'] ?? null,
                        $storage['model'] ?? null,
                        $storage['interface'] ?? null
                    ]);
                }
            }
        }
        
        $pdo->commit();
        
        // Return updated device
        $stmt = $pdo->prepare("SELECT * FROM hardware_devices WHERE id = ?");
        $stmt->execute([$id]);
        $device = $stmt->fetch();
        
        $stmtStorage = $pdo->prepare("SELECT * FROM storage_devices WHERE hardware_id = ?");
        $stmtStorage->execute([$id]);
        $device['storage_devices'] = $stmtStorage->fetchAll();
        
        echo json_encode($device);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
}

function handleDelete($pdo, $userId) {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($id) {
        // Delete single device
        $stmt = $pdo->prepare("DELETE FROM hardware_devices WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    } elseif (!empty($data['ids'])) {
        // Bulk delete
        $placeholders = implode(',', array_fill(0, count($data['ids']), '?'));
        $stmt = $pdo->prepare("DELETE FROM hardware_devices WHERE id IN ($placeholders)");
        $stmt->execute($data['ids']);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
    }
}
