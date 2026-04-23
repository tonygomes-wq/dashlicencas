<?php
// test_direct_query.php - Testar query direta no banco

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Query direta sem verificação de permissões
    $stmt = $pdo->query('SELECT * FROM bitdefender_licenses LIMIT 10');
    $data = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'count' => count($data),
        'total_in_db' => $pdo->query('SELECT COUNT(*) FROM bitdefender_licenses')->fetchColumn(),
        'sample_data' => $data,
        'message' => 'Query direta funcionou! Dados estão no banco.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
