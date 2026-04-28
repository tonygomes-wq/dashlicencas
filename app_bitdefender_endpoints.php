<?php
/**
 * API de Endpoints Bitdefender
 * Gerencia inventário de dispositivos protegidos pelo Bitdefender
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
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN protection_status = 'protected' THEN 1 ELSE 0 END) as protected,
            SUM(CASE WHEN protection_status = 'at_risk' THEN 1 ELSE 0 END) as at_risk,
            SUM(CASE WHEN protection_status = 'offline' THEN 1 ELSE 0 END) as offline,
            SUM(CASE WHEN last_seen > DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as online_24h
        FROM bitdefender_endpoints
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode($stats);
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

/**
 * Sincronizar endpoints de um cliente específico
 */
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
        $endpoints = callBitdefenderAPI($accessUrl, $apiKey, 'getEndpointsList', [
            'perPage' => 100,
            'page' => 1
        ]);

        if (!$endpoints || !isset($endpoints['result'])) {
            return ['error' => 'Resposta inválida da API Bitdefender'];
        }

        $processed = 0;
        $created = 0;
        $updated = 0;

        foreach ($endpoints['result']['items'] as $endpoint) {
            $endpointId = $endpoint['id'];
            $name = $endpoint['name'] ?? 'Unknown';
            $ip = $endpoint['ip'] ?? null;
            $mac = $endpoint['mac'] ?? null;
            $os = $endpoint['operatingSystemVersion'] ?? null;
            $agentVersion = $endpoint['agent']['version'] ?? null;
            
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
        return ['error' => $e->getMessage()];
    }
}

/**
 * Chamar API Bitdefender
 */
function callBitdefenderAPI($accessUrl, $apiKey, $method, $params = []) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/' . $method;

    $payload = json_encode([
        'params' => $params,
        'jsonrpc' => '2.0',
        'method' => $method,
        'id' => uniqid()
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Erro na API Bitdefender: HTTP $httpCode");
    }

    return json_decode($response, true);
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
