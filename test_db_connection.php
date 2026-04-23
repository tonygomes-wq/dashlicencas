<?php
// test_db_connection.php - Testar conexão com banco de dados

header('Content-Type: application/json');

$result = [
    'timestamp' => date('Y-m-d H:i:s'),
    'environment_vars' => [],
    'connection_test' => null,
    'error' => null
];

// Verificar variáveis de ambiente
$env_vars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
foreach ($env_vars as $var) {
    $value = getenv($var);
    $result['environment_vars'][$var] = $value ? 'SET (length: ' . strlen($value) . ')' : 'NOT SET';
}

// Tentar conexão
try {
    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_NAME') ?: 'faceso56_dashlicencas';
    $user = getenv('DB_USER') ?: 'mysql';
    $pass = getenv('DB_PASSWORD') ?: '';
    
    $result['connection_attempt'] = [
        'host' => $host,
        'database' => $db,
        'user' => $user,
        'password_length' => strlen($pass)
    ];
    
    $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Testar query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $count = $stmt->fetch();
    
    $result['connection_test'] = [
        'status' => 'SUCCESS',
        'message' => 'Conexão estabelecida com sucesso!',
        'users_count' => $count['count']
    ];
    
} catch (PDOException $e) {
    $result['connection_test'] = [
        'status' => 'FAILED',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ];
    $result['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
