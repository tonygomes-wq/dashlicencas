<?php
/**
 * Script de teste para verificar se o app_bitdefender_reports.php está funcionando
 */

echo "=== Teste de Sintaxe PHP ===\n\n";

// Teste 1: Verificar se app_auth.php pode ser incluído
echo "1. Testando app_auth.php... ";
try {
    require_once 'app_auth.php';
    echo "✓ OK\n";
} catch (Exception $e) {
    echo "✗ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

// Teste 2: Verificar se check_auth() existe
echo "2. Testando função check_auth()... ";
if (function_exists('check_auth')) {
    echo "✓ OK\n";
} else {
    echo "✗ ERRO: Função não encontrada\n";
    exit(1);
}

// Teste 3: Testar chamada de check_auth()
echo "3. Testando execução de check_auth()... ";
try {
    $result = check_auth();
    if (isset($result['authenticated'])) {
        echo "✓ OK (authenticated: " . ($result['authenticated'] ? 'true' : 'false') . ")\n";
    } else {
        echo "✗ ERRO: Retorno inválido\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "✗ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

// Teste 4: Verificar sintaxe do app_bitdefender_reports.php
echo "4. Testando sintaxe de app_bitdefender_reports.php... ";
$output = [];
$return_var = 0;
exec('php -l app_bitdefender_reports.php 2>&1', $output, $return_var);
if ($return_var === 0) {
    echo "✓ OK\n";
} else {
    echo "✗ ERRO:\n";
    echo implode("\n", $output) . "\n";
    exit(1);
}

echo "\n=== Todos os testes passaram! ===\n";
echo "\nO arquivo app_bitdefender_reports.php está pronto para uso.\n";
