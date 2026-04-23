<?php
// srv/permissions.php - Funções de permissão

// Função para carregar usuário atual (lazy loading)
function getCurrentUser()
{
    static $currentUser = null;
    static $loaded = false;
    
    if ($loaded) {
        return $currentUser;
    }
    
    $loaded = true;
    
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    global $pdo;
    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $currentUser = $stmt->fetch();
    
    if ($currentUser && isset($currentUser['permissions']) && $currentUser['permissions']) {
        $currentUser['permissions'] = json_decode($currentUser['permissions'], true);
    }
    
    return $currentUser;
}

// Helper to check permissions
function hasPermission($dashboard, $action = null)
{
    $currentUser = getCurrentUser();
    
    if (!$currentUser) {
        return false;
    }
    
    // Admin tem acesso total
    if ($currentUser['role'] === 'admin') {
        return true;
    }
    
    // Verificar permissões específicas
    $permissions = $currentUser['permissions'] ?? [];
    
    // Verificar acesso ao dashboard
    if (isset($permissions['dashboards'][$dashboard]) && !$permissions['dashboards'][$dashboard]) {
        return false;
    }
    
    // Verificar ação específica
    if ($action && isset($permissions['actions'][$action]) && !$permissions['actions'][$action]) {
        return false;
    }
    
    return true;
}

// Helper to get client filter
function getClientFilter($dashboard)
{
    $currentUser = getCurrentUser();
    
    if (!$currentUser) {
        return null;
    }
    
    // Admin vê tudo
    if ($currentUser['role'] === 'admin') {
        return null;
    }
    
    $permissions = $currentUser['permissions'] ?? [];
    
    // Se client_access_all é true, retorna null (vê tudo)
    if (isset($permissions['client_access_all']) && $permissions['client_access_all'] === true) {
        return null;
    }
    
    // Retornar lista de clientes permitidos
    if (isset($permissions['client_access'][$dashboard])) {
        return $permissions['client_access'][$dashboard];
    }
    
    return [];
}

// Helper to check if user can access specific client
function isAllowed($clientName, $dashboard)
{
    $currentUser = getCurrentUser();
    
    if (!$currentUser) {
        return false;
    }
    
    // Admin pode tudo
    if ($currentUser['role'] === 'admin') {
        return true;
    }
    
    $permissions = $currentUser['permissions'] ?? [];
    
    // Se client_access_all é true, pode tudo
    if (isset($permissions['client_access_all']) && $permissions['client_access_all'] === true) {
        return true;
    }
    
    // Verificar se cliente está na lista permitida
    if (isset($permissions['client_access'][$dashboard])) {
        return in_array($clientName, $permissions['client_access'][$dashboard]);
    }
    
    return false;
}
