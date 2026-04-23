<?php
// disable_permissions_temporarily.php - Desabilitar permissões temporariamente

header('Content-Type: application/json; charset=UTF-8');

$permissionsFile = 'srv/permissions.php';
$backupFile = 'srv/permissions.php.backup';

// Fazer backup do arquivo atual
if (file_exists($permissionsFile)) {
    copy($permissionsFile, $backupFile);
}

// Criar versão simplificada SEM verificação de permissões
$simplePermissions = <<<'PHP'
<?php
// srv/permissions.php - Versão SIMPLIFICADA (permissões desabilitadas temporariamente)

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
    
    return $currentUser;
}

// PERMISSÕES DESABILITADAS - SEMPRE RETORNA TRUE
function hasPermission($dashboard, $action = null)
{
    return true; // ← SEMPRE PERMITE
}

function getClientFilter($dashboard)
{
    return null; // ← SEM FILTRO (mostra tudo)
}

function isAllowed($clientName, $dashboard)
{
    return true; // ← SEMPRE PERMITE
}
PHP;

file_put_contents($permissionsFile, $simplePermissions);

echo json_encode([
    'success' => true,
    'message' => 'Permissões desabilitadas temporariamente',
    'backup_created' => $backupFile,
    'instructions' => [
        '1. Fazer logout',
        '2. Limpar cache (Ctrl+Shift+Delete)',
        '3. Fazer login novamente',
        '4. Verificar se dados aparecem',
        '5. Se funcionar, o problema era de permissões'
    ]
], JSON_PRETTY_PRINT);
