<?php
// ativar_sync_v3.php - Ativar versão V3 da sincronização Bitdefender
session_start();
$_SESSION['user_id'] = 1;

header('Content-Type: application/json; charset=UTF-8');

try {
    $currentFile = 'app_bitdefender_sync_client.php';
    $v3File = 'app_bitdefender_sync_client_v3.php';
    $backupFile = 'app_bitdefender_sync_client_v2_backup.php';
    
    // Verificar se V3 existe
    if (!file_exists($v3File)) {
        throw new Exception("Arquivo V3 não encontrado: $v3File");
    }
    
    // Fazer backup da versão atual
    if (file_exists($currentFile)) {
        if (!copy($currentFile, $backupFile)) {
            throw new Exception("Erro ao criar backup");
        }
    }
    
    // Copiar V3 para o arquivo principal
    if (!copy($v3File, $currentFile)) {
        throw new Exception("Erro ao copiar V3");
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Versão V3 ativada com sucesso!',
        'actions' => [
            'backup_created' => $backupFile,
            'v3_activated' => $currentFile
        ],
        'new_features' => [
            '✅ Cálculo automático de licenças usadas/livres',
            '✅ Percentual de uso',
            '✅ Detecção de sobre limite',
            '✅ Status visual (ok, attention, warning, critical)',
            '✅ Salva informações extras no banco'
        ],
        'next_steps' => [
            '1. Testar sincronização com cliente MAGLON',
            '2. Verificar se campos extras são salvos',
            '3. Atualizar frontend para mostrar informações'
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
