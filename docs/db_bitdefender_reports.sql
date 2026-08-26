-- ============================================================
-- SCHEMA: Sistema de Relatórios Bitdefender GravityZone
-- Versão: 1.0
-- Data: 2026-08-26
-- Descrição: Tabelas para gerenciar geração, agendamento e 
--            download de relatórios da API Bitdefender
-- ============================================================

-- Tabela principal de relatórios
CREATE TABLE IF NOT EXISTS bitdefender_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relacionamento
    client_id INT NOT NULL COMMENT 'ID do cliente Bitdefender',
    user_id INT NOT NULL COMMENT 'Usuário que solicitou o relatório',
    
    -- Identificação
    bitdefender_report_id VARCHAR(255) NULL COMMENT 'ID do relatório no GravityZone',
    report_name VARCHAR(255) NOT NULL COMMENT 'Nome do relatório',
    report_type INT NOT NULL COMMENT '1=Network Inventory, 12=Malware Status, 15=On-demand Scanning, etc',
    report_type_name VARCHAR(100) NOT NULL COMMENT 'Nome legível do tipo',
    
    -- Status do relatório
    status ENUM('pending', 'generating', 'ready', 'downloaded', 'failed', 'expired') DEFAULT 'pending',
    generation_mode ENUM('instant', 'scheduled') DEFAULT 'instant' COMMENT 'Modo de geração: instantâneo ou agendado',
    
    -- Parâmetros de geração
    reporting_interval VARCHAR(50) NULL COMMENT 'Período: today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth, last2Months, etc',
    filter_type INT DEFAULT 0 COMMENT '0=Todos endpoints, 1=Somente infectados (Malware Report)',
    detailed_export BOOLEAN DEFAULT FALSE COMMENT 'Incluir detalhes no PDF (Endpoint Malware Status)',
    custom_params JSON NULL COMMENT 'Parâmetros específicos adicionais do relatório',
    
    -- Arquivos gerados (armazenados localmente)
    pdf_path VARCHAR(500) NULL COMMENT 'Caminho do PDF no servidor',
    csv_path VARCHAR(500) NULL COMMENT 'Caminho do CSV no servidor',
    pdf_size_kb INT NULL COMMENT 'Tamanho do PDF em KB',
    csv_size_kb INT NULL COMMENT 'Tamanho do CSV em KB',
    
    -- URLs de download (temporárias da API)
    download_url VARCHAR(1000) NULL COMMENT 'URL de download do ZIP (PDF+CSV) fornecida pela API',
    download_url_expires_at DATETIME NULL COMMENT 'Data/hora de expiração da URL',
    
    -- Controle de tempo
    generation_started_at DATETIME NULL COMMENT 'Quando começou a geração',
    generation_completed_at DATETIME NULL COMMENT 'Quando terminou a geração',
    downloaded_at DATETIME NULL COMMENT 'Quando foi baixado do GravityZone',
    generation_duration_seconds INT NULL COMMENT 'Tempo de geração em segundos',
    
    -- Resultados (estatísticas do relatório)
    total_endpoints INT NULL COMMENT 'Total de endpoints no relatório',
    infected_endpoints INT NULL COMMENT 'Endpoints infectados',
    threats_detected INT NULL COMMENT 'Ameaças detectadas',
    scans_performed INT NULL COMMENT 'Scans realizados',
    result_summary JSON NULL COMMENT 'Resumo completo dos resultados',
    
    -- Controle de erros
    error_message TEXT NULL COMMENT 'Mensagem de erro se falhou',
    error_details JSON NULL COMMENT 'Detalhes técnicos do erro',
    
    -- Timestamps padrão
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at DATETIME NULL COMMENT 'Data de expiração do relatório no GravityZone',
    
    -- Índices para performance
    INDEX idx_client (client_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_type (report_type),
    INDEX idx_created (created_at),
    INDEX idx_bitdefender_id (bitdefender_report_id),
    INDEX idx_status_client (status, client_id),
    INDEX idx_type_status (report_type, status),
    INDEX idx_created_client (created_at, client_id),
    
    -- Chaves estrangeiras
    FOREIGN KEY (client_id) REFERENCES bitdefender_licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Armazena relatórios gerados via API Bitdefender GravityZone';

-- ============================================================

-- Tabela de agendamentos de relatórios (relatórios automáticos periódicos)
CREATE TABLE IF NOT EXISTS bitdefender_report_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relacionamento
    client_id INT NOT NULL COMMENT 'Cliente para o qual o relatório será gerado',
    user_id INT NOT NULL COMMENT 'Usuário que criou o agendamento',
    
    -- Configuração do agendamento
    schedule_name VARCHAR(255) NOT NULL COMMENT 'Nome do agendamento',
    report_type INT NOT NULL COMMENT 'Tipo de relatório (12, 15, etc)',
    report_type_name VARCHAR(100) NOT NULL COMMENT 'Nome legível do tipo',
    description TEXT NULL COMMENT 'Descrição do agendamento',
    
    -- Recorrência
    recurrence ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL COMMENT 'Frequência de geração',
    day_of_week INT NULL COMMENT 'Dia da semana (1=Segunda, 7=Domingo) para recurrence=weekly',
    day_of_month INT NULL COMMENT 'Dia do mês (1-31) para recurrence=monthly',
    time_of_day TIME NOT NULL DEFAULT '08:00:00' COMMENT 'Horário de execução',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo' COMMENT 'Fuso horário',
    
    -- Parâmetros do relatório
    reporting_interval VARCHAR(50) NULL COMMENT 'Período a ser considerado (ex: lastDay para relatório diário)',
    filter_type INT DEFAULT 0,
    detailed_export BOOLEAN DEFAULT FALSE,
    custom_params JSON NULL,
    
    -- Status e controle
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Se o agendamento está ativo',
    last_execution_at DATETIME NULL COMMENT 'Última vez que foi executado',
    last_execution_status ENUM('success', 'failed') NULL,
    last_error_message TEXT NULL,
    last_report_id INT NULL COMMENT 'ID do último relatório gerado',
    next_execution_at DATETIME NULL COMMENT 'Próxima execução programada',
    execution_count INT DEFAULT 0 COMMENT 'Contador de execuções',
    
    -- Notificações por email
    send_email_notification BOOLEAN DEFAULT TRUE COMMENT 'Enviar email quando relatório estiver pronto',
    notification_emails JSON NULL COMMENT 'Array de emails para notificação: ["email1@domain.com", "email2@domain.com"]',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_client (client_id),
    INDEX idx_user (user_id),
    INDEX idx_active (is_active),
    INDEX idx_next_execution (next_execution_at),
    INDEX idx_recurrence (recurrence),
    INDEX idx_active_next (is_active, next_execution_at),
    
    -- Chaves estrangeiras
    FOREIGN KEY (client_id) REFERENCES bitdefender_licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (last_report_id) REFERENCES bitdefender_reports(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Agendamentos automáticos de relatórios periódicos';

-- ============================================================

-- Tabela de histórico de downloads (auditoria)
CREATE TABLE IF NOT EXISTS bitdefender_report_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    report_id INT NOT NULL COMMENT 'Relatório que foi baixado',
    user_id INT NOT NULL COMMENT 'Usuário que fez o download',
    
    download_type ENUM('pdf', 'csv', 'zip') NOT NULL COMMENT 'Tipo de arquivo baixado',
    file_size_kb INT NULL COMMENT 'Tamanho do arquivo em KB',
    
    -- Auditoria
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL COMMENT 'IP do usuário',
    user_agent TEXT NULL COMMENT 'User agent do navegador',
    
    -- Índices
    INDEX idx_report (report_id),
    INDEX idx_user (user_id),
    INDEX idx_date (downloaded_at),
    INDEX idx_report_user (report_id, user_id),
    
    -- Chaves estrangeiras
    FOREIGN KEY (report_id) REFERENCES bitdefender_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Histórico de downloads de relatórios para auditoria';

-- ============================================================

-- View auxiliar para dashboard (lista resumida de relatórios)
CREATE OR REPLACE VIEW v_bitdefender_reports_summary AS
SELECT 
    br.id,
    br.client_id,
    bl.company AS client_name,
    br.report_name,
    br.report_type,
    br.report_type_name,
    br.status,
    br.generation_mode,
    br.created_at,
    br.generation_started_at,
    br.generation_completed_at,
    br.downloaded_at,
    br.total_endpoints,
    br.infected_endpoints,
    br.threats_detected,
    br.scans_performed,
    TIMESTAMPDIFF(SECOND, br.generation_started_at, br.generation_completed_at) AS duration_seconds,
    u.username AS created_by,
    CASE 
        WHEN br.pdf_path IS NOT NULL AND br.pdf_path != '' THEN TRUE 
        ELSE FALSE 
    END AS has_pdf,
    CASE 
        WHEN br.csv_path IS NOT NULL AND br.csv_path != '' THEN TRUE 
        ELSE FALSE 
    END AS has_csv,
    br.pdf_size_kb,
    br.csv_size_kb,
    br.error_message,
    -- Status visual
    CASE 
        WHEN br.status = 'failed' THEN 'danger'
        WHEN br.status = 'expired' THEN 'warning'
        WHEN br.status = 'downloaded' THEN 'success'
        WHEN br.status = 'ready' THEN 'info'
        WHEN br.status = 'generating' THEN 'primary'
        ELSE 'secondary'
    END AS status_color
FROM bitdefender_reports br
LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
LEFT JOIN users u ON br.user_id = u.id;

-- ============================================================

-- View para agendamentos ativos
CREATE OR REPLACE VIEW v_bitdefender_schedules_active AS
SELECT 
    brs.id,
    brs.client_id,
    bl.company AS client_name,
    brs.schedule_name,
    brs.report_type_name,
    brs.recurrence,
    brs.time_of_day,
    brs.is_active,
    brs.last_execution_at,
    brs.last_execution_status,
    brs.next_execution_at,
    brs.execution_count,
    u.username AS created_by,
    -- Próxima execução formatada
    CASE 
        WHEN brs.next_execution_at IS NULL THEN 'Não agendado'
        WHEN brs.next_execution_at < NOW() THEN 'Atrasado'
        ELSE CONCAT('Em ', TIMESTAMPDIFF(HOUR, NOW(), brs.next_execution_at), 'h')
    END AS next_execution_label
FROM bitdefender_report_schedules brs
LEFT JOIN bitdefender_licenses bl ON brs.client_id = bl.id
LEFT JOIN users u ON brs.user_id = u.id
WHERE brs.is_active = TRUE
ORDER BY brs.next_execution_at ASC;

-- ============================================================

-- Stored Procedure: Calcular próxima execução de agendamento
DELIMITER //

DROP PROCEDURE IF EXISTS sp_calculate_next_execution//

CREATE PROCEDURE sp_calculate_next_execution(
    IN p_schedule_id INT
)
BEGIN
    DECLARE v_recurrence VARCHAR(20);
    DECLARE v_time_of_day TIME;
    DECLARE v_day_of_week INT;
    DECLARE v_day_of_month INT;
    DECLARE v_next_execution DATETIME;
    DECLARE v_current_datetime DATETIME;
    
    SET v_current_datetime = NOW();
    
    -- Buscar configurações do agendamento
    SELECT recurrence, time_of_day, day_of_week, day_of_month
    INTO v_recurrence, v_time_of_day, v_day_of_week, v_day_of_month
    FROM bitdefender_report_schedules
    WHERE id = p_schedule_id;
    
    -- Calcular próxima execução baseado na recorrência
    SET v_next_execution = CASE
        -- Diário: próximo dia no horário especificado
        WHEN v_recurrence = 'daily' THEN
            IF(
                CONCAT(CURDATE(), ' ', v_time_of_day) > v_current_datetime,
                CONCAT(CURDATE(), ' ', v_time_of_day),
                CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' ', v_time_of_day)
            )
        
        -- Semanal: próximo dia da semana no horário especificado
        WHEN v_recurrence = 'weekly' THEN
            DATE_ADD(
                CURDATE(),
                INTERVAL (
                    (7 + v_day_of_week - DAYOFWEEK(CURDATE())) % 7 +
                    IF(DAYOFWEEK(CURDATE()) = v_day_of_week AND CONCAT(CURDATE(), ' ', v_time_of_day) <= v_current_datetime, 7, 0)
                ) DAY
            ) + INTERVAL HOUR(v_time_of_day) HOUR + INTERVAL MINUTE(v_time_of_day) MINUTE
        
        -- Mensal: próximo mês no dia especificado
        WHEN v_recurrence = 'monthly' THEN
            IF(
                DAY(CURDATE()) < v_day_of_month OR 
                (DAY(CURDATE()) = v_day_of_month AND CONCAT(CURDATE(), ' ', v_time_of_day) <= v_current_datetime),
                DATE_ADD(
                    DATE_FORMAT(CURDATE(), CONCAT('%Y-%m-', LPAD(v_day_of_month, 2, '0'))),
                    INTERVAL IF(DAY(CURDATE()) >= v_day_of_month, 1, 0) MONTH
                ) + INTERVAL HOUR(v_time_of_day) HOUR + INTERVAL MINUTE(v_time_of_day) MINUTE,
                DATE_FORMAT(CURDATE(), CONCAT('%Y-%m-', LPAD(v_day_of_month, 2, '0'))) + INTERVAL HOUR(v_time_of_day) HOUR + INTERVAL MINUTE(v_time_of_day) MINUTE
            )
        
        -- Anual: próximo ano no mesmo dia
        WHEN v_recurrence = 'yearly' THEN
            DATE_ADD(
                DATE_FORMAT(CURDATE(), '%Y-%m-%d'),
                INTERVAL 1 YEAR
            ) + INTERVAL HOUR(v_time_of_day) HOUR + INTERVAL MINUTE(v_time_of_day) MINUTE
        
        ELSE NULL
    END;
    
    -- Atualizar registro
    UPDATE bitdefender_report_schedules
    SET next_execution_at = v_next_execution,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    SELECT v_next_execution AS next_execution;
END//

DELIMITER ;

-- ============================================================

-- Stored Procedure: Marcar execução de agendamento
DELIMITER //

DROP PROCEDURE IF EXISTS sp_mark_schedule_execution//

CREATE PROCEDURE sp_mark_schedule_execution(
    IN p_schedule_id INT,
    IN p_report_id INT,
    IN p_status ENUM('success', 'failed'),
    IN p_error_message TEXT
)
BEGIN
    -- Atualizar agendamento
    UPDATE bitdefender_report_schedules
    SET last_execution_at = NOW(),
        last_execution_status = p_status,
        last_error_message = p_error_message,
        last_report_id = p_report_id,
        execution_count = execution_count + 1,
        updated_at = NOW()
    WHERE id = p_schedule_id;
    
    -- Calcular próxima execução
    CALL sp_calculate_next_execution(p_schedule_id);
END//

DELIMITER ;

-- ============================================================

-- Trigger: Calcular próxima execução ao criar agendamento
DELIMITER //

DROP TRIGGER IF EXISTS tr_schedule_after_insert//

CREATE TRIGGER tr_schedule_after_insert
AFTER INSERT ON bitdefender_report_schedules
FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE THEN
        CALL sp_calculate_next_execution(NEW.id);
    END IF;
END//

DELIMITER ;

-- ============================================================

-- Trigger: Recalcular próxima execução ao atualizar agendamento
DELIMITER //

DROP TRIGGER IF EXISTS tr_schedule_after_update//

CREATE TRIGGER tr_schedule_after_update
AFTER UPDATE ON bitdefender_report_schedules
FOR EACH ROW
BEGIN
    IF NEW.is_active = TRUE AND (
        OLD.recurrence != NEW.recurrence OR
        OLD.time_of_day != NEW.time_of_day OR
        OLD.day_of_week != NEW.day_of_week OR
        OLD.day_of_month != NEW.day_of_month OR
        OLD.is_active != NEW.is_active
    ) THEN
        CALL sp_calculate_next_execution(NEW.id);
    END IF;
END//

DELIMITER ;

-- ============================================================

-- Índices adicionais compostos para queries complexas
ALTER TABLE bitdefender_reports 
    ADD INDEX idx_client_status_created (client_id, status, created_at),
    ADD INDEX idx_type_status_created (report_type, status, created_at);

-- ============================================================

-- Função auxiliar: Obter label de intervalo de relatório
DELIMITER //

DROP FUNCTION IF EXISTS fn_get_reporting_interval_label//

CREATE FUNCTION fn_get_reporting_interval_label(interval_value VARCHAR(50))
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    RETURN CASE interval_value
        WHEN 'today' THEN 'Hoje'
        WHEN 'yesterday' THEN 'Ontem'
        WHEN 'thisWeek' THEN 'Esta Semana'
        WHEN 'lastWeek' THEN 'Semana Passada'
        WHEN 'thisMonth' THEN 'Este Mês'
        WHEN 'lastMonth' THEN 'Mês Passado'
        WHEN 'last2Months' THEN 'Últimos 2 Meses'
        WHEN 'last3Months' THEN 'Últimos 3 Meses'
        WHEN 'thisYear' THEN 'Este Ano'
        WHEN 'lastYear' THEN 'Ano Passado'
        ELSE interval_value
    END;
END//

DELIMITER ;

-- ============================================================

-- Criar diretório virtual para armazenar relatórios (apenas registro lógico)
INSERT INTO system_settings (setting_key, setting_value, created_at, updated_at)
VALUES 
    ('bitdefender_reports_storage_path', 'storage/reports/bitdefender', NOW(), NOW()),
    ('bitdefender_reports_retention_days', '90', NOW(), NOW()),
    ('bitdefender_reports_auto_download', '1', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ============================================================

-- Estatísticas iniciais
SELECT 'Schema de Relatórios Bitdefender criado com sucesso!' AS status;
SELECT 'Tabelas criadas: bitdefender_reports, bitdefender_report_schedules, bitdefender_report_downloads' AS info;
SELECT 'Views criadas: v_bitdefender_reports_summary, v_bitdefender_schedules_active' AS info;
SELECT 'Stored Procedures criadas: sp_calculate_next_execution, sp_mark_schedule_execution' AS info;
SELECT 'Triggers criados: tr_schedule_after_insert, tr_schedule_after_update' AS info;

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
