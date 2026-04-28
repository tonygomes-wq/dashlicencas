<?php
/**
 * Teste do endpoint de estatísticas
 */

// Habilitar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TESTE DO ENDPOINT DE ESTATÍSTICAS ===\n\n";

// Simular requisição GET com action=stats
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'stats';

echo "1. Incluindo config.php...\n";
require_once __DIR__ . '/srv/config.php';
echo "   ✓ Config carregado\n\n";

echo "2. Testando query de estatísticas...\n";
try {
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total_licenses,
            SUM(COALESCE(total_licenses, 0)) as total_slots,
            SUM(COALESCE(used_licenses, 0)) as used_slots,
            SUM(COALESCE(free_licenses, 0)) as free_slots,
            AVG(COALESCE(usage_percentage, 0)) as avg_usage,
            SUM(CASE WHEN over_limit = 1 THEN 1 ELSE 0 END) as over_limit_count,
            SUM(CASE WHEN usage_percentage >= 90 THEN 1 ELSE 0 END) as high_usage_count,
            SUM(CASE WHEN expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon
        FROM bitdefender_licenses
        WHERE client_api_key IS NOT NULL
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "   ✓ Query executada com sucesso\n\n";
    echo "3. Resultado da query:\n";
    print_r($stats);
    echo "\n";
    
    echo "4. JSON formatado:\n";
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
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    echo "\n\n✓ TESTE CONCLUÍDO COM SUCESSO!\n";
    
} catch (Exception $e) {
    echo "   ✗ ERRO: " . $e->getMessage() . "\n";
    echo "   Stack trace:\n";
    echo $e->getTraceAsString();
}
