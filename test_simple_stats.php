<?php
/**
 * Teste simples do endpoint de estatísticas
 * Acesse: https://dashlicencas.macip.com.br/test_simple_stats.php
 */

// Forçar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Forçar JSON
header('Content-Type: application/json');

echo json_encode([
    'test' => 'OK',
    'timestamp' => date('Y-m-d H:i:s'),
    'message' => 'Se você está vendo isso, o PHP está funcionando'
]);
