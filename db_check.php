<?php
// db_check.php - Standalone database connection test
session_start();

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

header('Content-Type: application/json');

// Input reading test
$input = file_get_contents('php://input');

$host = 'localhost';
$db = 'faceso56_dashlicencas';
$user = 'faceso56_dashlicencas';
$pass = 'dash@123@macip';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $stmt = $pdo->query('SELECT COUNT(*) as user_count FROM users');
    $result = $stmt->fetch();
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'data' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
