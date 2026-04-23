<?php
require_once 'app_config.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SHOW COLUMNS FROM users");
    $columns = $stmt->fetchAll();
    echo json_encode(['success' => true, 'columns' => $columns]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
