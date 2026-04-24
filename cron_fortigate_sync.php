#!/usr/bin/env php
<?php
/**
 * Cron Job para Sincronização Automática FortiGate API
 * 
 * Este script deve ser executado periodicamente via cron para sincronizar
 * automaticamente os dados dos dispositivos FortiGate configurados.
 * 
 * Configuração no crontab:
 * # Sincronizar a cada hora
 * 0 * * * * php /caminho/para/cron_fortigate_sync.php >> /var/log/fortigate_sync.log 2>&1
 * 
 * # Sincronizar a cada 30 minutos
 * */30 * * * * php /caminho/para/cron_fortigate_sync.php >> /var/log/fortigate_sync.log 2>&1
 */

// Definir timezone
date_default_timezone_set('America/Sao_Paulo');

// Incluir dependências
require_once __DIR__ . '/srv/Database.php';
require_once __DIR__ . '/srv/FortigateSync.php';

// Função para log
function logMessage($message, $level = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    echo "[{$timestamp}] [{$level}] {$message}\n";
}

// Início da execução
logMessage("=== Iniciando sincronização automática FortiGate ===");
$startTime = microtime(true);

try {
    // Conectar ao banco de dados
    $db = Database::getInstance()->getConnection();
    $sync = new FortigateSync($db);
    
    // Buscar dispositivos com API habilitada
    $stmt = $db->query("
        SELECT 
            c.device_id,
            d.client,
            d.serial,
            c.sync_interval_minutes,
            c.last_sync_at
        FROM fortigate_api_config c
        JOIN fortigate_devices d ON c.device_id = d.id
        WHERE c.api_enabled = TRUE
        ORDER BY c.device_id
    ");
    
    $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $totalDevices = count($devices);
    
    if ($totalDevices === 0) {
        logMessage("Nenhum dispositivo com API habilitada encontrado", 'WARNING');
        exit(0);
    }
    
    logMessage("Encontrados {$totalDevices} dispositivo(s) com API habilitada");
    
    // Estatísticas
    $stats = [
        'total' => $totalDevices,
        'success' => 0,
        'failed' => 0,
        'skipped' => 0
    ];
    
    // Sincronizar cada dispositivo
    foreach ($devices as $device) {
        $deviceId = $device['device_id'];
        $clientName = $device['client'];
        $serial = $device['serial'];
        $syncInterval = $device['sync_interval_minutes'];
        $lastSync = $device['last_sync_at'];
        
        logMessage("---");
        logMessage("Processando: {$clientName} (Serial: {$serial}, ID: {$deviceId})");
        
        // Verificar se precisa sincronizar baseado no intervalo
        if ($lastSync) {
            $lastSyncTime = strtotime($lastSync);
            $nextSyncTime = $lastSyncTime + ($syncInterval * 60);
            $now = time();
            
            if ($now < $nextSyncTime) {
                $minutesRemaining = ceil(($nextSyncTime - $now) / 60);
                logMessage("Sincronização não necessária. Próxima em {$minutesRemaining} minuto(s)", 'INFO');
                $stats['skipped']++;
                continue;
            }
        }
        
        // Executar sincronização
        try {
            logMessage("Iniciando sincronização...");
            $result = $sync->syncDevice($deviceId);
            
            if ($result['success']) {
                $duration = $result['duration'];
                $changes = count($result['changes'] ?? []);
                logMessage("✓ Sucesso! Duração: {$duration}s, Mudanças: {$changes}", 'SUCCESS');
                $stats['success']++;
                
                // Log das mudanças se houver
                if ($changes > 0) {
                    logMessage("Mudanças detectadas:");
                    foreach ($result['changes'] as $field => $change) {
                        logMessage("  - {$field}: {$change['old']} → {$change['new']}");
                    }
                }
            } else {
                logMessage("✗ Falha: {$result['message']}", 'ERROR');
                $stats['failed']++;
            }
        } catch (Exception $e) {
            logMessage("✗ Exceção: {$e->getMessage()}", 'ERROR');
            $stats['failed']++;
        }
        
        // Pequeno delay entre sincronizações para não sobrecarregar
        sleep(2);
    }
    
    // Resumo final
    $totalTime = round(microtime(true) - $startTime, 2);
    logMessage("---");
    logMessage("=== Sincronização concluída ===");
    logMessage("Total de dispositivos: {$stats['total']}");
    logMessage("Sucesso: {$stats['success']}");
    logMessage("Falha: {$stats['failed']}");
    logMessage("Ignorados: {$stats['skipped']}");
    logMessage("Tempo total: {$totalTime}s");
    
    // Verificar alertas críticos
    $stmt = $db->query("
        SELECT COUNT(*) as critical_count
        FROM fortigate_alerts
        WHERE is_resolved = FALSE AND severity = 'critical'
    ");
    $criticalAlerts = $stmt->fetch(PDO::FETCH_ASSOC)['critical_count'];
    
    if ($criticalAlerts > 0) {
        logMessage("⚠️  ATENÇÃO: {$criticalAlerts} alerta(s) crítico(s) não resolvido(s)!", 'WARNING');
    }
    
    // Código de saída
    if ($stats['failed'] > 0) {
        exit(1); // Indica que houve falhas
    } else {
        exit(0); // Sucesso
    }
    
} catch (Exception $e) {
    logMessage("ERRO FATAL: {$e->getMessage()}", 'FATAL');
    logMessage("Stack trace: {$e->getTraceAsString()}", 'FATAL');
    exit(2);
}
