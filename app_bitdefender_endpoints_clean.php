<?php
/**
 * API de Endpoints Bitdefender - Versão Limpa
 * SEM warnings, SEM output antes do JSON
 */

// INICIAR OUTPUT BUFFERING IMEDIATAMENTE
ob_start();

// Desabilitar TODOS os erros visíveis
error_reporting(0);
ini_set('display_errors', '0');

// Incluir config
require_once __DIR__ . '/srv/config.php';

// Limpar qualquer output que possa ter sido gerado
ob_clean();

// Agora sim, definir headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$user = ['id' => 1, 'role' => 'admin'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'list';
        
        if ($action === 'stats') {
            // Buscar estatísticas
            $columnsStmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses");
            $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $hasUsedSlots = in_array('used_slots', $columns);
            $hasTotalSlots = in_array('total_slots', $columns);
            $hasUsagePercent = in_array('license_usage_percent', $columns);
            
            if ($hasUsedSlots && $hasTotalSlots && $hasUsagePercent) {
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
            
            $result = [
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
            ];
            
            // Limpar buffer e enviar JSON puro
            ob_clean();
            echo json_encode($result);
            exit;
        }
    }
    
    // Ação não suportada
    ob_clean();
    http_response_code(400);
    echo json_encode(['error' => 'Ação não suportada nesta versão']);
    
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

ob_end_flush();
