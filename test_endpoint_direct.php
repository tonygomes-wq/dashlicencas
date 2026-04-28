<?php
/**
 * Teste direto do endpoint sem autenticação
 * Acesse: https://dashlicencas.macip.com.br/test_endpoint_direct.php
 */

echo "<h1>Teste Direto do Endpoint</h1>";
echo "<pre>";

echo "=== 1. TESTAR ENDPOINT COM CURL ===\n\n";

$url = 'https://dashlicencas.macip.com.br/app_bitdefender_endpoints.php?action=stats';

echo "URL: $url\n\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Content-Type: $contentType\n\n";

echo "=== 2. RESPOSTA RECEBIDA ===\n\n";

// Mostrar primeiros 1000 caracteres
echo "Primeiros 1000 caracteres:\n";
echo htmlspecialchars(substr($response, 0, 1000));
echo "\n\n";

echo "=== 3. TENTAR DECODIFICAR JSON ===\n\n";

$decoded = json_decode($response, true);

if ($decoded) {
    echo "✅ JSON VÁLIDO!\n\n";
    print_r($decoded);
} else {
    echo "❌ NÃO É JSON VÁLIDO\n";
    echo "Erro JSON: " . json_last_error_msg() . "\n\n";
    
    // Verificar se é HTML
    if (strpos($response, '<') !== false) {
        echo "⚠️ A resposta parece ser HTML!\n";
        echo "Possíveis causas:\n";
        echo "- Erro PHP sendo exibido\n";
        echo "- Redirecionamento para página de login\n";
        echo "- Arquivo não encontrado (404)\n";
    }
}

echo "\n=== 4. RESPOSTA COMPLETA (HTML) ===\n\n";
echo htmlspecialchars($response);

echo "</pre>";
