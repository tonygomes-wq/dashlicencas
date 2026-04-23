<?php
// add_extra_columns.php - Adicionar colunas extras para informações de uso
session_start();
$_SESSION['user_id'] = 1; // Bypass auth para execução direta

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    echo json_encode([
        'step' => 'Iniciando',
        'message' => 'Verificando colunas existentes...'
    ]) . "\n";
    flush();
    
    // Verificar se colunas já existem
    $stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'used_licenses'");
    $columnExists = $stmt->rowCount() > 0;
    
    if ($columnExists) {
        echo json_encode([
            'success' => true,
            'message' => 'Colunas extras já existem!',
            'action' => 'skip'
        ]) . "\n";
        exit;
    }
    
    echo json_encode([
        'step' => 'Adicionando colunas',
        'message' => 'Executando ALTER TABLE...'
    ]) . "\n";
    flush();
    
    // Adicionar colunas
    $pdo->exec("
        ALTER TABLE bitdefender_licenses 
        ADD COLUMN used_licenses INT DEFAULT 0 COMMENT 'Licenças em uso (usedSlots)',
        ADD COLUMN free_licenses INT DEFAULT 0 COMMENT 'Licenças livres (totalSlots - usedSlots)',
        ADD COLUMN usage_percentage DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentual de uso',
        ADD COLUMN over_limit BOOLEAN DEFAULT FALSE COMMENT 'Se ultrapassou o limite de licenças'
    ");
    
    echo json_encode([
        'step' => 'Colunas adicionadas',
        'message' => 'Inicializando valores...'
    ]) . "\n";
    flush();
    
    // Inicializar valores
    $pdo->exec("
        UPDATE bitdefender_licenses 
        SET 
            used_licenses = 0,
            free_licenses = total_licenses,
            usage_percentage = 0.00,
            over_limit = FALSE
    ");
    
    echo json_encode([
        'step' => 'Valores inicializados',
        'message' => 'Verificando resultado...'
    ]) . "\n";
    flush();
    
    // Verificar resultado
    $stmt = $pdo->query("
        SELECT 
            id,
            company,
            total_licenses,
            used_licenses,
            free_licenses,
            usage_percentage,
            over_limit
        FROM bitdefender_licenses
        ORDER BY company
        LIMIT 5
    ");
    
    $samples = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Colunas extras adicionadas com sucesso!',
        'columns_added' => [
            'used_licenses' => 'INT - Licenças em uso',
            'free_licenses' => 'INT - Licenças livres',
            'usage_percentage' => 'DECIMAL(5,2) - Percentual de uso',
            'over_limit' => 'BOOLEAN - Se ultrapassou limite'
        ],
        'sample_data' => $samples,
        'next_steps' => [
            '1. Substituir app_bitdefender_sync_client.php pela versão V3',
            '2. Testar sincronização com um cliente',
            '3. Verificar se dados extras são salvos corretamente',
            '4. Atualizar frontend para mostrar informações extras'
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT) . "\n";
}
