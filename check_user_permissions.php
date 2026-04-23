<?php
// check_user_permissions.php - Verificar permissões do usuário

session_start();
header('Content-Type: application/json');
require_once 'srv/config.php';

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'error' => 'Usuário não está logado',
            'session' => $_SESSION
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    $userId = $_SESSION['user_id'];
    
    // Buscar dados do usuário
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode([
            'error' => 'Usuário não encontrado',
            'user_id' => $userId
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    // Decodificar permissões
    $permissions = null;
    if (isset($user['permissions']) && $user['permissions']) {
        $permissions = json_decode($user['permissions'], true);
    }
    
    // Remover dados sensíveis
    unset($user['password_hash']);
    unset($user['two_factor_secret']);
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'permissions' => $permissions,
        'session' => [
            'user_id' => $_SESSION['user_id'],
            'user_email' => $_SESSION['user_email'] ?? null
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
