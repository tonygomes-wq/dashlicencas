<?php
// test_bitdefender_sync.php - Testar sincronização Bitdefender

session_start();
$_SESSION['user_id'] = 1; // Simular usuário logado

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Verificar se tabela de log existe
    $tables = $pdo->query("SHOW TABLES LIKE 'bitdefender_sync_log'")->fetchAll();
    $logTableExists = count($tables) > 0;
    
    // Buscar um cliente com API Key configurada
    $stmt = $pdo->query("
        SELECT id, company, client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE client_api_key IS NOT NULL AND client_api_key != ''
        LIMIT 1
    ");
    $clientWithKey = $stmt->fetch();
    
    // Buscar total de clientes
    $totalClients = $pdo->query("SELECT COUNT(*) FROM bitdefender_licenses")->fetchColumn();
    
    // Buscar clientes com API Key
    $clientsWithKey = $pdo->query("
        SELECT COUNT(*) FROM bitdefender_licenses 
        WHERE client_api_key IS NOT NULL AND client_api_key != ''
    ")->fetchColumn();
    
    echo json_encode([
        'success' => true,
        'system_status' => [
            'log_table_exists' => $logTableExists,
            'total_clients' => $totalClients,
            'clients_with_api_key' => $clientsWithKey,
            'sync_endpoint' => '/app_bitdefender_sync_client.php'
        ],
        'test_client' => $clientWithKey ? [
            'id' => $clientWithKey['id'],
            'company' => $clientWithKey['company'],
            'has_api_key' => !empty($clientWithKey['client_api_key']),
            'access_url' => $clientWithKey['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api'
        ] : null,
        'instructions' => [
            '1. Configure API Key em um cliente (botão Editar)',
            '2. Clique no botão "Sincronizar" ao lado do cliente',
            '3. Sistema buscará dados da API Bitdefender',
            '4. Licenças e vencimento serão atualizados automaticamente'
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
