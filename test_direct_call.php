<?php
/**
 * Teste direto dos endpoints sem passar pelo navegador
 */

header('Content-Type: application/json');

// Simular sessão autenticada
session_start();
$_SESSION['user_id'] = 1; // Simular usuário logado

echo json_encode([
    'test' => 'Teste Direto de Endpoints',
    'session_id' => session_id(),
    'user_id' => $_SESSION['user_id'],
    'tests' => []
], JSON_PRETTY_PRINT);

echo "\n\n=== TESTE 1: app_bitdefender_license_usage.php?action=list ===\n";
$_GET['action'] = 'list';
$_SERVER['REQUEST_METHOD'] = 'GET';

ob_start();
try {
    include 'app_bitdefender_license_usage.php';
    $output = ob_get_clean();
    echo "Resultado:\n";
    echo $output;
} catch (Exception $e) {
    ob_end_clean();
    echo "Erro: " . $e->getMessage();
}

echo "\n\n=== TESTE 2: app_bitdefender_endpoints.php?action=stats ===\n";
$_GET['action'] = 'stats';
$_SERVER['REQUEST_METHOD'] = 'GET';

ob_start();
try {
    include 'app_bitdefender_endpoints.php';
    $output = ob_get_clean();
    echo "Resultado:\n";
    echo $output;
} catch (Exception $e) {
    ob_end_clean();
    echo "Erro: " . $e->getMessage();
}
?>
