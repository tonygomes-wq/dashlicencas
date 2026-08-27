<?php
/**
 * Testar download de relatório #14
 */

require_once __DIR__ . '/srv/config.php';

echo "<h1>🔍 Teste de Download do Relatório #14</h1>";

// 1. Buscar relatório #14
$stmt = $pdo->prepare("
    SELECT br.*, bl.client_api_key, bl.client_access_url
    FROM bitdefender_reports br
    LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
    WHERE br.id = 14
");
$stmt->execute();
$report = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$report) {
    die("<p>❌ Relatório #14 não encontrado</p>");
}

echo "<h2>1. Dados do Relatório</h2>";
echo "<ul>";
echo "<li><strong>ID:</strong> " . $report['id'] . "</li>";
echo "<li><strong>Nome:</strong> " . htmlspecialchars($report['report_name']) . "</li>";
echo "<li><strong>Status:</strong> " . $report['status'] . "</li>";
echo "<li><strong>Bitdefender Report ID:</strong> " . ($report['bitdefender_report_id'] ?? '❌ NULL') . "</li>";
echo "<li><strong>Download URL:</strong> " . ($report['download_url'] ?? '❌ NULL') . "</li>";
echo "<li><strong>Cliente:</strong> " . htmlspecialchars($report['company'] ?? 'N/A') . "</li>";
echo "</ul>";

if (!$report['bitdefender_report_id']) {
    die("<p>❌ Relatório não tem Bitdefender Report ID</p>");
}

if (!$report['client_api_key']) {
    die("<p>❌ Cliente não tem API Key configurada</p>");
}

// 2. Chamar API getDownloadLinks
echo "<h2>2. Chamando API getDownloadLinks</h2>";

$apiUrl = rtrim($report['client_access_url'], '/') . '/api/v1.0/jsonrpc/reports';
$payload = [
    'params' => [
        'reportId' => $report['bitdefender_report_id']
    ],
    'jsonrpc' => '2.0',
    'method' => 'getDownloadLinks',
    'id' => uniqid()
];

echo "<p><strong>URL:</strong> <code>" . htmlspecialchars($apiUrl) . "</code></p>";
echo "<p><strong>Method:</strong> <code>getDownloadLinks</code></p>";
echo "<p><strong>Report ID:</strong> <code>" . htmlspecialchars($report['bitdefender_report_id']) . "</code></p>";

echo "<h3>📦 Payload Enviado:</h3>";
echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
echo json_encode($payload, JSON_PRETTY_PRINT);
echo "</pre>";

// Fazer requisição
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($report['client_api_key'])
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "<h3>📨 Resposta da API:</h3>";
echo "<p><strong>HTTP Code:</strong> $httpCode</p>";

if ($curlError) {
    echo "<p style='color: red;'><strong>Erro cURL:</strong> $curlError</p>";
}

echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
$responseData = json_decode($response, true);
echo json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
echo "</pre>";

// 3. Analisar resposta
echo "<h2>3. Análise da Resposta</h2>";

if ($httpCode !== 200) {
    echo "<p style='color: red;'>❌ <strong>Erro HTTP:</strong> $httpCode</p>";
    echo "<p>O servidor retornou um código de erro.</p>";
} else {
    echo "<p style='color: green;'>✅ <strong>HTTP 200 OK</strong></p>";
}

if (isset($responseData['error'])) {
    echo "<div style='background: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid red;'>";
    echo "<h3>❌ Erro na API</h3>";
    echo "<p><strong>Código:</strong> " . $responseData['error']['code'] . "</p>";
    echo "<p><strong>Mensagem:</strong> " . htmlspecialchars($responseData['error']['message']) . "</p>";
    
    if (isset($responseData['error']['data'])) {
        echo "<p><strong>Detalhes:</strong></p>";
        echo "<pre>" . json_encode($responseData['error']['data'], JSON_PRETTY_PRINT) . "</pre>";
    }
    
    // Possíveis causas
    echo "<h4>💡 Possíveis Causas:</h4>";
    echo "<ul>";
    
    if ($responseData['error']['code'] === -32602) {
        echo "<li>Parâmetro <code>reportId</code> inválido ou em formato errado</li>";
        echo "<li>O Report ID pode estar incorreto: <code>" . htmlspecialchars($report['bitdefender_report_id']) . "</code></li>";
    } elseif ($responseData['error']['code'] === -32601) {
        echo "<li>Método não existe (verificar nome: <code>getDownloadLinks</code>)</li>";
        echo "<li>Módulo incorreto (deveria ser <code>reports</code>)</li>";
    } elseif ($responseData['error']['code'] === -32000) {
        echo "<li>Relatório ainda está sendo processado pela Bitdefender</li>";
        echo "<li>⏰ <strong>Aguarde alguns minutos e tente novamente</strong></li>";
    } else {
        echo "<li>Erro desconhecido. Verifique a documentação da API.</li>";
    }
    
    echo "</ul>";
    echo "</div>";
    
} elseif (isset($responseData['result'])) {
    echo "<div style='background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid green;'>";
    echo "<h3>✅ Sucesso!</h3>";
    
    if (isset($responseData['result']['url'])) {
        $downloadUrl = $responseData['result']['url'];
        echo "<p><strong>Download URL:</strong></p>";
        echo "<p><code>" . htmlspecialchars($downloadUrl) . "</code></p>";
        
        // Atualizar banco de dados
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET download_url = ?,
                download_url_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
            WHERE id = ?
        ");
        $stmt->execute([$downloadUrl, $report['id']]);
        
        echo "<p style='color: green;'>✅ URL salva no banco de dados!</p>";
        
        echo "<h4>🎯 Próximos Passos:</h4>";
        echo "<ol>";
        echo "<li>Fazer download do arquivo ZIP</li>";
        echo "<li>Extrair PDF e CSV</li>";
        echo "<li>Salvar em <code>/var/www/html/storage/reports/</code></li>";
        echo "<li>Atualizar paths no banco de dados</li>";
        echo "</ol>";
        
        echo "<p><a href='test_download_and_extract.php?report_id=14' style='background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;'>▶️ Baixar e Extrair Arquivos</a></p>";
        
    } else {
        echo "<p style='color: orange;'>⚠️ Resposta não contém URL de download</p>";
        echo "<p>Estrutura recebida:</p>";
        echo "<pre>" . json_encode($responseData['result'], JSON_PRETTY_PRINT) . "</pre>";
    }
    
    echo "</div>";
}

echo "<hr>";
echo "<p><a href='check_reports_status.php'>⬅️ Voltar para Status dos Relatórios</a></p>";
?>
