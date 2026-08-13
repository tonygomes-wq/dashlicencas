-- Adicionar campo de observações nas tabelas de licenças
-- Execute este script no banco de dados

-- Adicionar campo notes na tabela bitdefender_licenses
ALTER TABLE `bitdefender_licenses` 
ADD COLUMN `notes` TEXT COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Observações e informações extras' 
AFTER `renewal_status`;

-- Adicionar campo notes na tabela fortigate_devices
ALTER TABLE `fortigate_devices` 
ADD COLUMN `notes` TEXT COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Observações e informações extras' 
AFTER `renewal_status`;
