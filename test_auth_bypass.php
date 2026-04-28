<?php
/**
 * Teste com bypass de autenticação para debug
 */

header('Content-Type: application/json');

// Simular sessão autenticada
session_start();
$_SESSION['user_id'] = 1;
$_SESSION['user_role'] = 'admin';

echo "=== TESTE COM AUTENTICAÇÃO SIMULADA ===\n\n";

// Teste 1: Verificar se check_auth funciona
require_once 'app_auth.php';
$auth = check_auth();

echo "1. Resultado do check_auth():\n";
echo json_encode($auth, JSON_PRETTY_PRINT);
echo "\n\n";

// Teste 2: Chamar endpoint diretamente
echo "2. Chamando app_bitdefender_license_usage.php?action=list\n";

$_GET['action'] = 'list';
$_SERVER['REQUEST_METHOD'] = 'GET';

// Capturar output
ob_start();
include 'app_bitdefender_license_usage.php';
$output = ob_get_clean();

echo "Resultado:\n";
echo $output;
?>
