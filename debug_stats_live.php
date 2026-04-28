<?php
/**
 * Debug ao vivo do endpoint de estatísticas
 * Acesse: https://dashlicencas.macip.com.br/debug_stats_live.php
 */

header('Content-Type: text/html; charset=UTF-8');
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 Debug Estatísticas Bitdefender</h1>";
echo "<pre>";

echo "=== 1. VERIFICAR CONEXÃO COM BANCO ===\n";
try {
    require_once __DIR__ . '/srv/config.php';
    echo "✅ Conexão com banco estabelecida\n\n";
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n\n";
    exit;
}

echo "=== 2. VERIFICAR COLUNAS DA TABELA ===\n";
try {
    $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredColumns = ['used_slots', 'total_slots', 'license_usage_percent', 'license_usage_alert'];
    
    foreach ($requiredColumns as $col) {
        $exists = in_array($col, $columns);
        echo ($exists ? "✅" : "❌") . " $col\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n\n";
}

echo "=== 3. CONTAR REGISTROS ===\n";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_licenses");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Total de registros: {$count['total']}\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_licenses WHERE client_api_key IS NOT NULL AND client_api_key != ''");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "Com API Key: {$count['total']}\n\n";
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n\n";
}

echo "=== 4. TESTAR QUERY DE ESTATÍSTICAS ===\n";
try {
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as total_licenses,
            SUM(COALESCE(total_slots, total_licenses, 0)) as total_slots,
            SUM(COALESCE(used_slots, 0)) as used_slots,
            SUM(COALESCE(total_slots, total_licenses, 0) - COALESCE(used_slots, 0)) as free_slots,
            AVG(COALESCE(license_usage_percent, 0)) as avg_usage,
            SUM(CASE WHEN used_slots > total_slots THEN 1 ELSE 0 END) as over_limit_count,
            SUM(CASE WHEN license_usage_percent >= 90 THEN 1 ELSE 0 END) as high_usage_count,
            SUM(CASE WHEN expiration_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as expiring_soon
        FROM bitdefender_licenses
        WHERE client_api_key IS NOT NULL AND client_api_key != ''
    ");
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "✅ Query executada com sucesso\n";
    echo "Resultado:\n";
    print_r($stats);
    echo "\n";
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n\n";
}

echo "=== 5. TESTAR ENDPOINT REAL ===\n";
try {
    $url = 'http://localhost/app_bitdefender_endpoints.php?action=stats';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    echo "Response:\n";
    
    // Tentar decodificar JSON
    $decoded = json_decode($response, true);
    if ($decoded) {
        echo "✅ JSON válido:\n";
        print_r($decoded);
    } else {
        echo "❌ Resposta não é JSON válido:\n";
        echo htmlspecialchars(substr($response, 0, 500));
    }
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
}

echo "\n=== FIM DO DEBUG ===\n";
echo "</pre>";
