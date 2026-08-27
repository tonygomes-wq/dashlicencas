<?php
/**
 * Corrigir client_access_url automaticamente
 */

require_once __DIR__ . '/srv/config.php';

echo "<h1>🔧 Correção Automática de URLs</h1>";

// 1. Verificar URLs problemáticas
$stmt = $pdo->query("
    SELECT id, company, client_access_url
    FROM bitdefender_licenses
    WHERE client_access_url LIKE '%/api%'
    ORDER BY id
");
$clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h2>1. URLs Antes da Correção:</h2>";
echo "<ul>";
foreach ($clients as $client) {
    echo "<li><strong>" . htmlspecialchars($client['company']) . ":</strong> <code>" . htmlspecialchars($client['client_access_url']) . "</code></li>";
}
echo "</ul>";

// 2. Aplicar correções
echo "<h2>2. Aplicando Correções...</h2>";

$fixed = 0;

foreach ($clients as $client) {
    $oldUrl = $client['client_access_url'];
    $newUrl = $oldUrl;
    
    // Remover /api/api duplicado
    $newUrl = str_replace('/api/api', '/api', $newUrl);
    
    // Remover /api do final
    if (substr($newUrl, -4) === '/api') {
        $newUrl = substr($newUrl, 0, -4);
    }
    
    if ($oldUrl !== $newUrl) {
        $stmt = $pdo->prepare("
            UPDATE bitdefender_licenses
            SET client_access_url = ?
            WHERE id = ?
        ");
        $stmt->execute([$newUrl, $client['id']]);
        
        echo "<div style='background: #e8f5e9; padding: 10px; margin: 5px 0; border-radius: 5px;'>";
        echo "<p><strong>" . htmlspecialchars($client['company']) . "</strong></p>";
        echo "<p>❌ <code>" . htmlspecialchars($oldUrl) . "</code></p>";
        echo "<p>✅ <code>" . htmlspecialchars($newUrl) . "</code></p>";
        echo "</div>";
        
        $fixed++;
    } else {
        echo "<p>⏭️ <strong>" . htmlspecialchars($client['company']) . ":</strong> Já está correto</p>";
    }
}

// 3. Verificar URLs após correção
echo "<h2>3. URLs Após Correção:</h2>";

$stmt = $pdo->query("
    SELECT id, company, client_access_url
    FROM bitdefender_licenses
    WHERE client_api_key IS NOT NULL
    ORDER BY id
");
$clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<ul>";
foreach ($clients as $client) {
    echo "<li><strong>" . htmlspecialchars($client['company']) . ":</strong> <code>" . htmlspecialchars($client['client_access_url']) . "</code></li>";
}
echo "</ul>";

// 4. Resumo
echo "<h2>✅ Resumo</h2>";
echo "<div style='background: #e3f2fd; padding: 15px; border-radius: 5px;'>";
echo "<p><strong>URLs corrigidas:</strong> $fixed</p>";
echo "<p><strong>Status:</strong> " . ($fixed > 0 ? "✅ Correções aplicadas com sucesso!" : "✅ Todas as URLs já estavam corretas") . "</p>";
echo "</div>";

if ($fixed > 0) {
    echo "<h2>🎯 Próximos Passos</h2>";
    echo "<ol>";
    echo "<li><a href='test_download_report.php'>Testar download do relatório #14 novamente</a></li>";
    echo "<li>Verificar se agora retorna HTTP 200 em vez de 404</li>";
    echo "<li>Se funcionar, o sistema baixará o PDF/CSV automaticamente</li>";
    echo "</ol>";
}

echo "<hr>";
echo "<p><a href='check_reports_status.php'>⬅️ Voltar para Status dos Relatórios</a></p>";
?>
