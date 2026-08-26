<?php
/**
 * Debug detalhado do erro ao gerar relatório
 */

// Ativar TODOS os erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Debug Relatório</title>";
echo "<style>
body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #d4d4d4; }
h1 { color: #4ec9b0; }
h2 { color: #dcdcaa; margin-top: 30px; }
.success { color: #4ec9b0; }
.error { color: #f48771; }
.warning { color: #ce9178; }
pre { background: #2d2d2d; padding: 15px; border-left: 3px solid #007acc; overflow-x: auto; }
.box { background: #252526; padding: 15px; margin: 10px 0; border: 1px solid #3e3e42; }
</style></head><body>";

echo "<h1>🔍 Debug de Erro ao Gerar Relatório</h1>";

try {
    echo "<h2>1. Verificar versão do PHP</h2>";
    echo "<div class='box'>";
    echo "<strong>Versão:</strong> " . PHP_VERSION . "<br>";
    echo "<strong>str_ends_with existe?</strong> " . (function_exists('str_ends_with') ? '✅ Sim' : '❌ Não') . "<br>";
    echo "</div>";

    echo "<h2>2. Incluir arquivos necessários</h2>";
    
    echo "<div class='box'>";
    echo "Incluindo srv/config.php... ";
    require_once 'srv/config.php';
    echo "<span class='success'>✅ OK</span><br>";
    
    echo "Incluindo php_compat_helpers.php... ";
    require_once 'php_compat_helpers.php';
    echo "<span class='success'>✅ OK</span><br>";
    
    echo "Incluindo app_auth.php... ";
    require_once 'app_auth.php';
    echo "<span class='success'>✅ OK</span><br>";
    
    echo "<strong>str_ends_with existe agora?</strong> " . (function_exists('str_ends_with') ? '✅ Sim' : '❌ Não') . "<br>";
    echo "</div>";

    echo "<h2>3. Testar função str_ends_with</h2>";
    echo "<div class='box'>";
    $test1 = str_ends_with('https://test.com/api', '/api');
    echo "str_ends_with('https://test.com/api', '/api') = " . ($test1 ? 'true' : 'false') . " <span class='success'>✅</span><br>";
    
    $test2 = str_ends_with('https://test.com', '/api');
    echo "str_ends_with('https://test.com', '/api') = " . ($test2 ? 'true' : 'false') . " <span class='success'>✅</span><br>";
    echo "</div>";

    echo "<h2>4. Verificar sessão</h2>";
    echo "<div class='box'>";
    session_start();
    
    if (isset($_SESSION['user_id'])) {
        echo "<span class='success'>✅ Usuário logado: ID {$_SESSION['user_id']}</span><br>";
        
        $stmt = $pdo->prepare("SELECT id, email FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "<strong>Email:</strong> {$user['email']}<br>";
        }
    } else {
        echo "<span class='error'>❌ Usuário NÃO está logado</span><br>";
        echo "<span class='warning'>⚠️ Vou simular login para continuar o teste...</span><br>";
        
        $stmt = $pdo->query("SELECT id, email FROM users LIMIT 1");
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $_SESSION['user_id'] = $user['id'];
            echo "<span class='success'>✅ Simulado: {$user['email']}</span><br>";
        }
    }
    echo "</div>";

    echo "<h2>5. Buscar cliente Bitdefender</h2>";
    echo "<div class='box'>";
    
    $stmt = $pdo->query("SELECT * FROM bitdefender_licenses WHERE client_api_key IS NOT NULL AND client_api_key != '' LIMIT 1");
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($client) {
        echo "<span class='success'>✅ Cliente encontrado</span><br>";
        echo "<strong>ID:</strong> {$client['id']}<br>";
        echo "<strong>Empresa:</strong> {$client['company']}<br>";
        echo "<strong>API Key:</strong> " . substr($client['client_api_key'], 0, 10) . "... <span class='success'>✅ Configurada</span><br>";
        echo "<strong>Access URL:</strong> {$client['client_access_url']}<br>";
    } else {
        echo "<span class='error'>❌ Nenhum cliente com API Key encontrado</span><br>";
        
        $stmt = $pdo->query("SELECT * FROM bitdefender_licenses LIMIT 1");
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($client) {
            echo "<span class='warning'>⚠️ Cliente sem API Key: {$client['company']}</span><br>";
        } else {
            die("<span class='error'>❌ Nenhum cliente encontrado no banco</span>");
        }
    }
    echo "</div>";

    echo "<h2>6. Simular chamada à API (função callBitdefenderAPI)</h2>";
    echo "<div class='box'>";
    
    // Incluir a definição da função
    echo "Carregando função callBitdefenderAPI...<br>";
    
    // Função inline para teste
    function callBitdefenderAPI_TEST($accessUrl, $apiKey, $apiModule, $method, $params = []) {
        $accessUrl = rtrim($accessUrl, '/');
        
        echo "📍 URL original: $accessUrl<br>";
        
        // Normalizar URL
        if (!str_ends_with($accessUrl, '/jsonrpc')) {
            echo "  → Não termina com /jsonrpc<br>";
            if (!str_ends_with($accessUrl, '/api')) {
                echo "  → Adicionando /api<br>";
                $accessUrl .= '/api';
            }
            echo "  → Adicionando /v1.0/jsonrpc<br>";
            $accessUrl .= '/v1.0/jsonrpc';
        }
        
        echo "📍 URL normalizada: $accessUrl<br>";
        
        $url = $accessUrl . '/' . $apiModule;
        echo "📍 URL final: $url<br>";
        
        $payload = json_encode([
            'params' => $params,
            'jsonrpc' => '2.0',
            'method' => $method,
            'id' => uniqid('report_', true)
        ]);
        
        echo "📦 Payload:<br>";
        echo "<pre>" . json_encode(json_decode($payload), JSON_PRETTY_PRINT) . "</pre>";
        
        echo "<span class='success'>✅ Função executou sem erros</span><br>";
        
        return ['result' => ['reportId' => 'TEST_123']];
    }
    
    if ($client && $client['client_api_key']) {
        try {
            $result = callBitdefenderAPI_TEST(
                $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com',
                $client['client_api_key'],
                'reporting',
                'createReport',
                [
                    'type' => 12,
                    'options' => [
                        'reportingInterval' => 'thisWeek',
                        'filterType' => 0
                    ]
                ]
            );
            
            echo "<span class='success'>✅ Teste de chamada OK</span><br>";
            echo "<pre>" . print_r($result, true) . "</pre>";
            
        } catch (Exception $e) {
            echo "<span class='error'>❌ ERRO: {$e->getMessage()}</span><br>";
            echo "<pre>{$e->getTraceAsString()}</pre>";
        }
    } else {
        echo "<span class='warning'>⚠️ Pulando teste (sem API Key)</span><br>";
    }
    
    echo "</div>";

    echo "<h2>7. Testar INSERT no banco</h2>";
    echo "<div class='box'>";
    
    try {
        $reportName = "Teste Debug - " . date('d/m/Y H:i:s');
        
        $stmt = $pdo->prepare("
            INSERT INTO bitdefender_reports (
                client_id, user_id, report_name, report_type, report_type_name,
                status, generation_mode, reporting_interval, filter_type, 
                detailed_export, custom_params, generation_started_at
            ) VALUES (?, ?, ?, 12, 'Malware Status', 'pending', 'instant', 'thisWeek', 0, 1, '{}', NOW())
        ");
        
        $result = $stmt->execute([
            $client['id'],
            $user['id'],
            $reportName
        ]);
        
        if ($result) {
            $reportId = $pdo->lastInsertId();
            echo "<span class='success'>✅ INSERT OK - ID: $reportId</span><br>";
            
            // Deletar o teste
            $pdo->exec("DELETE FROM bitdefender_reports WHERE id = $reportId");
            echo "<span class='success'>✅ Teste deletado</span><br>";
        }
        
    } catch (Exception $e) {
        echo "<span class='error'>❌ ERRO: {$e->getMessage()}</span><br>";
    }
    
    echo "</div>";

    echo "<h2>✅ Conclusão</h2>";
    echo "<div class='box'>";
    echo "<strong>Se todos os testes acima passaram, o erro pode ser:</strong><br>";
    echo "1. Problema na resposta da API Bitdefender real<br>";
    echo "2. Timeout na chamada HTTP<br>";
    echo "3. Erro de rede/firewall<br>";
    echo "<br>";
    echo "<strong>Próximo passo:</strong> Tente gerar o relatório novamente e veja os logs do servidor em /var/log/apache2/error.log<br>";
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='box' style='border-color: #f48771;'>";
    echo "<h2 class='error'>❌ ERRO FATAL</h2>";
    echo "<strong>Mensagem:</strong> {$e->getMessage()}<br>";
    echo "<strong>Arquivo:</strong> {$e->getFile()} (linha {$e->getLine()})<br>";
    echo "<h3>Stack Trace:</h3>";
    echo "<pre>{$e->getTraceAsString()}</pre>";
    echo "</div>";
}

echo "</body></html>";
