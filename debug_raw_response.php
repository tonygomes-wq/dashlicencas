<?php
// debug_raw_response.php - Ver resposta crua dos endpoints

session_start();

header('Content-Type: text/html; charset=UTF-8');

echo "<h1>Debug de Respostas dos Endpoints</h1>";
echo "<p>Sessão ativa: " . (session_status() === PHP_SESSION_ACTIVE ? 'SIM' : 'NÃO') . "</p>";
echo "<p>User ID: " . ($_SESSION['user_id'] ?? 'NÃO DEFINIDO') . "</p>";

$endpoints = [
    'app_bitdefender.php',
    'app_fortigate.php',
    'app_o365.php',
    'app_gmail.php'
];

foreach ($endpoints as $endpoint) {
    echo "<hr>";
    echo "<h2>$endpoint</h2>";
    
    // Capturar output
    ob_start();
    try {
        include $endpoint;
        $output = ob_get_clean();
        
        echo "<h3>Resposta:</h3>";
        echo "<pre style='background: #f0f0f0; padding: 10px; overflow: auto;'>";
        echo htmlspecialchars($output);
        echo "</pre>";
        
        // Tentar decodificar JSON
        $json = json_decode($output);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "<p style='color: green;'>✅ JSON válido</p>";
            if (is_array($json)) {
                echo "<p>Total de registros: " . count($json) . "</p>";
            }
        } else {
            echo "<p style='color: red;'>❌ JSON inválido: " . json_last_error_msg() . "</p>";
        }
        
    } catch (Exception $e) {
        ob_end_clean();
        echo "<p style='color: red;'>❌ Erro: " . $e->getMessage() . "</p>";
        echo "<pre>" . $e->getTraceAsString() . "</pre>";
    }
}
