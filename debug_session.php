<?php
// debug_session.php - Verificar sessão e permissões

header('Content-Type: application/json');
require_once 'srv/config.php';

session_start();

$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'session_started' => session_status() === PHP_SESSION_ACTIVE,
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'user_id_in_session' => $_SESSION['user_id'] ?? null,
    'cookies' => $_COOKIE,
];

// Se tem user_id na sessão, buscar dados do usuário
if (isset($_SESSION['user_id'])) {
    try {
        $stmt = $pdo->prepare('SELECT id, email, role, permissions, created_at FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        
        $debug['user_from_db'] = $user;
        
        if ($user && isset($user['permissions'])) {
            $debug['permissions_decoded'] = json_decode($user['permissions'], true);
        }
        
        // Testar função hasPermission
        $debug['hasPermission_bitdefender'] = hasPermission('bitdefender');
        $debug['hasPermission_fortigate'] = hasPermission('fortigate');
        
    } catch (Exception $e) {
        $debug['error'] = $e->getMessage();
    }
} else {
    $debug['error'] = 'Nenhum user_id na sessão';
}

// Verificar se currentUser está definido
global $currentUser;
$debug['currentUser_global'] = $currentUser;

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
