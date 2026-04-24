-- ============================================================================
-- UPGRADE COMPLETO DO BANCO DE DADOS
-- Dashboard de Licenças - Macip Tecnologia
-- Data: 24/04/2026
-- ============================================================================

-- ============================================================================
-- 1. AUDITORIA AVANÇADA
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. SISTEMA DE NOTIFICAÇÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50) NOT NULL, -- 'license_expiring', 'warranty_expiring', 'sync_failed', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_table VARCHAR(50),
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    email_frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
    notify_license_30_days BOOLEAN DEFAULT TRUE,
    notify_license_7_days BOOLEAN DEFAULT TRUE,
    notify_license_expired BOOLEAN DEFAULT TRUE,
    notify_warranty_30_days BOOLEAN DEFAULT TRUE,
    notify_sync_failed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. INVENTÁRIO DE ENDPOINTS BITDEFENDER
-- ============================================================================

CREATE TABLE IF NOT EXISTS bitdefender_endpoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT, -- Referência ao cliente em bitdefender_licenses
    endpoint_id VARCHAR(255) UNIQUE, -- ID do endpoint na API Bitdefender
    name VARCHAR(255),
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    operating_system VARCHAR(100),
    os_version VARCHAR(50),
    agent_version VARCHAR(50),
    protection_status VARCHAR(50), -- 'protected', 'at_risk', 'offline'
    last_seen TIMESTAMP NULL,
    is_managed BOOLEAN DEFAULT TRUE,
    hardware_id INT NULL, -- Link com inventário de hardware
    sync_status VARCHAR(20) DEFAULT 'synced', -- 'synced', 'pending', 'error'
    last_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_id (client_id),
    INDEX idx_endpoint_id (endpoint_id),
    INDEX idx_protection_status (protection_status),
    INDEX idx_hardware_id (hardware_id),
    FOREIGN KEY (client_id) REFERENCES bitdefender_licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (hardware_id) REFERENCES hardware_devices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. LOGS DE SINCRONIZAÇÃO
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL, -- 'bitdefender_licenses', 'bitdefender_endpoints', 'manual', 'cron'
    status VARCHAR(20) NOT NULL, -- 'success', 'partial', 'failed'
    records_processed INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_created INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    error_message TEXT,
    execution_time DECIMAL(10,3), -- Em segundos
    triggered_by VARCHAR(50), -- 'user', 'cron', 'system'
    user_id INT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_sync_type (sync_type),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. MÓDULO DE CONTRATOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL, -- 'bitdefender', 'fortigate', 'o365', 'gmail', 'hardware', 'outros'
    contract_number VARCHAR(100) UNIQUE,
    monthly_value DECIMAL(10,2),
    annual_value DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_method VARCHAR(50), -- 'boleto', 'cartao', 'transferencia', 'pix'
    payment_day INT, -- Dia do mês para pagamento
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'pending_renewal', 'expired', 'cancelled'
    auto_renew BOOLEAN DEFAULT FALSE,
    notes TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_name (client_name),
    INDEX idx_service_type (service_type),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contract_renewals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    stage VARCHAR(50) NOT NULL, -- 'to_renew', 'negotiating', 'proposal_sent', 'awaiting_payment', 'renewed', 'cancelled'
    previous_value DECIMAL(10,2),
    proposed_value DECIMAL(10,2),
    notes TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contract_id (contract_id),
    INDEX idx_stage (stage),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. PERMISSÕES GRANULARES
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_group_members (
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_client_access (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    dashboard_type VARCHAR(50) NOT NULL, -- 'bitdefender', 'fortigate', 'o365', 'gmail'
    client_identifier VARCHAR(255) NOT NULL, -- Nome do cliente ou ID
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by INT,
    INDEX idx_user_dashboard (user_id, dashboard_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. MELHORIAS NAS TABELAS EXISTENTES
-- ============================================================================

-- Adicionar campos de auditoria em hardware_devices (se não existirem)
-- Verificar se a coluna existe antes de adicionar
SET @dbname = DATABASE();
SET @tablename = 'hardware_devices';
SET @columnname = 'created_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER user_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname = 'updated_by';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER created_by')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar índices (ignorar erro se já existir)
ALTER TABLE hardware_devices ADD INDEX idx_client_name (client_name);
ALTER TABLE hardware_devices ADD INDEX idx_device_type (device_type);
ALTER TABLE hardware_devices ADD INDEX idx_status (status);

-- Adicionar índices para melhor performance em bitdefender_licenses
ALTER TABLE bitdefender_licenses ADD INDEX idx_company (company);
ALTER TABLE bitdefender_licenses ADD INDEX idx_expiration_date (expiration_date);
ALTER TABLE bitdefender_licenses ADD INDEX idx_renewal_status (renewal_status);

-- Adicionar índices em fortigate_devices
ALTER TABLE fortigate_devices ADD INDEX idx_client (client);
ALTER TABLE fortigate_devices ADD INDEX idx_vencimento (vencimento);
ALTER TABLE fortigate_devices ADD INDEX idx_renewal_status (renewal_status);

-- Adicionar índices em o365_licenses
ALTER TABLE o365_licenses ADD INDEX idx_client_id (client_id);
ALTER TABLE o365_licenses ADD INDEX idx_renewal_status (renewal_status);

-- Adicionar índices em gmail_licenses
ALTER TABLE gmail_licenses ADD INDEX idx_client_id (client_id);
ALTER TABLE gmail_licenses ADD INDEX idx_renewal_status (renewal_status);

-- ============================================================================
-- 8. CONFIGURAÇÕES DO SISTEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Se pode ser acessado sem autenticação
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir configurações padrão
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('sync_interval_hours', '6', 'number', 'Intervalo em horas para sincronização automática', FALSE),
('notification_email_from', 'noreply@macip.com.br', 'string', 'Email remetente para notificações', FALSE),
('notification_days_before_expiry', '30,7,1', 'string', 'Dias antes do vencimento para notificar (separados por vírgula)', FALSE),
('theme_primary_color', '#3b82f6', 'string', 'Cor primária do tema', TRUE),
('company_name', 'Macip Tecnologia', 'string', 'Nome da empresa', TRUE),
('company_logo_url', '/assets/logo.png', 'string', 'URL do logo da empresa', TRUE)
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- ============================================================================
-- 9. DADOS DE EXEMPLO PARA GRUPOS DE USUÁRIOS
-- ============================================================================

INSERT INTO user_groups (name, description, permissions) VALUES
('Técnico', 'Acesso somente leitura a todos os dashboards', JSON_OBJECT(
    'dashboards', JSON_OBJECT(
        'bitdefender', true,
        'fortigate', true,
        'o365', true,
        'gmail', true,
        'network', true,
        'hardware', true
    ),
    'actions', JSON_OBJECT(
        'edit', false,
        'delete', false
    ),
    'client_access_all', true
)),
('Comercial', 'Acesso a renovações e contratos', JSON_OBJECT(
    'dashboards', JSON_OBJECT(
        'bitdefender', true,
        'fortigate', true,
        'o365', true,
        'gmail', true,
        'network', false,
        'hardware', false
    ),
    'actions', JSON_OBJECT(
        'edit', true,
        'delete', false
    ),
    'client_access_all', true,
    'modules', JSON_OBJECT(
        'contracts', true,
        'renewals', true
    )
)),
('Gerente', 'Acesso completo exceto gerenciamento de usuários', JSON_OBJECT(
    'dashboards', JSON_OBJECT(
        'bitdefender', true,
        'fortigate', true,
        'o365', true,
        'gmail', true,
        'network', true,
        'hardware', true
    ),
    'actions', JSON_OBJECT(
        'edit', true,
        'delete', true
    ),
    'client_access_all', true,
    'modules', JSON_OBJECT(
        'contracts', true,
        'renewals', true,
        'reports', true,
        'audit', true
    )
))
ON DUPLICATE KEY UPDATE name=name;

-- ============================================================================
-- 10. VIEWS PARA RELATÓRIOS
-- ============================================================================

-- View: Licenças próximas do vencimento
CREATE OR REPLACE VIEW v_expiring_licenses AS
SELECT 
    'bitdefender' as source,
    id,
    company as client_name,
    email,
    expiration_date,
    DATEDIFF(expiration_date, CURDATE()) as days_remaining,
    renewal_status
FROM bitdefender_licenses
WHERE expiration_date IS NOT NULL 
  AND DATEDIFF(expiration_date, CURDATE()) <= 30
UNION ALL
SELECT 
    'fortigate' as source,
    id,
    client as client_name,
    email,
    vencimento as expiration_date,
    DATEDIFF(vencimento, CURDATE()) as days_remaining,
    renewal_status
FROM fortigate_devices
WHERE vencimento IS NOT NULL 
  AND DATEDIFF(vencimento, CURDATE()) <= 30
ORDER BY days_remaining ASC;

-- View: Garantias de hardware expirando
CREATE OR REPLACE VIEW v_expiring_warranties AS
SELECT 
    id,
    device_name,
    client_name,
    warranty_expiration,
    DATEDIFF(warranty_expiration, CURDATE()) as days_remaining,
    status
FROM hardware_devices
WHERE warranty_expiration IS NOT NULL 
  AND DATEDIFF(warranty_expiration, CURDATE()) <= 30
ORDER BY days_remaining ASC;

-- View: Contratos ativos
CREATE OR REPLACE VIEW v_active_contracts AS
SELECT 
    c.*,
    DATEDIFF(c.end_date, CURDATE()) as days_until_end,
    CASE 
        WHEN DATEDIFF(c.end_date, CURDATE()) < 0 THEN 'expired'
        WHEN DATEDIFF(c.end_date, CURDATE()) <= 30 THEN 'expiring_soon'
        ELSE 'active'
    END as contract_status
FROM contracts c
WHERE c.status = 'active'
ORDER BY c.end_date ASC;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Criar índice full-text para busca (se suportado)
-- ALTER TABLE bitdefender_licenses ADD FULLTEXT INDEX ft_company (company);
-- ALTER TABLE fortigate_devices ADD FULLTEXT INDEX ft_client (client);

SELECT 'Upgrade do banco de dados concluído com sucesso!' as message;
