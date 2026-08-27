<?php
/**
 * Verificar client_access_url no banco de dados
 */

require_once __DIR__ . '/srv/config.php';

echo "<h1>🔍 Verificação das URLs dos Clientes</h1>";

$stmt = $pdo->query("
    SELECT id, company, client_access_url
    FROM bitdefender_licenses
    WHERE client_api_key IS NOT NULL
    ORDER BY id
");
$clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<h2>URLs Configuradas:</h2>";
echo "<table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%;'>";
echo "<tr style='background: #f5f5f5;'>";
echo "<th>ID</th><th>Cliente</th><th>URL Configurada</th><th>Status</th><th>Ação</th>";
echo "</tr>";

foreach ($clients as $client) {
    $url = $client['client_access_url'];
    $hasDoubleApi = strpos($url, '/api/api') !== false;
    $endsWithApi = substr($url, -4) === '/api';
    
    echo "<tr>";
    echo "<td>" . $client['id'] . "</td>";
    echo "<td>" . htmlspecialchars($client['company']) . "</td>";
    echo "<td><code>" . htmlspecialchars($url) . "</code></td>";
    
    if ($hasDoubleApi) {
        echo "<td style='color: red; font-weight: bold;'>❌ URL duplicada (/api/api)</td>";
        echo "<td>Corrigir</td>";
    } elseif ($endsWithApi) {
        echo "<td style='color: orange;'>⚠️ Termina com /api</td>";
        echo "<td>Remover /api</td>";
    } else {
        echo "<td style='color: green;'>✅ OK</td>";
        echo "<td>-</td>";
    }
    
    echo "</tr>";
}

echo "</table>";

echo "<h2>📋 URL Padrão Correta:</h2>";
echo "<div style='background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<p><strong>Formato:</strong></p>";
echo "<p><code>https://cloud.gravityzone.bitdefender.com</code></p>";
echo "<p style='color: #666; font-size: 0.9em;'>SEM /api no final! O código adiciona automaticamente.</p>";
echo "</div>";

echo "<h2>🔧 Script de Correção SQL:</h2>";
echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
echo "<p>Se houver URLs incorretas, execute:</p>";
echo "<pre style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";
echo "UPDATE bitdefender_licenses\n";
echo "SET client_access_url = REPLACE(client_access_url, '/api/api', '/api')\n";
echo "WHERE client_access_url LIKE '%/api/api%';\n\n";

echo "UPDATE bitdefender_licenses\n";
echo "SET client_access_url = TRIM(TRAILING '/api' FROM client_access_url)\n";
echo "WHERE client_access_url LIKE '%/api';\n";
echo "</pre>";
echo "<p><a href='fix_client_urls.php' style='background: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>⚠️ Executar Correção Automática</a></p>";
echo "</div>";

echo "<hr>";
echo "<p><a href='check_reports_status.php'>⬅️ Voltar para Status dos Relatórios</a></p>";
?>
