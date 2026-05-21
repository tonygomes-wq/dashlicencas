<?php
/**
 * EXEMPLO DE IMPLEMENTAÇÃO DE PERMISSÕES NO BACKEND
 * Para app_hardware.php e app_hardware_clients.php
 * 
 * Este arquivo mostra como aplicar as verificações de permissões
 * nos endpoints de hardware inventory
 */

// ============================================
// EXEMPLO 1: app_hardware_clients.php
// ============================================

// --- LIST (GET) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    // Verificar permissão de dashboard
    if (!hasPermission('hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado ao módulo de hardware']);
        exit;
    }

    // Aplicar filtro de clientes
    $filter = getClientFilter('hardware');
    
    $sql = "SELECT * FROM hardware_clients WHERE 1=1";
    $params = [];
    
    if ($filter !== null) {
        if (empty($filter)) {
            // Usuário não tem acesso a nenhum cliente
            echo json_encode([]);
            exit;
        }
        
        // Filtrar por IDs permitidos
        $placeholders = implode(',', array_fill(0, count($filter), '?'));
        $sql .= " AND id IN ($placeholders)";
        $params = $filter;
    }
    
    $sql .= " ORDER BY client_name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $clients = $stmt->fetchAll();
    
    echo json_encode($clients);
    exit;
}

// --- GET BY ID ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = $_GET['id'];
    
    // Verificar permissão de dashboard
    if (!hasPermission('hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado']);
        exit;
    }
    
    // Buscar cliente
    $stmt = $pdo->prepare("SELECT * FROM hardware_clients WHERE id = ?");
    $stmt->execute([$id]);
    $client = $stmt->fetch();
    
    if (!$client) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente não encontrado']);
        exit;
    }
    
    // Verificar se usuário tem acesso a este cliente
    if (!isAllowed($id, 'hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado a este cliente']);
        exit;
    }
    
    echo json_encode($client);
    exit;
}

// --- CREATE (POST) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar permissão de dashboard e ação
    if (!hasPermission('hardware', 'edit')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para criar clientes']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validações...
    if (empty($data['client_name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome do cliente é obrigatório']);
        exit;
    }
    
    // Inserir cliente
    $stmt = $pdo->prepare("
        INSERT INTO hardware_clients 
        (client_name, contact_person, email, phone, address, notes, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['client_name'],
        $data['contact_person'] ?? null,
        $data['email'] ?? null,
        $data['phone'] ?? null,
        $data['address'] ?? null,
        $data['notes'] ?? null,
        $_SESSION['user_id']
    ]);
    
    $newId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'id' => $newId,
        'message' => 'Cliente criado com sucesso'
    ]);
    exit;
}

// --- UPDATE (PUT) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['id'])) {
    $id = $_GET['id'];
    
    // Verificar permissão de dashboard e ação
    if (!hasPermission('hardware', 'edit')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para editar']);
        exit;
    }
    
    // Verificar se usuário tem acesso a este cliente
    if (!isAllowed($id, 'hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado a este cliente']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Atualizar cliente
    $stmt = $pdo->prepare("
        UPDATE hardware_clients 
        SET client_name = ?, 
            contact_person = ?, 
            email = ?, 
            phone = ?, 
            address = ?, 
            notes = ?
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
    
    echo json_encode([
        'success' => true,
        'message' => 'Cliente atualizado com sucesso'
    ]);
    exit;
}

// --- DELETE ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    $id = $_GET['id'];
    
    // Verificar permissão de dashboard e ação
    if (!hasPermission('hardware', 'delete')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para excluir']);
        exit;
    }
    
    // Verificar se usuário tem acesso a este cliente
    if (!isAllowed($id, 'hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado a este cliente']);
        exit;
    }
    
    // Verificar se há dispositivos associados
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM hardware_inventory WHERE client_name = (SELECT client_name FROM hardware_clients WHERE id = ?)");
    $stmt->execute([$id]);
    $result = $stmt->fetch();
    
    if ($result['count'] > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Não é possível excluir cliente com dispositivos associados']);
        exit;
    }
    
    // Deletar cliente
    $stmt = $pdo->prepare("DELETE FROM hardware_clients WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Cliente excluído com sucesso'
    ]);
    exit;
}


// ============================================
// EXEMPLO 2: app_hardware.php (Dispositivos)
// ============================================

// --- LIST (GET) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id'])) {
    // Verificar permissão de dashboard
    if (!hasPermission('hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Acesso negado ao módulo de hardware']);
        exit;
    }

    // Aplicar filtro de clientes
    $filter = getClientFilter('hardware');
    
    $sql = "SELECT * FROM hardware_inventory WHERE 1=1";
    $params = [];
    
    if ($filter !== null) {
        if (empty($filter)) {
            // Usuário não tem acesso a nenhum cliente
            echo json_encode([]);
            exit;
        }
        
        // Buscar nomes dos clientes pelos IDs
        $placeholders = implode(',', array_fill(0, count($filter), '?'));
        $stmt = $pdo->prepare("SELECT client_name FROM hardware_clients WHERE id IN ($placeholders)");
        $stmt->execute($filter);
        $clientNames = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($clientNames)) {
            echo json_encode([]);
            exit;
        }
        
        // Filtrar dispositivos por nomes de clientes
        $placeholders = implode(',', array_fill(0, count($clientNames), '?'));
        $sql .= " AND client_name IN ($placeholders)";
        $params = $clientNames;
    }
    
    $sql .= " ORDER BY device_name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $devices = $stmt->fetchAll();
    
    // Processar storage_devices (JSON)
    foreach ($devices as &$device) {
        if (isset($device['storage_devices'])) {
            $device['storage_devices'] = json_decode($device['storage_devices'], true) ?? [];
        }
    }
    
    echo json_encode($devices);
    exit;
}

