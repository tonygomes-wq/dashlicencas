-- Script SQL para Sincronização com API Bitdefender
-- Execute este script no banco de dados MySQL

-- Tabela de configuração da API
CREATE TABLE IF NOT EXISTS bitdefender_api_config (
    id INT PRIMARY KEY DEFAULT 1,
    api_key VARCHAR(255) NOT NULL COMMENT 'API Key do Bitdefender GravityZone',
    access_url VARCHAR(255) NOT NULL COMMENT 'URL de acesso da API',
    enabled BOOLEAN DEFAULT FALSE COMMENT 'Ativar/desativar sincronização',
    sync_interval INT DEFAULT 3600 COMMENT 'Intervalo entre sincronizações em segundos',
    last_sync TIMESTAMP NULL COMMENT 'Última sincronização bem-sucedida',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de log de sincronizações
CREATE TABLE IF NOT EXISTS bitdefender_sync_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('success', 'error', 'warning') NOT NULL,
    message TEXT NOT NULL,
    details JSON NULL COMMENT 'Detalhes adicionais em formato JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar estrutura da tabela bitdefender_licenses
-- Se necessário, adicionar colunas que podem estar faltando
ALTER TABLE bitdefender_licenses 
ADD COLUMN IF NOT EXISTS license_key VARCHAR(255) AFTER email;

ALTER TABLE bitdefender_licenses 
ADD COLUMN IF NOT EXISTS total_licenses INT DEFAULT 0 AFTER license_key;

ALTER TABLE bitdefender_licenses 
ADD COLUMN IF NOT EXISTS expiration_date DATE AFTER total_licenses;

-- Adicionar índices para melhor performance
ALTER TABLE bitdefender_licenses 
ADD INDEX IF NOT EXISTS idx_license_key (license_key);

ALTER TABLE bitdefender_licenses 
ADD INDEX IF NOT EXISTS idx_expiration (expiration_date);

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT 'Pronto para configurar a API do Bitdefender' as message;
