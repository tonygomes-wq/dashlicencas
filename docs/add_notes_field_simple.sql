-- Adicionar campo de observações nas tabelas de licenças
-- Versão SIMPLES - Execute comando por comando no phpMyAdmin
-- Se der erro "coluna já existe", ignore o erro

-- PASSO 1: Adicionar campo notes na tabela bitdefender_licenses
ALTER TABLE `bitdefender_licenses` 
ADD COLUMN `notes` TEXT DEFAULT NULL COMMENT 'Observações e informações extras';

-- PASSO 2: Adicionar campo notes na tabela fortigate_devices
ALTER TABLE `fortigate_devices` 
ADD COLUMN `notes` TEXT DEFAULT NULL COMMENT 'Observações e informações extras';

-- PRONTO! Os campos foram adicionados.
-- Para verificar, execute:
-- DESCRIBE bitdefender_licenses;
-- DESCRIBE fortigate_devices;
