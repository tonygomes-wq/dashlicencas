<?php
/**
 * Verificar colunas da tabela bitdefender_licenses
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/srv/config.php';

echo "=== VERIFICAÇÃO DE COLUNAS ===\n\n";

try {
    $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Colunas existentes na tabela bitdefender_licenses:\n\n";
    
    $requiredColumns = [
        'used_licenses',
        'free_licenses',
        'usage_percentage',
        'over_limit'
    ];
    
    $existingColumns = [];
    foreach ($columns as $col) {
        $existingColumns[] = $col['Field'];
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    
    echo "\n\nColunas necessárias para estatísticas:\n";
    foreach ($requiredColumns as $col) {
        $exists = in_array($col, $existingColumns);
        $status = $exists ? '✓' : '✗';
        echo "  $status $col\n";
    }
    
    // Verificar se há dados
    echo "\n\nDados na tabela:\n";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_licenses");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "  Total de registros: {$count['total']}\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM bitdefender_licenses WHERE client_api_key IS NOT NULL");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "  Com API Key: {$count['total']}\n";
    
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
