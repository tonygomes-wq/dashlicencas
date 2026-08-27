<?php
/**
 * Verificar versão do arquivo test_download_report.php no servidor
 */

$file = __DIR__ . '/test_download_report.php';

echo "<h1>🔍 Verificação de Deploy</h1>";

if (!file_exists($file)) {
    die("<p style='color: red;'>❌ Arquivo não encontrado: $file</p>");
}

echo "<h2>Informações do Arquivo:</h2>";
echo "<ul>";
echo "<li><strong>Caminho:</strong> " . realpath($file) . "</li>";
echo "<li><strong>Última modificação:</strong> " . date('d/m/Y H:i:s', filemtime($file)) . "</li>";
echo "<li><strong>Tamanho:</strong> " . filesize($file) . " bytes</li>";
echo "</ul>";

// Procurar pela linha corrigida
$content = file_get_contents($file);

echo "<h2>Verificação da Correção:</h2>";

if (strpos($content, "base64_encode(\$report['client_api_key'] . ':')") !== false) {
    echo "<div style='background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid green;'>";
    echo "<h3>✅ CÓDIGO ATUALIZADO!</h3>";
    echo "<p>A correção de autenticação está presente no arquivo.</p>";
    echo "<p>Linha encontrada: <code>base64_encode(\$report['client_api_key'] . ':')</code></p>";
    echo "</div>";
    
    echo "<h3>🎯 Próximo Passo:</h3>";
    echo "<p><a href='test_download_report.php' style='background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>▶️ Executar Teste de Download</a></p>";
    
} elseif (strpos($content, "base64_encode(\$report['client_api_key'])") !== false) {
    echo "<div style='background: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid red;'>";
    echo "<h3>❌ CÓDIGO ANTIGO!</h3>";
    echo "<p>O arquivo ainda está com a versão antiga (sem ':' na autenticação).</p>";
    echo "<p>Linha antiga encontrada: <code>base64_encode(\$report['client_api_key'])</code></p>";
    echo "</div>";
    
    echo "<h3>🔧 Como Corrigir:</h3>";
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px;'>";
    echo "<p><strong>Opção 1:</strong> Fazer deploy/sync do código do GitHub</p>";
    echo "<p><strong>Opção 2:</strong> Fazer upload manual do arquivo atualizado</p>";
    echo "<p><strong>Opção 3:</strong> Editar diretamente no servidor via FTP/SSH</p>";
    echo "</div>";
    
} else {
    echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid orange;'>";
    echo "<h3>⚠️ NÃO ENCONTRADO</h3>";
    echo "<p>A linha de autenticação não foi encontrada no formato esperado.</p>";
    echo "</div>";
}

// Mostrar hash para comparação
echo "<h2>Hash do Arquivo (MD5):</h2>";
echo "<p><code>" . md5_file($file) . "</code></p>";

// Mostrar últimas linhas do git log (se disponível)
if (function_exists('shell_exec')) {
    echo "<h2>Último Commit (Git):</h2>";
    $gitLog = shell_exec('cd ' . __DIR__ . ' && git log -1 --oneline 2>&1');
    if ($gitLog) {
        echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
        echo htmlspecialchars($gitLog);
        echo "</pre>";
    } else {
        echo "<p>⚠️ Git não disponível</p>";
    }
}

echo "<hr>";
echo "<p><a href='check_reports_status.php'>⬅️ Voltar para Status dos Relatórios</a></p>";
?>
