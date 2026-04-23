<?php
// app_bitdefender_sem_permissoes.php - Versão SEM verificação de permissões (TESTE)
session_start();

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

// Verificar apenas autenticação (sem permissões)
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $sql = 'SELECT * FROM bitdefender_licenses ORDER BY company';
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'count' => count($result),
            'data' => $result
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
