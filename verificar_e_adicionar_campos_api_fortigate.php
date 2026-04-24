<?php
// Script para verificar e adicionar campos API na tabela fortigate_devices
require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Verificar se os campos existem
    $stmt = $pdo->prepare("DESCRIBE fortigate_devices");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $hasApiToken = in_array('api_token', $columns);
    $hasApiIp = in_array('api_ip', $columns);
    
    $result = [
        'status' => 'checking',
        'columns_found' => $columns,
        'has_api_token' => $hasApiToken,
        'has_api_ip' => $hasApiIp,
        'actions_needed' => []
    ];
    
    // Adicionar campos se não existirem
    if (!$hasApiToken) {
        $pdo->exec("ALTER TABLE fortigate_devices ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status");
        $result['actions_needed'][] = 'Added api_token column';
    }
    
    if (!$hasApiIp) {
        $pdo->exec("ALTER TABLE fortigate_devices ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token");
        $result['actions_needed'][] = 'Added api_ip column';
    }
    
    // Verificar novamente após adicionar
    $stmt = $pdo->prepare("DESCRIBE fortigate_devices");
    $stmt->execute();
    $newColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $result['status'] = 'completed';
    $result['final_columns'] = $newColumns;
    $result['has_api_token_final'] = in_array('api_token', $newColumns);
    $result['has_api_ip_final'] = in_array('api_ip', $newColumns);
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>