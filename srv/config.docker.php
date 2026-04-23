<?php
// config.docker.php - Configuração para Docker/Easypanel

// Configurações do banco de dados (usando variáveis de ambiente)
$db_host = getenv('DB_HOST') ?: 'db';
$db_name = getenv('DB_NAME') ?: 'dashlicencas';
$db_user = getenv('DB_USER') ?: 'dashlicencas_user';
$db_password = getenv('DB_PASSWORD') ?: 'senha_segura_aqui';

try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode([
        'error' => 'Erro de conexão com o banco de dados',
        'message' => $e->getMessage()
    ]));
}
