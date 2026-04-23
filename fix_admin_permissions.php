<?php
// fix_admin_permissions.php - Dar permissões de admin para todos os usuários

header('Content-Type: application/json');
require_once 'srv/config.php';

try {
    // Atualizar todos os usuários para role 'admin'
    $stmt = $pdo->prepare("UPDATE users SET role = 'admin' WHERE role != 'admin'");
    $stmt->execute();
    $adminCount = $stmt->rowCount();
    
    // Criar permissões completas
    $fullPermissions = [
        'dashboards' => [
            'bitdefender' => true,
            'fortigate' => true,
            'o365' => true,
            'gmail' => true,
            'network' => true
        ],
        'actions' => [
            'edit' => true,
            'delete' => true
        ],
        'client_access_all' => true
    ];
    
    $permissionsJson = json_encode($fullPermissions);
    
    // Atualizar permissões de todos os usuários
    $stmt = $pdo->prepare("UPDATE users SET permissions = ?");
    $stmt->execute([$permissionsJson]);
    $permCount = $stmt->rowCount();
    
    // Listar usuários atualizados
    $stmt = $pdo->query("SELECT id, email, role, permissions FROM users");
    $users = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Permissões atualizadas com sucesso!',
        'admin_count' => $adminCount,
        'permissions_updated' => $permCount,
        'users' => $users
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
