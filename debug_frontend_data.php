<?php
// debug_frontend_data.php - Verificar o que o frontend está recebendo
session_start();
$_SESSION['user_id'] = 1;

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Simular o que o frontend faz quando abre o painel
    $stmt = $pdo->prepare('SELECT * FROM bitdefender_licenses WHERE id = ?');
    $stmt->execute([25]); // ID do MAGLON
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Dados que o frontend recebe ao abrir o painel',
        'data' => $result,
        'checks' => [
            'has_usedLicenses_field' => isset($result['used_licenses']),
            'usedLicenses_value' => $result['used_licenses'] ?? 'NOT SET',
            'usedLicenses_is_null' => $result['used_licenses'] === null,
            'usedLicenses_is_undefined' => !isset($result['used_licenses']),
            'condition_will_pass' => isset($result['used_licenses']) && $result['used_licenses'] !== null
        ],
        'explanation' => [
            'condition' => 'usedLicenses !== undefined',
            'in_php' => 'isset($result["used_licenses"]) && $result["used_licenses"] !== null',
            'will_show' => isset($result['used_licenses']) && $result['used_licenses'] !== null ? 'YES ✅' : 'NO ❌'
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
