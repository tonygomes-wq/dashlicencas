<?php
/**
 * Teste simples de método HTTP
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'none';

echo json_encode([
    'success' => true,
    'message' => 'Endpoint de teste funcionando',
    'method' => $method,
    'action' => $action,
    'query_string' => $_SERVER['QUERY_STRING'] ?? '',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? '',
    'server_info' => [
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown'
    ]
], JSON_PRETTY_PRINT);
?>
