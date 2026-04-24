-- Adicionar campo notes na tabela bitdefender_licenses
ALTER TABLE bitdefender_licenses 
ADD COLUMN notes TEXT NULL 
AFTER renewal_status;

-- Verificar se foi adicionado com sucesso
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dashlicencas' 
  AND TABLE_NAME = 'bitdefender_licenses' 
  AND COLUMN_NAME = 'notes';
