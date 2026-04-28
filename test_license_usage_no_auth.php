<?php
/**
 * Teste do endpoint de uso de licença SEM autenticação (apenas para debug)
 * REMOVER APÓS TESTES!
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/srv/config.php';

$action = $_GET['action'] ?? 'list';

try {
    if ($action === 'list') {
        // Verificar se colunas existem
        $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'used_slots'");
        $hasUsageColumns = $stmt->rowCount() > 0;
        
        if (!$hasUsageColumns) {
            echo json_encode([
                'success' => true,
                'message' => 'Colunas de uso não existem ainda',
                'has_usage_columns' => false,
                'licenses' => []
            ], JSON_PRETTY_PRINT);
            exit;
        }
        
        // Buscar dados
        $stmt = $pdo->query("
            SELECT 
                id,
                company,
                license_key,
                total_licenses,
                expiration_date,
                used_slots,
                total_slots,
                license_usage_percent,
                license_usage_alert,
                license_usage_last_sync
            FROM bitdefender_licenses
            ORDER BY license_usage_percent DESC, company
            LIMIT 5
        ");
        
        $licenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'has_usage_columns' => true,
            'total_licenses' => count($licenses),
            'licenses' => $licenses
        ], JSON_PRETTY_PRINT);
        
    } elseif ($action === 'alerts') {
        // Verificar se colunas existem
        $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'used_slots'");
        $hasUsageColumns = $stmt->rowCount() > 0;
        
        if (!$hasUsageColumns) {
            echo json_encode([
                'success' => true,
                'message' => 'Colunas de uso não existem ainda',
                'alerts' => []
            ], JSON_PRETTY_PRINT);
            exit;
        }
        
        $stmt = $pdo->query("
            SELECT 
                id,
                company,
                license_key,
                used_slots,
                total_slots,
                license_usage_percent
            FROM bitdefender_licenses
            WHERE license_usage_percent >= 70
            ORDER BY license_usage_percent DESC
        ");
        
        $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'total_alerts' => count($alerts),
            'alerts' => $alerts
        ], JSON_PRETTY_PRINT);
        
    } else {
        echo json_encode([
            'error' => 'Ação inválida',
            'action_received' => $action,
            'valid_actions' => ['list', 'alerts']
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
