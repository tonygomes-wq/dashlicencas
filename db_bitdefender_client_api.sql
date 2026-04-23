-- ============================================================
-- ADICIONAR API KEY INDIVIDUAL POR CLIENTE - BITDEFENDER
-- ============================================================
-- INSTRUÇÕES:
-- 1. Execute cada comando separadamente no phpMyAdmin
-- 2. Se aparecer erro "Duplicate column name", ignore (coluna já existe)
-- 3. Continue com o próximo comando
-- ============================================================

-- COMANDO 1: Adicionar coluna client_api_key
ALTER TABLE bitdefender_licenses 
ADD COLUMN client_api_key VARCHAR(255) NULL COMMENT 'API Key específica do cliente' AFTER license_key;

-- COMANDO 2: Adicionar coluna client_access_url
ALTER TABLE bitdefender_licenses 
ADD COLUMN client_access_url VARCHAR(255) NULL COMMENT 'Access URL específica do cliente' AFTER client_api_key;

-- COMANDO 3: Adicionar coluna last_sync
ALTER TABLE bitdefender_licenses 
ADD COLUMN last_sync TIMESTAMP NULL COMMENT 'Última sincronização deste cliente' AFTER client_access_url;

-- COMANDO 4: Adicionar índice (opcional, para performance)
ALTER TABLE bitdefender_licenses 
ADD INDEX idx_client_api (client_api_key);

-- COMANDO 5: Verificar se as colunas foram criadas
SHOW COLUMNS FROM bitdefender_licenses LIKE '%client%';
SHOW COLUMNS FROM bitdefender_licenses LIKE 'last_sync';
