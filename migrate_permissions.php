<?php
require_once 'app_config.php';

try {
    // 1. Add permissions column if it doesn't exist
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'permissions'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE users ADD COLUMN permissions LONGTEXT DEFAULT NULL AFTER role");
        echo "Column 'permissions' added to 'users' table.\n";
    } else {
        echo "Column 'permissions' already exists.\n";
    }

    // 2. Initialize default permissions for existing users
    // Admin gets all true
    $adminPerms = json_encode([
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
        'client_access_all' => true,
        'client_access_list' => []
    ]);

    // Regular users get restricted access initially
    $userPerms = json_encode([
        'dashboards' => [
            'bitdefender' => false,
            'fortigate' => false,
            'o365' => false,
            'gmail' => false,
            'network' => false
        ],
        'actions' => [
            'edit' => false,
            'delete' => false
        ],
        'client_access_all' => true,
        'client_access_list' => []
    ]);

    $pdo->prepare("UPDATE users SET permissions = ? WHERE role = 'admin' AND permissions IS NULL")->execute([$adminPerms]);
    $pdo->prepare("UPDATE users SET permissions = ? WHERE role != 'admin' AND permissions IS NULL")->execute([$userPerms]);

    echo "Default permissions initialized.\n";
} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
}
