<?php
/**
 * Verificar versão do código no servidor
 */

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Versão do Código</title>";
echo "<style>body{font-family:Arial;padding:20px;background:#f5f5f5;}h1{color:#333;}pre{background:#fff;padding:15px;border-left:4px solid #4CAF50;}</style></head><body>";

echo "<h1>🔍 Verificação de Versão do Código</h1>";

echo "<h2>1. Versão do arquivo app_bitdefender_reports.php</h2>";

$file = 'app_bitdefender_reports.php';
if (file_exists($file)) {
    $content = file_get_contents($file);
    
    // Verificar se tem o código atualizado
    $checks = [
        'targetIds' => strpos($content, 'targetIds') !== false,
        'getNetworkInventoryItems' => strpos($content, 'getNetworkInventoryItems') !== false,
        'intervalMap' => strpos($content, 'intervalMap') !== false,
        'reports (não reporting)' => strpos($content, "'/reports'") !== false || strpos($content, "'reports'") !== false,
    ];
    
    echo "<table border='1' cellpadding='10'>";
    echo "<tr><th>Verificação</th><th>Status</th></tr>";
    
    foreach ($checks as $check => $result) {
        $status = $result ? "✅ OK" : "❌ FALTA";
        $color = $result ? "green" : "red";
        echo "<tr><td>$check</td><td style='color:$color;font-weight:bold'>$status</td></tr>";
    }
    echo "</table>";
    
    // Mostrar última modificação
    $lastMod = date("d/m/Y H:i:s", filemtime($file));
    echo "<p><strong>Última modificação:</strong> $lastMod</p>";
    
    // Mostrar trecho do código
    echo "<h3>Trecho do código (linhas 320-350):</h3>";
    $lines = explode("\n", $content);
    $snippet = array_slice($lines, 320, 30);
    echo "<pre>" . htmlspecialchars(implode("\n", $snippet)) . "</pre>";
    
} else {
    echo "<p style='color:red'>❌ Arquivo não encontrado!</p>";
}

echo "<h2>2. Último commit do Git</h2>";
$gitLog = shell_exec('git log -1 --oneline 2>&1');
echo "<pre>" . htmlspecialchars($gitLog) . "</pre>";

echo "<h2>3. Status do Git</h2>";
$gitStatus = shell_exec('git status 2>&1');
echo "<pre>" . htmlspecialchars($gitStatus) . "</pre>";

echo "<h2>4. Fazer Pull</h2>";
echo "<p>Se o código estiver desatualizado, execute:</p>";
echo "<pre>git pull origin main</pre>";

echo "<hr>";
echo "<p><a href='test_final_format.php'>→ Testar criação de relatório</a></p>";

echo "</body></html>";
