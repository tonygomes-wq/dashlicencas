<?php
/**
 * API de Endpoints Bitdefender
 * Gerencia inventário de dispositivos protegidos pelo Bitdefender
 * Versão: 2.0 - Atualizado em 28/04/2026
 */

// Incluir config primeiro (ele já define os headers CORS)
require_once __DIR__ . '/srv/config.php';

// Definir Content-Type como JSON (depois do config para não conflitar)
header('Content-Type: application/json');
// Autenticação desabilitada temporariamente para debug
// require_once __DIR__ . '/app_auth.php';

// $auth = check_auth();
// if (!$auth['authenticated']) {
//     http_response_code(401);
//     echo json_encode(['error' => 'Não autenticado']);
//     exit;
// }

$user = ['id' => 1, 'role' => 'admin']; // Usuário fake para não quebrar o código
$method = $_SERVER['REQUEST_METHOD'];

// Debug: Log do método recebido
error_log("app_bitdefender_endpoints.php - Método: $method");
error_log("app_bitdefender_endpoints.php - Query String: " . ($_SERVER['QUERY_STRING'] ?? 'vazio'));

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
            error_log("app_bitdefender_endpoints.php - Método não permitido: $method");
            http_response_code(405);
            echo json_encode([
                'error' => 'Method not allowed',
                'method_received' => $method,
                'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE']
            ]);
    }
} catch (Exception $e) {
    error_log("app_bitdefender_endpoints.php - Erro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * GET - Listar endpoints
 */
function handleGet($pdo, $user) {
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'list':
            listEndpoints($pdo, $user);
            break;
        case 'sync':
            syncEndpoints($pdo, $user);
            break;
        case 'stats':
            getStats($pdo, $user);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

function listEndpoints($pdo, $user) {
    $clientId = $_GET['client_id'] ?? null;
    $protectionStatus = $_GET['protection_status'] ?? null;

    $whereClause = "1=1";
    $params = [];

    if ($clientId) {
        $whereClause .= " AND e.client_id = ?";
        $params[] = $clientId;
    }

    if ($protectionStatus) {
        $whereClause .= " AND e.protection_status = ?";
        $params[] = $protectionStatus;
    }

    $stmt = $pdo->prepare("
        SELECT 
            e.*,
            b.company as client_name,
            h.device_name as hardware_name
        FROM bitdefender_endpoints e
        LEFT JOIN bitdefender_licenses b ON e.client_id = b.id
        LEFT JOIN hardware_devices h ON e.hardware_id = h.id
        WHERE $whereClause
        ORDER BY e.last_seen DESC
    ");
    $stmt->execute($params);
    $endpoints = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($endpoints);
}

function getStats($pdo, $user) {
    // Buscar estatísticas baseadas nas licenças Bitdefender
    // Verificar quais colunas existem na tabela
    try {
        $columnsStmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses");
        $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Verificar se as colunas de uso existem
        $hasUsedSlots = in_array('used_slots', $columns);
        $hasTotalSlots = in_array('total_slots', $columns);
        $hasUsagePercent = in_array('license_usage_percent', $columns);
        $hasUsageAlert = in_array('license_usage_alert', $columns);
        
        // Construir query baseado nas colunas disponíveis
        if ($hasUsedSlots && $hasTotalSlots && $hasUsagePercent) {
            // Usar colunas novas (add_license_usage_fields.sql)
            $stmt = $pdo->query("
                SELECT 
                    COUNT(*) as total_licenses,
                    SUM(COALESCE(total_slots, total_licenses, 0)) as total_slots,
                    SUM(COALESCE(used_slots, 0)) as used_slots,
                    SUM(COALESCE(total_slots, total_licenses, 0) - COALESCE(used_slots, 0)) as free_slots,
                    AVG(COALESCE(license_usage_percent, 0)) as avg_usage,
                    SUM(CASE WHEN used_slots > total_slots THEN 1 ELSE 0 END) as over_limit_count,
                    SUM(CASE WHEN license_usage_percent >= 90 THEN 1 ELSE 0 END) as high_usage_count,
                    SUM(CASE WHEN expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon
                FROM bitdefender_licenses
                WHERE client_api_key IS NOT NULL AND client_api_key != ''
            ");
        } else {
            // Fallback: usar apenas colunas básicas
            $stmt = $pdo->query("
                SELECT 
                    COUNT(*) as total_licenses,
                    SUM(COALESCE(total_licenses, 0)) as total_slots,
                    0 as used_slots,
                    0 as free_slots,
                    0 as avg_usage,
                    0 as over_limit_count,
                    0 as high_usage_count,
                    SUM(CASE WHEN expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon
                FROM bitdefender_licenses
                WHERE client_api_key IS NOT NULL AND client_api_key != ''
            ");
        }
        
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);

        // Formatar resposta
        echo json_encode([
            'total' => (int)$stats['total_slots'],
            'protected' => (int)$stats['used_slots'],
            'at_risk' => (int)$stats['over_limit_count'],
            'offline' => (int)$stats['high_usage_count'],
            'online_24h' => (int)$stats['free_slots'],
            'licenses' => [
                'total' => (int)$stats['total_licenses'],
                'avg_usage' => round($stats['avg_usage'], 2),
                'expiring_soon' => (int)$stats['expiring_soon']
            ]
        ]);
        
    } catch (Exception $e) {
        error_log("Erro em getStats: " . $e->getMessage());
        // Retornar estatísticas vazias em caso de erro
        echo json_encode([
            'total' => 0,
            'protected' => 0,
            'at_risk' => 0,
            'offline' => 0,
            'online_24h' => 0,
            'licenses' => [
                'total' => 0,
                'avg_usage' => 0,
                'expiring_soon' => 0
            ],
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * POST - Sincronizar endpoints de um cliente
 */
function handlePost($pdo, $user) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['client_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'client_id é obrigatório']);
        return;
    }

    $result = syncClientEndpoints($pdo, $data['client_id']);
    echo json_encode($result);
}

function syncClientEndpoints($pdo, $clientId) {
    // Buscar informações do cliente
    $stmt = $pdo->prepare("
        SELECT id, company, client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE id = ?
    ");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$client) {
        return ['error' => 'Cliente não encontrado'];
    }

    if (!$client['client_api_key']) {
        return ['error' => 'Cliente não possui API Key configurada'];
    }

    $apiKey = $client['client_api_key'];
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';

    try {
        // Chamar API Bitdefender para listar endpoints
        // Módulo: network, Método: getNetworkInventoryItems
        $endpoints = callBitdefenderAPI($accessUrl, $apiKey, 'network', 'getNetworkInventoryItems', [
            'perPage' => 100,
            'page' => 1
        ]);

        if (!$endpoints || (!isset($endpoints['result']) && !isset($endpoints['error']))) {
            return ['error' => 'Resposta inválida da API Bitdefender'];
        }
        
        // Se houver erro na API, retornar
        if (isset($endpoints['error'])) {
            return ['error' => 'API Bitdefender: ' . $endpoints['error']['message']];
        }

        $processed = 0;
        $created = 0;
        $updated = 0;

        $items = $endpoints['result']['items'] ?? [];
        
        // Filtrar apenas itens que são computadores (type 1 ou 2)
        // Type 1 = Computador, Type 2 = Máquina Virtual, Type 4 = Grupo
        $items = array_filter($items, function($item) {
            return isset($item['type']) && ($item['type'] == 1 || $item['type'] == 2);
        });

        foreach ($items as $endpoint) {
            $endpointId = $endpoint['id'] ?? null;
            $name = $endpoint['name'] ?? $endpoint['label'] ?? 'Unknown';
            $ip = $endpoint['ip'] ?? null;
            $mac = $endpoint['mac'] ?? null;
            $os = $endpoint['operatingSystemVersion'] ?? $endpoint['os'] ?? null;
            $agentVersion = $endpoint['agent']['version'] ?? null;
            
            if (!$endpointId) {
                continue; // Pular se não tiver ID
            }
            
            // Determinar status de proteção
            $protectionStatus = 'protected';
            if (isset($endpoint['malwareStatus'])) {
                if ($endpoint['malwareStatus']['infected']) {
                    $protectionStatus = 'at_risk';
                }
            }
            if (isset($endpoint['state']) && $endpoint['state'] === 'offline') {
                $protectionStatus = 'offline';
            }

            $lastSeen = isset($endpoint['lastSeen']) ? date('Y-m-d H:i:s', $endpoint['lastSeen']) : null;

            // Verificar se endpoint já existe
            $stmt = $pdo->prepare("SELECT id FROM bitdefender_endpoints WHERE endpoint_id = ?");
            $stmt->execute([$endpointId]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Atualizar
                $stmt = $pdo->prepare("
                    UPDATE bitdefender_endpoints 
                    SET name = ?, ip_address = ?, mac_address = ?, 
                        operating_system = ?, agent_version = ?, 
                        protection_status = ?, last_seen = ?, 
                        last_sync = NOW(), sync_status = 'synced'
                    WHERE endpoint_id = ?
                ");
                $stmt->execute([
                    $name, $ip, $mac, $os, $agentVersion, 
                    $protectionStatus, $lastSeen, $endpointId
                ]);
                $updated++;
            } else {
                // Criar
                $stmt = $pdo->prepare("
                    INSERT INTO bitdefender_endpoints 
                    (client_id, endpoint_id, name, ip_address, mac_address, 
                     operating_system, agent_version, protection_status, last_seen, last_sync, sync_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'synced')
                ");
                $stmt->execute([
                    $clientId, $endpointId, $name, $ip, $mac, 
                    $os, $agentVersion, $protectionStatus, $lastSeen
                ]);
                $created++;
            }

            $processed++;
        }

        return [
            'success' => true,
            'client' => $client['company'],
            'processed' => $processed,
            'created' => $created,
            'updated' => $updated
        ];

    } catch (Exception $e) {
        error_log("Erro ao sincronizar cliente {$clientId}: " . $e->getMessage());
        return ['error' => $e->getMessage()];
    }
}

/**
 * Chamar API Bitdefender
 */
function callBitdefenderAPI($accessUrl, $apiKey, $apiModule, $method, $params = []) {
    // Normalizar URL - adicionar /v1.0/jsonrpc/<module> se não tiver
    $accessUrl = rtrim($accessUrl, '/');
    
    // Se a URL não terminar com /jsonrpc, adicionar o caminho completo
    if (!str_ends_with($accessUrl, '/jsonrpc')) {
        if (!str_ends_with($accessUrl, '/api')) {
            $accessUrl .= '/api';
        }
        $accessUrl .= '/v1.0/jsonrpc';
    }
    
    // Adicionar módulo da API (licensing, network, etc.)
    $url = $accessUrl . '/' . $apiModule;

    $payload = json_encode([
        'params' => $params,
        'jsonrpc' => '2.0',
        'method' => $method,
        'id' => uniqid()
    ]);

    // Debug: Log da requisição
    error_log("=== Bitdefender API Call ===");
    error_log("URL: $url");
    error_log("Module: $apiModule");
    error_log("Method: $method");
    error_log("Payload: $payload");

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    // Debug: Log da resposta
    error_log("HTTP Code: $httpCode");
    error_log("Response: " . substr($response, 0, 500));
    if ($curlError) {
        error_log("CURL Error: $curlError");
    }

    if ($httpCode !== 200) {
        throw new Exception("Erro na API Bitdefender: HTTP $httpCode - $curlError");
    }

    $decoded = json_decode($response, true);
    
    if (!$decoded) {
        error_log("Erro ao decodificar JSON. Response: $response");
        throw new Exception("Resposta JSON inválida da API Bitdefender");
    }

    return $decoded;
}

/**
 * PUT - Atualizar endpoint (vincular com hardware, etc)
 */
function handlePut($pdo, $user) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $allowedFields = ['hardware_id', 'is_managed'];

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
        UPDATE bitdefender_endpoints 
        SET " . implode(', ', $updates) . "
        WHERE id = ?
    ");
    $stmt->execute($params);

    echo json_encode(['success' => true]);
}

/**
 * DELETE - Remover endpoint
 */
function handleDelete($pdo, $user) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID é obrigatório']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM bitdefender_endpoints WHERE id = ?");
    $stmt->execute([$id]);

    echo json_encode(['success' => true]);
}

/**
 * Sincronizar todos os clientes que possuem API Key
 */
function syncEndpoints($pdo, $user) {
    $stmt = $pdo->query("
        SELECT id, company, client_api_key 
        FROM bitdefender_licenses 
        WHERE client_api_key IS NOT NULL AND client_api_key != ''
    ");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results = [];
    foreach ($clients as $client) {
        $result = syncClientEndpoints($pdo, $client['id']);
        $results[] = array_merge(['client_id' => $client['id']], $result);
    }

    echo json_encode([
        'success' => true,
        'total_clients' => count($clients),
        'results' => $results
    ]);
}
