<?php
/**
 * Verificar status dos relatórios no banco
 */

require_once 'srv/config.php';

header('Content-Type: text/html; charset=UTF-8');

echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Status dos Relatórios</title>";
echo "<style>
body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
h1 { color: #333; }
table { width: 100%; background: white; border-collapse: collapse; margin: 20px 0; }
th { background: #4CAF50; color: white; padding: 12px; text-align: left; }
td { padding: 10px; border-bottom: 1px solid #ddd; }
.ready { color: green; font-weight: bold; }
.failed { color: red; font-weight: bold; }
.generating { color: orange; font-weight: bold; }
.downloaded { color: blue; font-weight: bold; }
pre { background: #f5f5f5; padding: 10px; overflow-x: auto; font-size: 11px; }
</style></head><body>";

echo "<h1>📊 Status dos Relatórios</h1>";

$stmt = $pdo->query("
    SELECT 
        br.id,
        br.report_name,
        br.status,
        br.bitdefender_report_id,
        br.created_at,
        br.generation_started_at,
        br.generation_completed_at,
        br.downloaded_at,
        br.pdf_path,
        br.csv_path,
        br.download_url,
        br.download_url_expires_at,
        br.error_message,
        bl.company
    FROM bitdefender_reports br
    LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
    ORDER BY br.created_at DESC
    LIMIT 10
");

$reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<table>";
echo "<tr>";
echo "<th>ID</th>";
echo "<th>Cliente</th>";
echo "<th>Nome</th>";
echo "<th>Status</th>";
echo "<th>Bitdefender ID</th>";
echo "<th>Criado</th>";
echo "<th>PDF</th>";
echo "<th>CSV</th>";
echo "<th>Download URL</th>";
echo "</tr>";

foreach ($reports as $r) {
    $statusClass = $r['status'];
    
    echo "<tr>";
    echo "<td>{$r['id']}</td>";
    echo "<td>{$r['company']}</td>";
    echo "<td>{$r['report_name']}</td>";
    echo "<td class='$statusClass'>" . strtoupper($r['status']) . "</td>";
    echo "<td>" . ($r['bitdefender_report_id'] ?: '-') . "</td>";
    echo "<td>" . date('d/m/Y H:i', strtotime($r['created_at'])) . "</td>";
    
    // PDF
    if ($r['pdf_path'] && file_exists($r['pdf_path'])) {
        echo "<td>✅ OK (" . round(filesize($r['pdf_path'])/1024, 1) . " KB)</td>";
    } else {
        echo "<td>❌ " . ($r['pdf_path'] ?: 'Não gerado') . "</td>";
    }
    
    // CSV
    if ($r['csv_path'] && file_exists($r['csv_path'])) {
        echo "<td>✅ OK (" . round(filesize($r['csv_path'])/1024, 1) . " KB)</td>";
    } else {
        echo "<td>❌ " . ($r['csv_path'] ?: 'Não gerado') . "</td>";
    }
    
    // URL
    if ($r['download_url']) {
        $expired = $r['download_url_expires_at'] && strtotime($r['download_url_expires_at']) < time();
        echo "<td>" . ($expired ? "⚠️ Expirada" : "✅ Válida") . "</td>";
    } else {
        echo "<td>❌ Não disponível</td>";
    }
    
    echo "</tr>";
    
    // Linha extra com erro se houver
    if ($r['error_message']) {
        echo "<tr><td colspan='9' style='background:#fff3cd;color:#856404;padding:10px'>";
        echo "<strong>Erro:</strong> " . htmlspecialchars($r['error_message']);
        echo "</td></tr>";
    }
}

echo "</table>";

// Verificar últimos 3 relatórios em detalhes
echo "<h2>🔍 Detalhes dos Últimos 3 Relatórios</h2>";

foreach (array_slice($reports, 0, 3) as $r) {
    echo "<h3>#{$r['id']} - {$r['report_name']}</h3>";
    echo "<div style='background:white;padding:15px;margin:10px 0;'>";
    echo "<strong>Status:</strong> <span class='{$r['status']}'>" . strtoupper($r['status']) . "</span><br>";
    echo "<strong>Bitdefender Report ID:</strong> " . ($r['bitdefender_report_id'] ?: '❌ Não criado') . "<br>";
    echo "<strong>Download URL:</strong> " . ($r['download_url'] ? "✅ Existe" : "❌ Não disponível") . "<br>";
    
    if ($r['download_url']) {
        echo "<strong>URL Expira em:</strong> " . ($r['download_url_expires_at'] ? date('d/m/Y H:i', strtotime($r['download_url_expires_at'])) : '-') . "<br>";
    }
    
    echo "<strong>PDF Path:</strong> " . ($r['pdf_path'] ?: '❌ Não definido') . "<br>";
    echo "<strong>CSV Path:</strong> " . ($r['csv_path'] ?: '❌ Não definido') . "<br>";
    
    if ($r['error_message']) {
        echo "<div style='background:#f8d7da;padding:10px;margin:10px 0;border-left:4px solid #f44336'>";
        echo "<strong>Mensagem de Erro:</strong><br>";
        echo "<pre>" . htmlspecialchars($r['error_message']) . "</pre>";
        echo "</div>";
    }
    
    echo "</div>";
}

echo "<hr>";
echo "<h2>💡 O Que Fazer?</h2>";

$readyCount = 0;
foreach ($reports as $r) {
    if ($r['status'] === 'ready' && $r['bitdefender_report_id']) {
        $readyCount++;
    }
}

if ($readyCount > 0) {
    echo "<p>✅ <strong>$readyCount relatório(s) pronto(s)</strong> aguardando download.</p>";
    echo "<p>O sistema tentou baixar automaticamente, mas pode ter falhado.</p>";
    echo "<p><strong>Soluções:</strong></p>";
    echo "<ol>";
    echo "<li>Aguardar o cron executar (a cada 5 minutos)</li>";
    echo "<li>Ou implementar botão manual de 'Baixar PDF/CSV'</li>";
    echo "<li>Ou buscar o link de download via API getDownloadLinks</li>";
    echo "</ol>";
}

echo "</body></html>";
