<?php
/**
 * Cron Job: Executar Agendamentos de Relatórios Bitdefender
 * 
 * Este script é executado a cada 5 minutos via crontab e processa
 * todos os agendamentos de relatórios que estão prontos para execução.
 * 
 * Frequência recomendada: */5 * * * * (a cada 5 minutos)
 * 
 * @version 1.0
 * @date 2026-08-26
 */

// Definir timezone
date_default_timezone_set('America/Sao_Paulo');

// Log de início
echo "[" . date('Y-m-d H:i:s') . "] ========================================\n";
echo "[" . date('Y-m-d H:i:s') . "] Iniciando execução de agendamentos...\n";
echo "[" . date('Y-m-d H:i:s') . "] ========================================\n";

// Incluir configurações
require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_bitdefender_api.php';

try {
    // Buscar agendamentos prontos para executar
    $stmt = $pdo->query("
        SELECT * FROM bitdefender_report_schedules
        WHERE is_active = 1
        AND next_execution_at <= NOW()
        ORDER BY next_execution_at ASC
    ");
    
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totalSchedules = count($schedules);
    echo "[" . date('Y-m-d H:i:s') . "] Encontrados {$totalSchedules} agendamento(s) para executar\n";
    
    if ($totalSchedules === 0) {
        echo "[" . date('Y-m-d H:i:s') . "] Nenhum agendamento pendente. Finalizando.\n";
        exit(0);
    }
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($schedules as $schedule) {
        echo "\n[" . date('Y-m-d H:i:s') . "] ----------------------------------------\n";
        echo "[" . date('Y-m-d H:i:s') . "] Processando agendamento #{$schedule['id']}\n";
        echo "[" . date('Y-m-d H:i:s') . "] Nome: {$schedule['schedule_name']}\n";
        
        try {
            // Buscar informações do cliente
            $clientStmt = $pdo->prepare("
                SELECT id, company, client_api_key, client_access_url 
                FROM bitdefender_licenses 
                WHERE id = ?
            ");
            $clientStmt->execute([$schedule['client_id']]);
            $client = $clientStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$client) {
                throw new Exception("Cliente ID {$schedule['client_id']} não encontrado");
            }
            
            if (!$client['client_api_key']) {
                throw new Exception("Cliente '{$client['company']}' não possui API Key configurada");
            }
            
            echo "[" . date('Y-m-d H:i:s') . "] Cliente: {$client['company']}\n";
            echo "[" . date('Y-m-d H:i:s') . "] Tipo: {$schedule['report_type_name']}\n";
            echo "[" . date('Y-m-d H:i:s') . "] Recorrência: {$schedule['recurrence']}\n";
            
            // Criar instância da API
            $api = new BitdefenderAPI(
                $client['client_api_key'],
                $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api'
            );
            
            // Preparar parâmetros do relatório
            $reportParams = [];
            
            if ($schedule['custom_params']) {
                $customParams = json_decode($schedule['custom_params'], true);
                if ($customParams) {
                    $reportParams = $customParams;
                }
            }
            
            // Adicionar parâmetros obrigatórios
            $reportParams['reportingInterval'] = $schedule['reporting_interval'] ?: 'lastWeek';
            
            // Parâmetros específicos por tipo de relatório
            if ($schedule['report_type'] == 12) { // Malware Status
                $reportParams['filterType'] = $schedule['filter_type'] ?: 0;
                if ($schedule['detailed_export']) {
                    $reportParams['detailedExport'] = [1];
                }
            }
            
            echo "[" . date('Y-m-d H:i:s') . "] Criando relatório via API...\n";
            
            // Criar relatório via API
            $result = $api->createReport($schedule['report_type'], $reportParams);
            
            if (!isset($result['reportId'])) {
                throw new Exception("Resposta inválida da API Bitdefender");
            }
            
            $bitdefenderReportId = $result['reportId'];
            echo "[" . date('Y-m-d H:i:s') . "] Relatório criado no GravityZone: {$bitdefenderReportId}\n";
            
            // Salvar no banco de dados
            $reportName = $schedule['schedule_name'] . ' - ' . date('d/m/Y H:i');
            
            $insertStmt = $pdo->prepare("
                INSERT INTO bitdefender_reports (
                    client_id, user_id, report_name, report_type, report_type_name,
                    status, generation_mode, reporting_interval, filter_type, 
                    detailed_export, custom_params, bitdefender_report_id,
                    generation_started_at, generation_completed_at
                ) VALUES (?, 1, ?, ?, ?, 'ready', 'scheduled', ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            
            $insertStmt->execute([
                $schedule['client_id'],
                $reportName,
                $schedule['report_type'],
                $schedule['report_type_name'],
                $schedule['reporting_interval'],
                $schedule['filter_type'],
                $schedule['detailed_export'] ? 1 : 0,
                json_encode($reportParams),
                $bitdefenderReportId
            ]);
            
            $reportId = $pdo->lastInsertId();
            echo "[" . date('Y-m-d H:i:s') . "] Relatório salvo no banco: ID {$reportId}\n";
            
            // Tentar obter link de download
            try {
                echo "[" . date('Y-m-d H:i:s') . "] Obtendo link de download...\n";
                $downloadResult = $api->getDownloadLinks($bitdefenderReportId);
                
                if (isset($downloadResult['url'])) {
                    $updateStmt = $pdo->prepare("
                        UPDATE bitdefender_reports
                        SET download_url = ?,
                            download_url_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
                        WHERE id = ?
                    ");
                    $updateStmt->execute([$downloadResult['url'], $reportId]);
                    echo "[" . date('Y-m-d H:i:s') . "] Link de download configurado\n";
                }
            } catch (Exception $e) {
                echo "[" . date('Y-m-d H:i:s') . "] Aviso: Não foi possível obter link de download: {$e->getMessage()}\n";
            }
            
            // Marcar execução como sucesso
            $pdo->query("CALL sp_mark_schedule_execution({$schedule['id']}, {$reportId}, 'success', NULL)");
            
            echo "[" . date('Y-m-d H:i:s') . "] ✅ Sucesso!\n";
            $successCount++;
            
            // Enviar notificação por email (se configurado)
            if ($schedule['send_email_notification'] && $schedule['notification_emails']) {
                try {
                    $emails = json_decode($schedule['notification_emails'], true);
                    if ($emails && is_array($emails)) {
                        echo "[" . date('Y-m-d H:i:s') . "] Enviando notificações para: " . implode(', ', $emails) . "\n";
                        // TODO: Implementar envio de email
                        // sendReportNotification($emails, $reportName, $reportId);
                    }
                } catch (Exception $e) {
                    echo "[" . date('Y-m-d H:i:s') . "] Aviso: Erro ao enviar notificação: {$e->getMessage()}\n";
                }
            }
            
        } catch (Exception $e) {
            // Registrar falha
            $errorMsg = $e->getMessage();
            $errorMsgEscaped = $pdo->quote($errorMsg);
            $pdo->query("CALL sp_mark_schedule_execution({$schedule['id']}, NULL, 'failed', {$errorMsgEscaped})");
            
            echo "[" . date('Y-m-d H:i:s') . "] ❌ Erro: {$errorMsg}\n";
            $errorCount++;
        }
    }
    
    echo "\n[" . date('Y-m-d H:i:s') . "] ========================================\n";
    echo "[" . date('Y-m-d H:i:s') . "] Execução concluída!\n";
    echo "[" . date('Y-m-d H:i:s') . "] Total processado: {$totalSchedules} agendamento(s)\n";
    echo "[" . date('Y-m-d H:i:s') . "] Sucesso: {$successCount}\n";
    echo "[" . date('Y-m-d H:i:s') . "] Falhas: {$errorCount}\n";
    echo "[" . date('Y-m-d H:i:s') . "] ========================================\n";
    
    exit(0);
    
} catch (Exception $e) {
    echo "\n[" . date('Y-m-d H:i:s') . "] ❌ ERRO FATAL: {$e->getMessage()}\n";
    echo "[" . date('Y-m-d H:i:s') . "] Trace: {$e->getTraceAsString()}\n";
    exit(1);
}
