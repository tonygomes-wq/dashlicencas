<?php
/**
 * Verificar se o código no servidor está atualizado
 */

echo "<h1>🔍 Verificação do Código no Servidor</h1>";

// 1. Verificar arquivo app_bitdefender_reports.php
$file = __DIR__ . '/app_bitdefender_reports.php';

if (!file_exists($file)) {
    echo "<p>❌ Arquivo não encontrado: $file</p>";
    exit;
}

echo "<h2>1. Informações do Arquivo</h2>";
echo "<ul>";
echo "<li><strong>Caminho:</strong> " . realpath($file) . "</li>";
echo "<li><strong>Última modificação:</strong> " . date('d/m/Y H:i:s', filemtime($file)) . "</li>";
echo "<li><strong>Tamanho:</strong> " . number_format(filesize($file)) . " bytes</li>";
echo "</ul>";

// 2. Buscar pela linha corrigida
echo "<h2>2. Verificação da Correção (Linha 394-399)</h2>";

$lines = file($file);
$found = false;
$context = [];

// Procurar pela correção
for ($i = 390; $i < 405 && $i < count($lines); $i++) {
    $line = $lines[$i];
    $context[] = sprintf("Linha %d: %s", $i + 1, htmlspecialchars($line));
    
    // Verificar se contém a correção
    if (strpos($line, 'is_string($result[\'result\'])') !== false) {
        $found = true;
    }
}

echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
echo implode("", $context);
echo "</pre>";

if ($found) {
    echo "<p style='color: green; font-weight: bold;'>✅ CORREÇÃO ENCONTRADA! Código está atualizado.</p>";
    echo "<p>A linha contém: <code>is_string(\$result['result']) ? \$result['result'] : (\$result['result']['reportId'] ?? null)</code></p>";
} else {
    echo "<p style='color: red; font-weight: bold;'>❌ CORREÇÃO NÃO ENCONTRADA! Código NÃO está atualizado.</p>";
    echo "<p>Esperado: <code>is_string(\$result['result']) ? \$result['result'] : (\$result['result']['reportId'] ?? null)</code></p>";
    echo "<p><strong>Ação necessária:</strong> Fazer deploy da versão corrigida!</p>";
}

// 3. Verificar hash do arquivo
echo "<h2>3. Hash do Arquivo (para comparação)</h2>";
echo "<p><code>" . md5_file($file) . "</code></p>";

// 4. Verificar Git status (se disponível)
echo "<h2>4. Status do Git</h2>";
if (function_exists('shell_exec')) {
    $gitStatus = shell_exec('cd ' . __DIR__ . ' && git log -1 --oneline 2>&1');
    if ($gitStatus) {
        echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
        echo htmlspecialchars($gitStatus);
        echo "</pre>";
    } else {
        echo "<p>⚠️ Não foi possível executar comando git</p>";
    }
} else {
    echo "<p>⚠️ shell_exec() não disponível</p>";
}

// 5. Instruções para atualizar
echo "<h2>5. Como Atualizar o Código</h2>";
echo "<div style='background: #fffacd; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<h3>Se estiver usando EasyPanel:</h3>";
echo "<ol>";
echo "<li>Acesse o painel do EasyPanel</li>";
echo "<li>Vá em <strong>Projects → dashlicencas → Deploy</strong></li>";
echo "<li>Clique em <strong>Rebuild</strong> ou <strong>Redeploy</strong></li>";
echo "<li>Aguarde 2-3 minutos</li>";
echo "<li>Execute este script novamente para verificar</li>";
echo "</ol>";

echo "<h3>Se estiver usando Docker diretamente:</h3>";
echo "<pre>cd /caminho/do/projeto\n";
echo "git pull origin main\n";
echo "docker-compose down\n";
echo "docker-compose up -d --build</pre>";

echo "<h3>Se for servidor tradicional (Apache/Nginx):</h3>";
echo "<pre>cd /var/www/html\n";
echo "git pull origin main\n";
echo "sudo systemctl reload apache2  # ou nginx</pre>";
echo "</div>";

echo "<hr>";
echo "<p><a href='check_reports_status.php'>⬅️ Voltar para Status dos Relatórios</a></p>";
?>
