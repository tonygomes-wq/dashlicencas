<?php
/**
 * Download direto do relatório #14 usando a função callBitdefenderAPI
 * Esta versão usa a função que JÁ tem autenticação correta
 */

require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_bitdefender_reports.php';

echo "<h1>📥 Download Direto do Relatório #14</h1>";

// Buscar relatório #14
$stmt = $pdo->prepare("
    SELECT br.*, bl.client_api_key, bl.client_access_url, bl.id as client_id
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
echo "<li><strong>Bitdefender Report ID:</strong> " . ($report['bitdefender_report_id'] ?? '❌') . "</li>";
echo "</ul>";

if (!$report['bitdefender_report_id']) {
    die("<p>❌ Relatório não tem Bitdefender Report ID</p>");
}

// 2. Chamar API getDownloadLinks usando a função correta
echo "<h2>2. Buscando Link de Download...</h2>";

try {
    $result = callBitdefenderAPI(
        $report['client_access_url'],
        $report['client_api_key'],
        'reports',
        'getDownloadLinks',
        ['reportId' => $report['bitdefender_report_id']]
    );
    
    echo "<div style='background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid green;'>";
    echo "<h3>✅ Sucesso!</h3>";
    echo "<pre>" . json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "</pre>";
    echo "</div>";
    
    // API pode retornar 'url' ou 'lastInstanceUrl'
    $downloadUrl = $result['result']['url'] ?? $result['result']['lastInstanceUrl'] ?? null;
    
    if ($downloadUrl) {
        
        echo "<h3>📥 URL de Download Obtida:</h3>";
        echo "<p><code>" . htmlspecialchars($downloadUrl) . "</code></p>";
        
        // Salvar no banco
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET download_url = ?,
                download_url_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
            WHERE id = ?
        ");
        $stmt->execute([$downloadUrl, $report['id']]);
        
        echo "<p style='color: green;'>✅ URL salva no banco de dados!</p>";
        
        // 3. Fazer download
        echo "<h2>3. Fazendo Download do Arquivo...</h2>";
        
        try {
            // Criar diretório
            $reportsDir = __DIR__ . '/storage/reports/' . $report['client_id'];
            if (!file_exists($reportsDir)) {
                mkdir($reportsDir, 0755, true);
                echo "<p>✅ Diretório criado: $reportsDir</p>";
            }
            
            // Download
            echo "<p>⏳ Baixando arquivo...</p>";
            $ch = curl_init($downloadUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 300);
            
            // Adicionar autenticação
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Basic ' . base64_encode($report['client_api_key'] . ':')
            ]);
            
            $fileContent = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode !== 200 || !$fileContent) {
                throw new Exception("Erro ao baixar: HTTP $httpCode");
            }
            
            echo "<p>✅ Arquivo baixado (" . number_format(strlen($fileContent)) . " bytes)</p>";
            
            // Salvar temporário
            $tempFile = $reportsDir . '/temp_14.download';
            file_put_contents($tempFile, $fileContent);
            
            // Verificar tipo
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $tempFile);
            finfo_close($finfo);
            
            echo "<p>📄 Tipo de arquivo: <code>$mimeType</code></p>";
            
            $pdfPath = null;
            $csvPath = null;
            
            if ($mimeType === 'application/zip' || $mimeType === 'application/x-zip-compressed') {
                echo "<p>📦 Extraindo ZIP...</p>";
                
                $zip = new ZipArchive();
                if ($zip->open($tempFile) === TRUE) {
                    echo "<p>✅ ZIP aberto com sucesso</p>";
                    echo "<ul>";
                    
                    for ($i = 0; $i < $zip->numFiles; $i++) {
                        $filename = $zip->getNameIndex($i);
                        $fileinfo = pathinfo($filename);
                        
                        echo "<li>Arquivo $i: " . htmlspecialchars($filename) . "</li>";
                        
                        if (isset($fileinfo['extension'])) {
                            if (strtolower($fileinfo['extension']) === 'pdf') {
                                $pdfPath = $reportsDir . '/report_14.pdf';
                                copy("zip://" . $tempFile . "#" . $filename, $pdfPath);
                                echo "<li style='color: green;'>✅ PDF extraído: " . basename($pdfPath) . "</li>";
                            } elseif (strtolower($fileinfo['extension']) === 'csv') {
                                $csvPath = $reportsDir . '/report_14.csv';
                                copy("zip://" . $tempFile . "#" . $filename, $csvPath);
                                echo "<li style='color: green;'>✅ CSV extraído: " . basename($csvPath) . "</li>";
                            }
                        }
                    }
                    
                    echo "</ul>";
                    $zip->close();
                    unlink($tempFile);
                } else {
                    throw new Exception("Erro ao abrir ZIP");
                }
            } else {
                echo "<p>⚠️ Não é um ZIP, salvando como PDF</p>";
                $pdfPath = $reportsDir . '/report_14.pdf';
                rename($tempFile, $pdfPath);
            }
            
            // Atualizar banco
            $stmt = $pdo->prepare("
                UPDATE bitdefender_reports
                SET status = 'downloaded',
                    pdf_path = ?,
                    csv_path = ?,
                    pdf_size_kb = ?,
                    csv_size_kb = ?,
                    downloaded_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $pdfPath,
                $csvPath,
                $pdfPath && file_exists($pdfPath) ? round(filesize($pdfPath) / 1024, 2) : null,
                $csvPath && file_exists($csvPath) ? round(filesize($csvPath) / 1024, 2) : null,
                $report['id']
            ]);
            
            echo "<h3>✅ DOWNLOAD CONCLUÍDO!</h3>";
            echo "<div style='background: #e8f5e9; padding: 15px; border-radius: 5px;'>";
            echo "<ul>";
            if ($pdfPath) echo "<li>✅ PDF: <code>$pdfPath</code> (" . round(filesize($pdfPath)/1024, 2) . " KB)</li>";
            if ($csvPath) echo "<li>✅ CSV: <code>$csvPath</code> (" . round(filesize($csvPath)/1024, 2) . " KB)</li>";
            echo "</ul>";
            echo "</div>";
            
            echo "<h3>🎯 Testar Downloads:</h3>";
            echo "<p><a href='app_bitdefender_reports.php?action=download&id=14&type=pdf' style='background: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;'>📄 Download PDF</a>";
            echo "<a href='app_bitdefender_reports.php?action=download&id=14&type=csv' style='background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>📊 Download CSV</a></p>";
            
        } catch (Exception $e) {
            echo "<div style='background: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid red;'>";
            echo "<h3>❌ Erro no Download</h3>";
            echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
            echo "</div>";
        }
        
    } else {
        echo "<p style='color: orange;'>⚠️ Resposta não contém URL</p>";
    }
    
} catch (Exception $e) {
    echo "<div style='background: #ffebee; padding: 15px; border-radius: 5px; border-left: 4px solid red;'>";
    echo "<h3>❌ Erro na API</h3>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
}

echo "<hr>";
echo "<p><a href='check_reports_status.php'>⬅️ Voltar para Status dos Relatórios</a></p>";
?>
