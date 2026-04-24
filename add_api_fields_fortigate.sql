-- Adicionar campos de API na tabela fortigate_devices

ALTER TABLE fortigate_devices 
ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status,
ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token,
ADD COLUMN notes TEXT NULL AFTER api_ip;

-- Verificar se os campos foram adicionados
DESCRIBE fortigate_devices;