// --- CREATE (POST) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar permissão de dashboard e ação
    if (!hasPermission('hardware', 'edit')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para criar dispositivos']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validar campos obrigatórios
    $required = ['device_name', 'device_type', 'client_name', 'cpu_model', 'ram_size'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Campo obrigatório: $field"]);
            exit;
        }
    }
    
    // Verificar se o cliente existe e se usuário tem acesso
    $stmt = $pdo->prepare("SELECT id FROM hardware_clients WHERE client_name = ?");
    $stmt->execute([$data['client_name']]);
    $client = $stmt->fetch();
    
    if (!$client) {
        http_response_code(400);
        echo json_encode(['error' => 'Cliente não encontrado']);
        exit;
    }
    
    // Verificar permissão para este cliente
    if (!isAllowed($client['id'], 'hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para adicionar dispositivos a este cliente']);
        exit;
    }
    
    // Inserir dispositivo
    $stmt = $pdo->prepare("
        INSERT INTO hardware_inventory 
        (device_name, device_type, client_name, location, cpu_model, cpu_cores, 
         cpu_frequency, ram_size, ram_type, ram_speed, storage_devices, os_name, 
         os_version, mac_address, ip_address, serial_number, manufacturer, model, 
         purchase_date, warranty_expiration, notes, status, user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        json_encode($data['storage_devices'] ?? []),
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
        $_SESSION['user_id']
    ]);
    
    $newId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'id' => $newId,
        'message' => 'Dispositivo criado com sucesso'
    ]);
    exit;
}

// --- UPDATE (PUT) ---
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['id'])) {
    $id = $_GET['id'];
    
    // Verificar permissão de dashboard e ação
    if (!hasPermission('hardware', 'edit')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para editar']);
        exit;
    }
    
    // Buscar dispositivo atual
    $stmt = $pdo->prepare("SELECT * FROM hardware_inventory WHERE id = ?");
    $stmt->execute([$id]);
    $device = $stmt->fetch();
    
    if (!$device) {
        http_response_code(404);
        echo json_encode(['error' => 'Dispositivo não encontrado']);
        exit;
    }
    
    // Buscar ID do cliente
    $stmt = $pdo->prepare("SELECT id FROM hardware_clients WHERE client_name = ?");
    $stmt->execute([$device['client_name']]);
    $client = $stmt->fetch();
    
    // Verificar permissão para este cliente
    if ($client && !isAllowed($client['id'], 'hardware')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para editar dispositivos deste cliente']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Se mudou o cliente, verificar permissão no novo cliente também
    if (isset($data['client_name']) && $data['client_name'] !== $device['client_name']) {
        $stmt = $pdo->prepare("SELECT id FROM hardware_clients WHERE client_name = ?");
        $stmt->execute([$data['client_name']]);
        $newClient = $stmt->fetch();
        
        if ($newClient && !isAllowed($newClient['id'], 'hardware')) {
            http_response_code(403);
            echo json_encode(['error' => 'Sem permissão para mover dispositivo para este cliente']);
            exit;
        }
    }
    
    // Atualizar dispositivo (código de UPDATE aqui)
    // ...
    
    echo json_encode([
        'success' => true,
        'message' => 'Dispositivo atualizado com sucesso'
    ]);
    exit;
}

// --- DELETE ---
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Verificar permissão de dashboard e ação
    if (!hasPermission('hardware', 'delete')) {
        http_response_code(403);
        echo json_encode(['error' => 'Sem permissão para excluir']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Bulk delete
    if (isset($data['ids']) && is_array($data['ids'])) {
        $ids = $data['ids'];
        
        // Buscar todos os dispositivos e verificar permissões
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $stmt = $pdo->prepare("SELECT id, client_name FROM hardware_inventory WHERE id IN ($placeholders)");
        $stmt->execute($ids);
        $devices = $stmt->fetchAll();
        
        foreach ($devices as $device) {
            // Buscar ID do cliente
            $stmt = $pdo->prepare("SELECT id FROM hardware_clients WHERE client_name = ?");
            $stmt->execute([$device['client_name']]);
            $client = $stmt->fetch();
            
            // Verificar permissão
            if ($client && !isAllowed($client['id'], 'hardware')) {
                http_response_code(403);
                echo json_encode(['error' => 'Sem permissão para excluir dispositivos de alguns clientes']);
                exit;
            }
        }
        
        // Deletar todos
        $stmt = $pdo->prepare("DELETE FROM hardware_inventory WHERE id IN ($placeholders)");
        $stmt->execute($ids);
        
        echo json_encode([
            'success' => true,
            'message' => count($ids) . ' dispositivo(s) excluído(s) com sucesso'
        ]);
        exit;
    }
    
    // Single delete
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        
        // Buscar dispositivo
        $stmt = $pdo->prepare("SELECT client_name FROM hardware_inventory WHERE id = ?");
        $stmt->execute([$id]);
        $device = $stmt->fetch();
        
        if (!$device) {
            http_response_code(404);
            echo json_encode(['error' => 'Dispositivo não encontrado']);
            exit;
        }
        
        // Buscar ID do cliente
        $stmt = $pdo->prepare("SELECT id FROM hardware_clients WHERE client_name = ?");
        $stmt->execute([$device['client_name']]);
        $client = $stmt->fetch();
        
        // Verificar permissão
        if ($client && !isAllowed($client['id'], 'hardware')) {
            http_response_code(403);
            echo json_encode(['error' => 'Sem permissão para excluir dispositivos deste cliente']);
            exit;
        }
        
        // Deletar
        $stmt = $pdo->prepare("DELETE FROM hardware_inventory WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Dispositivo excluído com sucesso'
        ]);
        exit;
    }
}

?>
