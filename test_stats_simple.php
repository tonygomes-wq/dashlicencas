<?php
/**
 * Teste super simples - apenas retornar JSON
 */

header('Content-Type: application/json');

echo json_encode([
    'test' => 'OK',
    'message' => 'Este é um teste simples',
    'timestamp' => date('Y-m-d H:i:s')
]);
