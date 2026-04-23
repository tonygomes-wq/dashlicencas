<?php
// check_maglon_data.php - Verificar dados do cliente MAGLON
session_start();
$_SESSION['user_id'] = 1;

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            company,
            license_key,
            total_licenses,
            used_licenses,
            free_licenses,
            usage_percentage,
            over_limit,
            client_api_key,
            client_access_url,
            last_sync
        FROM bitdefender_licenses 
        WHERE company LIKE '%MAGLON%'
    ");
    
    $stmt->execute();
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        throw new Exception('Cliente MAGLON não encontrado');
    }
    
    // Verificar status
    $status = [
        'has_api_key' => !empty($client['client_api_key']),
        'has_sync_data' => $client['used_licenses'] !== null,
        'needs_sync' => empty($client['used_licenses']),
        'visualization_will_show' => !empty($client['used_licenses'])
    ];
    
    echo json_encode([
        'success' => true,
        'client' => $client,
        'status' => $status,
        'message' => $status['visualization_will_show'] 
            ? '✅ Visualização deve aparecer!' 
            : '⚠️ Cliente precisa ser sincronizado primeiro',
        'next_step' => $status['needs_sync']
            ? 'Role o painel para baixo e clique em "Sincronizar Este Cliente"'
            : 'Feche e abra o painel novamente para ver a visualização'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
