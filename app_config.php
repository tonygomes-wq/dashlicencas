<?php
// srv/config.php - Database Configuration

// Start session for authentication
session_start();

// Set global headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json; charset=UTF-8');

// Global error suppression for JSON APIs
ini_set('display_errors', 0);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$db   = 'faceso56_dashlicencas';
$user = 'faceso56_dashlicencas';
$pass = 'dash@123@macip';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

// Global User Context
$currentUser = null;
if (isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare('SELECT id, email, role, is_active, permissions FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $currentUser = $stmt->fetch();
    if ($currentUser && isset($currentUser['permissions']) && $currentUser['permissions']) {
        $currentUser['permissions'] = json_decode($currentUser['permissions'], true);
    }
}

// Helper to check permissions
function hasPermission($dashboard, $action = null)
{
    global $currentUser;
    if (!$currentUser || $currentUser['is_active'] == 0) return false;
    if ($currentUser['role'] === 'admin') return true;

    $perms = $currentUser['permissions'] ?? [];

    // Check dashboard access
    if ($dashboard && !($perms['dashboards'][$dashboard] ?? false)) {
        return false;
    }

    // Check specific action
    if ($action) {
        return $perms['actions'][$action] ?? false;
    }

    return true;
}

// Helper to filter by item access (Visualização por Item)
function getClientFilter($dashboard)
{
    global $currentUser;
    if (!$currentUser || $currentUser['role'] === 'admin') return null; // Admin sees everything

    $perms = $currentUser['permissions'] ?? [];
    $allAccess = $perms['client_access_all'] ?? true;

    // Check if it's a per-dashboard record or a global boolean
    if (is_array($allAccess)) {
        if (isset($allAccess[$dashboard]) && $allAccess[$dashboard] == true) {
            return null; // NO FILTER = SEE ALL
        }
    } else if ($allAccess === true) {
        return null; // Global ALL
    }

    $clientAccess = $perms['client_access'] ?? []; // Structured as ['dashboard_key' => ['Item A', 'Item B']]
    $list = $clientAccess[$dashboard] ?? [];

    // If restricted but list is empty, return empty array to filter out everything
    return $list;
}

// Helper to check if a specific item is allowed
function isAllowed($itemIdentifier, $dashboard)
{
    global $currentUser;
    if (!$currentUser || $currentUser['is_active'] == 0) return false;
    if ($currentUser['role'] === 'admin') return true;

    $filter = getClientFilter($dashboard);
    if ($filter === null) return true; // No restriction if list is empty/null (default allow all if not set)

    return in_array($itemIdentifier, $filter);
}
