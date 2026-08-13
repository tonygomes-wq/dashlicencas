-- Adicionar campo de observações nas tabelas de licenças
-- Versão SEGURA - Não dá erro se o campo já existir
-- Execute este script no banco de dados

-- Procedimento para adicionar campo notes na tabela bitdefender_licenses
DELIMITER $$

DROP PROCEDURE IF EXISTS add_notes_to_bitdefender$$
CREATE PROCEDURE add_notes_to_bitdefender()
BEGIN
    -- Verifica se a coluna já existe
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'bitdefender_licenses' 
        AND COLUMN_NAME = 'notes'
    ) THEN
        ALTER TABLE `bitdefender_licenses` 
        ADD COLUMN `notes` TEXT COLLATE utf8_unicode_ci DEFAULT NULL 
        COMMENT 'Observações e informações extras' 
        AFTER `renewal_status`;
        
        SELECT 'Campo notes adicionado em bitdefender_licenses' as resultado;
    ELSE
        SELECT 'Campo notes já existe em bitdefender_licenses' as resultado;
    END IF;
END$$

DELIMITER ;

-- Executar o procedimento
CALL add_notes_to_bitdefender();

-- Remover o procedimento
DROP PROCEDURE IF EXISTS add_notes_to_bitdefender;

-- ============================================================================

-- Procedimento para adicionar campo notes na tabela fortigate_devices
DELIMITER $$

DROP PROCEDURE IF EXISTS add_notes_to_fortigate$$
CREATE PROCEDURE add_notes_to_fortigate()
BEGIN
    -- Verifica se a coluna já existe
    IF NOT EXISTS (
        SELECT * FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'fortigate_devices' 
        AND COLUMN_NAME = 'notes'
    ) THEN
        ALTER TABLE `fortigate_devices` 
        ADD COLUMN `notes` TEXT COLLATE utf8_unicode_ci DEFAULT NULL 
        COMMENT 'Observações e informações extras' 
        AFTER `renewal_status`;
        
        SELECT 'Campo notes adicionado em fortigate_devices' as resultado;
    ELSE
        SELECT 'Campo notes já existe em fortigate_devices' as resultado;
    END IF;
END$$

DELIMITER ;

-- Executar o procedimento
CALL add_notes_to_fortigate();

-- Remover o procedimento
DROP PROCEDURE IF EXISTS add_notes_to_fortigate;
