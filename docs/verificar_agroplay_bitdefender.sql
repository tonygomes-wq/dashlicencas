-- Verificar quantas licenças Bitdefender existem para AGROPLAY
-- Execute esta query no phpMyAdmin para confirmar os dados

-- 1. Verificar o nome exato da empresa no banco
SELECT DISTINCT company, LENGTH(company) as tamanho, HEX(company) as hex_value
FROM bitdefender_licenses
WHERE UPPER(TRIM(company)) = 'AGROPLAY';

-- 2. Contar licenças para AGROPLAY
SELECT COUNT(*) as total_licencas
FROM bitdefender_licenses
WHERE UPPER(TRIM(company)) = 'AGROPLAY';

-- 3. Ver todas as licenças AGROPLAY com detalhes
SELECT 
    id,
    company,
    contact_person,
    email,
    expiration_date,
    total_licenses,
    renewal_status,
    created_at
FROM bitdefender_licenses
WHERE UPPER(TRIM(company)) = 'AGROPLAY';

-- 4. Verificar se há variações do nome (espaços, maiúsculas/minúsculas)
SELECT 
    company,
    COUNT(*) as quantidade,
    LENGTH(company) as tamanho_nome
FROM bitdefender_licenses
WHERE company LIKE '%AGRO%' OR company LIKE '%agro%'
GROUP BY company;

-- 5. Ver TODAS as empresas para comparação
SELECT DISTINCT company
FROM bitdefender_licenses
ORDER BY company;
