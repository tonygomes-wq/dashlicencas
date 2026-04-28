<?php
/**
 * Teste simples de endpoints
 */

header('Content-Type: application/json');

$tests = [];

// Teste 1: Verificar se arquivos existem
$files = [
    'app_bitdefender_license_usage.php',
    'app_bitdefender_endpoints.php'
];

foreach ($files as $file) {
    $tests[$file] = [
        'exists' => file_exists($file),
        'readable' => file_exists($file) && is_readable($file),
        'size' => file_exists($file) ? filesize($file) : 0
    ];
}

// Teste 2: Verificar sessão
session_start();
$tests['session'] = [
    'started' => session_status() === PHP_SESSION_ACTIVE,
    'user_id' => $_SESSION['user_id'] ?? null,
    'authenticated' => isset($_SESSION['user_id'])
];

// Teste 3: Verificar banco de dados
try {
    require_once 'srv/config.php';
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_licenses");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $tests['database'] = [
        'connected' => true,
        'bitdefender_licenses_count' => $result['total']
    ];
} catch (Exception $e) {
    $tests['database'] = [
        'connected' => false,
        'error' => $e->getMessage()
    ];
}

// Teste 4: Tentar chamar endpoint diretamente
if (file_exists('app_bitdefender_license_usage.php')) {
    ob_start();
    $_GET['action'] = 'list';
    try {
        include 'app_bitdefender_license_usage.php';
        $output = ob_get_clean();
        $tests['endpoint_test'] = [
            'success' => true,
            'output_length' => strlen($output),
            'is_json' => json_decode($output) !== null
        ];
    } catch (Exception $e) {
        ob_end_clean();
        $tests['endpoint_test'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

echo json_encode($tests, JSON_PRETTY_PRINT);
?>
