<?php
// Teste de conectividade FortiGate
session_start();

if (!isset($_SESSION['user_id'])) {
    die('❌ Não autenticado');
}

require_once 'srv/config.php';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Teste Conectividade FortiGate</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .info { color: blue; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
        .btn { background: #007cba; color: white; padding: 10px 15px; border: none; cursor: pointer; margin: 5px; }
    </style>
</head>
<body>

<h1>🔗 Teste de Conectividade FortiGate</h1>

<?php
$deviceId = 1; // PEGORARO
$apiIp = '189.115.43.1';
$apiToken = 'pdnjdbhbzqH66mc4ncG9cft3x4qQbp';

echo "<h2>📋 Informações do Teste</h2>";
echo "<p><strong>Dispositivo:</strong> PEGORARO (ID: {$deviceId})</p>";
echo "<p><strong>IP:</strong> {$apiIp}</p>";
echo "<p><strong>Token:</strong> " . substr($apiToken, 0, 10) . "...</p>";

if (isset($_POST['test_connectivity'])) {
    echo "<h2>🧪 Executando Testes de Conectividade</h2>";
    
    // Teste 1: Ping (simulado com fsockopen)
    echo "<h3>1. Teste de Conectividade Básica</h3>";
    $fp = @fsockopen($apiIp, 443, $errno, $errstr, 10);
    if ($fp) {
        echo "<p class='success'>✅ Porta 443 acessível</p>";
        fclose($fp);
    } else {
        echo "<p class='error'>❌ Porta 443 inacessível: {$errstr} ({$errno})</p>";
    }
    
    // Teste 2: Teste HTTP básico
    echo "<h3>2. Teste HTTP Básico</h3>";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://{$apiIp}:443/");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD request
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "<p class='error'>❌ Erro HTTP: {$error}</p>";
    } else {
        echo "<p class='success'>✅ HTTP responde (Code: {$httpCode})</p>";
    }
    
    // Teste 3: Teste da API com timeout longo
    echo "<h3>3. Teste da API FortiGate (Timeout: 60s)</h3>";
    $url = "https://{$apiIp}:443/api/v2/monitor/system/status?access_token={$apiToken}";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60); // 60 segundos
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_USERAGENT, 'DashLicencas/1.0');
    
    $startTime = microtime(true);
    $response = curl_exec($ch);
    $duration = microtime(true) - $startTime;
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "<p><strong>Duração:</strong> " . round($duration, 2) . " segundos</p>";
    echo "<p><strong>HTTP Code:</strong> {$httpCode}</p>";
    
    if ($error) {
        echo "<p class='error'>❌ Erro cURL: {$error}</p>";
    } else {
        echo "<p class='success'>✅ Resposta recebida!</p>";
        
        $json = json_decode($response, true);
        if ($json) {
            echo "<p class='success'>✅ JSON válido recebido</p>";
            echo "<details>";
            echo "<summary>Ver resposta da API</summary>";
            echo "<pre>" . json_encode($json, JSON_PRETTY_PRINT) . "</pre>";
            echo "</details>";
        } else {
            echo "<p class='warning'>⚠️ Resposta não é JSON válido</p>";
            echo "<details>";
            echo "<summary>Ver resposta bruta</summary>";
            echo "<pre>" . htmlspecialchars(substr($response, 0, 1000)) . "</pre>";
            echo "</details>";
        }
    }
    
    // Teste 4: Diferentes endpoints
    echo "<h3>4. Teste de Diferentes Endpoints</h3>";
    $endpoints = [
        '/api/v2/monitor/system/status' => 'Status do Sistema',
        '/api/v2/monitor/license/status' => 'Status das Licenças',
        '/api/v2/monitor/system/resource/usage' => 'Uso de Recursos'
    ];
    
    foreach ($endpoints as $endpoint => $description) {
        $url = "https://{$apiIp}:443{$endpoint}?access_token={$apiToken}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        echo "<p><strong>{$description}:</strong> ";
        if ($error) {
            echo "<span class='error'>❌ {$error}</span>";
        } elseif ($httpCode == 200) {
            echo "<span class='success'>✅ OK (HTTP {$httpCode})</span>";
        } else {
            echo "<span class='warning'>⚠️ HTTP {$httpCode}</span>";
        }
        echo "</p>";
    }
}

if (isset($_POST['test_sync_extended'])) {
    echo "<h2>🔄 Teste de Sincronização Estendido</h2>";
    
    // Chamar a API de sincronização com timeout maior
    $url = 'https://dashlicencas.macip.com.br/app_fortigate_api.php?action=sync_device';
    $data = json_encode(['device_id' => $deviceId]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Cookie: ' . ($_SERVER['HTTP_COOKIE'] ?? '')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 120); // 2 minutos
    
    $startTime = microtime(true);
    $response = curl_exec($ch);
    $duration = microtime(true) - $startTime;
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "<p><strong>Duração:</strong> " . round($duration, 2) . " segundos</p>";
    echo "<p><strong>HTTP Code:</strong> {$httpCode}</p>";
    
    if ($error) {
        echo "<p class='error'>❌ Erro: {$error}</p>";
    } else {
        echo "<p class='success'>✅ Resposta recebida!</p>";
        echo "<pre>" . htmlspecialchars($response) . "</pre>";
    }
}
?>

<h2>🚀 Executar Testes</h2>

<form method="post">
    <button type="submit" name="test_connectivity" value="1" class="btn">🔗 TESTAR CONECTIVIDADE</button>
    <button type="submit" name="test_sync_extended" value="1" class="btn">🔄 TESTAR SINCRONIZAÇÃO (2min timeout)</button>
</form>

<hr>
<p><a href="verificar_api_fortigate_simples.php">← Voltar à Verificação</a></p>

</body>
</html>