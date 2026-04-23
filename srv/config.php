<?php
// srv/config.php - Database Configuration

// Allow from any origin (Adjust for production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Detectar se está rodando no Docker/Easypanel
$isDocker = getenv('DB_HOST') !== false;

if ($isDocker) {
    // Ambiente Docker/Easypanel - usar variáveis de ambiente
    $host = getenv('DB_HOST');
    $db   = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASSWORD');
} else {
    // Ambiente tradicional (Hostgator)
    $host = 'localhost';
    $db   = 'faceso56_dashlicencas';
    $user = 'faceso56_dashlicencas';
    $pass = 'dash@123@macip';
}

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
    // Log do erro para debug
    error_log("Database connection error: " . $e->getMessage());
    error_log("DSN: $dsn");
    error_log("User: $user");
    error_log("Is Docker: " . ($isDocker ? 'yes' : 'no'));
    
    http_response_code(500);
    die(json_encode([
        'error' => 'Database connection failed',
        'message' => $e->getMessage(),
        'dsn' => $dsn
    ]));
}

// Incluir funções de permissão
require_once __DIR__ . '/permissions.php';
