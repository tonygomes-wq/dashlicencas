<?php
/**
 * Verificar se o arquivo existe e pode ser executado
 */

echo "<h1>Teste de Existência de Arquivos</h1>";
echo "<pre>";

$files = [
    'app_bitdefender_endpoints.php',
    'srv/config.php',
    'app_auth.php'
];

echo "=== VERIFICAR ARQUIVOS ===\n\n";

foreach ($files as $file) {
    $fullPath = __DIR__ . '/' . $file;
    $exists = file_exists($fullPath);
    $readable = is_readable($fullPath);
    
    echo ($exists ? '✅' : '❌') . " $file\n";
    echo "   Caminho: $fullPath\n";
    echo "   Existe: " . ($exists ? 'Sim' : 'Não') . "\n";
    echo "   Legível: " . ($readable ? 'Sim' : 'Não') . "\n";
    
    if ($exists) {
        echo "   Tamanho: " . filesize($fullPath) . " bytes\n";
        echo "   Modificado: " . date('Y-m-d H:i:s', filemtime($fullPath)) . "\n";
    }
    echo "\n";
}

echo "\n=== TESTAR INCLUDE DO CONFIG ===\n\n";

try {
    require_once __DIR__ . '/srv/config.php';
    echo "✅ Config carregado com sucesso\n";
    echo "PDO disponível: " . (isset($pdo) ? 'Sim' : 'Não') . "\n";
} catch (Exception $e) {
    echo "❌ Erro ao carregar config: " . $e->getMessage() . "\n";
}

echo "\n=== TESTAR ENDPOINT DIRETAMENTE ===\n\n";

// Simular requisição GET
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'stats';

echo "Tentando executar app_bitdefender_endpoints.php...\n\n";

// Capturar output
ob_start();
try {
    include __DIR__ . '/app_bitdefender_endpoints.php';
    $output = ob_get_clean();
    
    echo "✅ Arquivo executado\n";
    echo "Output length: " . strlen($output) . " bytes\n\n";
    echo "Output:\n";
    echo htmlspecialchars($output);
    
    // Tentar decodificar JSON
    $decoded = json_decode($output, true);
    if ($decoded) {
        echo "\n\n✅ JSON válido!\n";
        print_r($decoded);
    } else {
        echo "\n\n❌ Não é JSON válido\n";
        echo "Erro: " . json_last_error_msg() . "\n";
    }
    
} catch (Exception $e) {
    ob_end_clean();
    echo "❌ Erro ao executar: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "</pre>";
