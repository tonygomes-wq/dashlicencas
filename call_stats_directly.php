<?php
/**
 * Chamar o endpoint diretamente sem CURL
 */

echo "<h1>Chamar Endpoint Diretamente</h1>";
echo "<pre>";

// Configurar ambiente
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'stats';

echo "=== EXECUTANDO app_bitdefender_endpoints.php ===\n\n";

// Capturar output
ob_start();

try {
    include __DIR__ . '/app_bitdefender_endpoints.php';
    $output = ob_get_clean();
    
    echo "✅ Executado com sucesso\n\n";
    echo "Output length: " . strlen($output) . " bytes\n\n";
    
    // Verificar se é JSON
    $decoded = json_decode($output, true);
    
    if ($decoded) {
        echo "✅ JSON VÁLIDO!\n\n";
        echo "JSON formatado:\n";
        echo json_encode($decoded, JSON_PRETTY_PRINT);
    } else {
        echo "❌ NÃO É JSON\n\n";
        echo "Output recebido:\n";
        echo htmlspecialchars($output);
        echo "\n\nErro JSON: " . json_last_error_msg();
    }
    
} catch (Throwable $e) {
    ob_end_clean();
    echo "❌ ERRO FATAL!\n\n";
    echo "Mensagem: " . $e->getMessage() . "\n";
    echo "Arquivo: " . $e->getFile() . "\n";
    echo "Linha: " . $e->getLine() . "\n\n";
    echo "Stack trace:\n" . $e->getTraceAsString();
}

echo "\n\n=== FIM ===";
echo "</pre>";
