-- Verificar se a tabela bitdefender_endpoints existe e tem dados
-- Execute este script no phpMyAdmin

-- 1. Verificar se a tabela existe
SHOW TABLES LIKE 'bitdefender_endpoints';

-- 2. Ver estrutura da tabela
DESCRIBE bitdefender_endpoints;

-- 3. Contar quantos endpoints existem
SELECT COUNT(*) as total_endpoints FROM bitdefender_endpoints;

-- 4. Ver clientes que têm API configurada
SELECT 
    id,
    company,
    CASE 
        WHEN client_api_key IS NOT NULL AND client_api_key != '' THEN 'Sim'
        ELSE 'Não'
    END as tem_api_key,
    client_access_url
FROM bitdefender_licenses
WHERE client_api_key IS NOT NULL AND client_api_key != '';

-- 5. Ver todos os endpoints (se existirem)
SELECT 
    e.id,
    e.endpoint_id,
    e.name,
    e.ip_address,
    e.protection_status,
    e.last_seen,
    e.last_sync,
    b.company as cliente
FROM bitdefender_endpoints e
LEFT JOIN bitdefender_licenses b ON e.client_id = b.id
ORDER BY e.last_sync DESC
LIMIT 20;

-- 6. Estatísticas dos endpoints
SELECT 
    protection_status,
    COUNT(*) as quantidade
FROM bitdefender_endpoints
GROUP BY protection_status;
