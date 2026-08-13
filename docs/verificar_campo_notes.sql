-- Verificar se o campo notes existe na tabela bitdefender_licenses
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'dashlicencas' 
    AND TABLE_NAME = 'bitdefender_licenses'
    AND COLUMN_NAME = 'notes';

-- Se o resultado acima estiver vazio, execute o comando abaixo para adicionar o campo:
-- ALTER TABLE bitdefender_licenses ADD COLUMN notes TEXT NULL AFTER renewal_status;
