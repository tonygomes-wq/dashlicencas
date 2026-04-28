-- Adicionar campos de uso de licença na tabela bitdefender_licenses
ALTER TABLE bitdefender_licenses
ADD COLUMN used_slots INT DEFAULT 0 COMMENT 'Número de assentos usados',
ADD COLUMN total_slots INT DEFAULT 0 COMMENT 'Número total de assentos disponíveis',
ADD COLUMN license_usage_percent DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentual de uso da licença',
ADD COLUMN license_usage_last_sync DATETIME NULL COMMENT 'Data da última sincronização de uso',
ADD COLUMN license_usage_alert BOOLEAN DEFAULT FALSE COMMENT 'Alerta de uso de licença (>= 90%)';

-- Criar índice para consultas rápidas de alertas
CREATE INDEX idx_license_usage_alert ON bitdefender_licenses(license_usage_alert);
CREATE INDEX idx_license_usage_percent ON bitdefender_licenses(license_usage_percent);
