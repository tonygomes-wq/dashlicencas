<?php
/**
 * Teste REAL de chamada à API Bitdefender
 * Este script faz uma chamada verdadeira para verificar se a API responde
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'srv/config.php';
require_once 'php_compat_helpers.php';

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Teste Real API</title>";
echo "<style>
body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; max-width: 1200px; margin: 0 auto; }
h1 { color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
h2 { color: #555; margin-top: 30px; background: #e8f5e9; padding: 10px; }
.box { background: white; padding: 20px; margin: 15px 0; border: 1px solid #ddd; border-radius: 4px; }
.success { color: #4CAF50; font-weight: bold; }
.error { color: #f44336; font-weight: bold; }
.warning { color: #ff9800; font-weight: bold; }
pre { background: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; overflow-x: auto; }
.step { background: #e3f2fd; padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; }
</style></head><body>";

echo "<h1>🧪 Teste REAL de Chamada à API Bitdefender</h1>";

try {
    // 1. Buscar cliente
    echo "<h2>1. Buscar Cliente Bitdefender</h2>";
    echo "<div class='box'>";
    
    $stmt = $pdo->query("SELECT * FROM bitdefender_licenses WHERE client_api_key IS NOT NULL AND client_api_key != '' LIMIT 1");
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        die("<p class='error'>❌ Nenhum cliente com API Key encontrado</p></div>");
    }
    
    echo "<p class='success'>✅ Cliente: {$client['company']}</p>";
    echo "<p><strong>ID:</strong> {$client['id']}</p>";
    echo "<p><strong>API Key:</strong> " . substr($client['client_api_key'], 0, 15) . "...</p>";
    echo "<p><strong>Access URL:</strong> {$client['client_access_url']}</p>";
    echo "</div>";

    // 2. Preparar chamada
    echo "<h2>2. Preparar Chamada à API</h2>";
    echo "<div class='box'>";
    
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com';
    $accessUrl = rtrim($accessUrl, '/');
    
    echo "<div class='step'><strong>URL Original:</strong> $accessUrl</div>";
    
    // Normalizar URL
    if (!str_ends_with($accessUrl, '/jsonrpc')) {
        if (!str_ends_with($accessUrl, '/api')) {
            $accessUrl .= '/api';
            echo "<div class='step'>Adicionado: /api</div>";
        }
        $accessUrl .= '/v1.0/jsonrpc';
        echo "<div class='step'>Adicionado: /v1.0/jsonrpc</div>";
    }
    
    $url = $accessUrl . '/reporting';
    echo "<div class='step'><strong>URL Final:</strong> $url</div>";
    
    $payload = [
        'params' => [
            'type' => 12, // Malware Status
            'options' => [
                'reportingInterval' => 'thisWeek',
                'filterType' => 0
            ]
        ],
        'jsonrpc' => '2.0',
        'method' => 'createReport',
        'id' => uniqid('test_', true)
    ];
    
    echo "<p><strong>Payload:</strong></p>";
    echo "<pre>" . json_encode($payload, JSON_PRETTY_PRINT) . "</pre>";
    echo "</div>";

    // 3. Fazer chamada REAL
    echo "<h2>3. Executar Chamada HTTP</h2>";
    echo "<div class='box'>";
    
    echo "<p>⏳ Fazendo requisição...</p>";
    
    $startTime = microtime(true);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($client['client_api_key'] . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlInfo = curl_getinfo($ch);
    curl_close($ch);
    
    $endTime = microtime(true);
    $duration = round(($endTime - $startTime) * 1000, 2);
    
    echo "<p><strong>Tempo de resposta:</strong> {$duration}ms</p>";
    echo "<p><strong>HTTP Status:</strong> ";
    
    if ($httpCode == 200) {
        echo "<span class='success'>$httpCode ✅ OK</span></p>";
    } else {
        echo "<span class='error'>$httpCode ❌ ERRO</span></p>";
    }
    
    if ($curlError) {
        echo "<p class='error'><strong>cURL Error:</strong> $curlError</p>";
    }
    
    echo "<details><summary><strong>cURL Info (clique para expandir)</strong></summary>";
    echo "<pre>" . print_r($curlInfo, true) . "</pre>";
    echo "</details>";
    
    echo "</div>";

    // 4. Analisar resposta
    echo "<h2>4. Resposta da API</h2>";
    echo "<div class='box'>";
    
    if ($response) {
        echo "<p><strong>Tamanho da resposta:</strong> " . strlen($response) . " bytes</p>";
        
        $decoded = json_decode($response, true);
        
        if ($decoded) {
            echo "<p class='success'>✅ JSON válido</p>";
            
            if (isset($decoded['result'])) {
                echo "<p class='success'>✅ Sucesso! Relatório criado!</p>";
                
                if (isset($decoded['result']['reportId'])) {
                    echo "<p><strong>Report ID:</strong> {$decoded['result']['reportId']}</p>";
                }
                
                echo "<details><summary><strong>Resposta completa</strong></summary>";
                echo "<pre>" . json_encode($decoded, JSON_PRETTY_PRINT) . "</pre>";
                echo "</details>";
                
            } elseif (isset($decoded['error'])) {
                echo "<p class='error'>❌ Erro da API Bitdefender</p>";
                
                $errorMsg = $decoded['error']['message'] ?? 'Desconhecido';
                $errorCode = $decoded['error']['code'] ?? 'N/A';
                
                echo "<p><strong>Código:</strong> $errorCode</p>";
                echo "<p><strong>Mensagem:</strong> $errorMsg</p>";
                
                echo "<details><summary><strong>Erro completo</strong></summary>";
                echo "<pre>" . json_encode($decoded['error'], JSON_PRETTY_PRINT) . "</pre>";
                echo "</details>";
            } else {
                echo "<p class='warning'>⚠️ Resposta inesperada</p>";
                echo "<pre>" . json_encode($decoded, JSON_PRETTY_PRINT) . "</pre>";
            }
            
        } else {
            echo "<p class='error'>❌ Resposta não é JSON válido</p>";
            echo "<p><strong>Resposta bruta:</strong></p>";
            echo "<pre>" . htmlspecialchars(substr($response, 0, 1000)) . "</pre>";
        }
    } else {
        echo "<p class='error'>❌ Sem resposta do servidor</p>";
    }
    
    echo "</div>";

    // 5. Conclusão
    echo "<h2>✅ Conclusão</h2>";
    echo "<div class='box'>";
    
    if ($httpCode == 200 && $decoded && isset($decoded['result'])) {
        echo "<p class='success' style='font-size:18px'>🎉 TUDO FUNCIONANDO!</p>";
        echo "<p>A API Bitdefender está respondendo corretamente.</p>";
        echo "<p><strong>O erro no dashboard deve ser outra coisa.</strong></p>";
        
        echo "<hr>";
        echo "<h3>Possíveis causas do erro no dashboard:</h3>";
        echo "<ol>";
        echo "<li>Problema no frontend (JavaScript)</li>";
        echo "<li>Timeout no browser</li>";
        echo "<li>Cache do browser</li>";
        echo "<li>Diferença entre teste e código real</li>";
        echo "</ol>";
        
        echo "<h3>Próximos passos:</h3>";
        echo "<ol>";
        echo "<li>Limpe o cache do browser (Ctrl+Shift+R)</li>";
        echo "<li>Tente gerar relatório novamente</li>";
        echo "<li>Se ainda houver erro, veja o console (F12)</li>";
        echo "<li>Compare o payload enviado com o deste teste</li>";
        echo "</ol>";
        
    } elseif ($httpCode == 401) {
        echo "<p class='error'>🔒 Erro de Autenticação</p>";
        echo "<p>A API Key está incorreta ou expirada.</p>";
        echo "<p><strong>Solução:</strong> Gere uma nova API Key no GravityZone e atualize no banco.</p>";
        
    } elseif ($httpCode == 403) {
        echo "<p class='error'>🚫 Acesso Negado</p>";
        echo "<p>A API Key não tem permissões para criar relatórios.</p>";
        echo "<p><strong>Solução:</strong> Verifique as permissões da API Key no GravityZone.</p>";
        
    } elseif ($httpCode == 0 || $curlError) {
        echo "<p class='error'>🌐 Erro de Conexão</p>";
        echo "<p>Não foi possível conectar ao servidor Bitdefender.</p>";
        echo "<p><strong>Possíveis causas:</strong></p>";
        echo "<ul>";
        echo "<li>Firewall bloqueando</li>";
        echo "<li>URL incorreta</li>";
        echo "<li>Problemas de DNS</li>";
        echo "<li>Problemas de rede</li>";
        echo "</ul>";
        
    } else {
        echo "<p class='error'>❌ Erro Desconhecido</p>";
        echo "<p>HTTP Status: $httpCode</p>";
        echo "<p>Revise os logs acima para mais detalhes.</p>";
    }
    
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='box' style='border-color: #f44336;'>";
    echo "<h2 class='error'>❌ EXCEÇÃO</h2>";
    echo "<p><strong>Mensagem:</strong> {$e->getMessage()}</p>";
    echo "<p><strong>Arquivo:</strong> {$e->getFile()} (linha {$e->getLine()})</p>";
    echo "<details><summary><strong>Stack Trace</strong></summary>";
    echo "<pre>{$e->getTraceAsString()}</pre>";
    echo "</details>";
    echo "</div>";
}

echo "</body></html>";
