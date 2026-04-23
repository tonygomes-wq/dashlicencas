<?php
// disable_2fa.php - Desabilitar 2FA de todos os usuários

header('Content-Type: application/json');
require_once 'srv/config.php';

try {
    // Desabilitar 2FA para todos os usuários
    $stmt = $pdo->prepare("
        UPDATE users 
        SET two_factor_enabled = 0,
            two_factor_secret = NULL
        WHERE two_factor_enabled = 1
    ");
    
    $stmt->execute();
    $affectedRows = $stmt->rowCount();
    
    // Listar usuários atualizados
    $stmt = $pdo->query("SELECT id, email, two_factor_enabled FROM users");
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => '2FA desabilitado com sucesso!',
        'affected_rows' => $affectedRows,
        'users' => $users
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
