-- ============================================
-- QUERIES DE VERIFICAÇÃO DO DASHBOARD
-- Execute no phpMyAdmin para verificar dados
-- ============================================

-- ============================================
-- 1. BITDEFENDER - AGROPLAY
-- ============================================

-- Verificar registros e total de licenças
SELECT 
    id,
    company,
    contact_person,
    total_licenses,
    expiration_date,
    renewal_status
FROM bitdefender_licenses
WHERE UPPER(TRIM(company)) = 'AGROPLAY';

-- Resultado esperado:
-- 1 registro com total_licenses = 60

-- Soma total de licenças (o que o dashboard deve mostrar)
SELECT 
    COUNT(*) as num_registros,
    SUM(total_licenses) as total_licencas
FROM bitdefender_licenses
WHERE UPPER(TRIM(company)) = 'AGROPLAY';

-- Resultado esperado:
-- num_registros: 1
-- total_licencas: 60


-- ============================================
-- 2. OFFICE 365 - AGROPLAY
-- ============================================

-- Buscar o client_id da Agroplay
SELECT id, client_name, contact_email
FROM o365_clients
WHERE UPPER(TRIM(client_name)) = 'AGROPLAY';

-- Resultado esperado:
-- id: 3a6570b8-6f7a-432d-99d1-21a3ec73bd68
-- client_name: Agroplay

-- Contar licenças O365 da Agroplay
SELECT COUNT(*) as total_licencas
FROM o365_licenses
WHERE client_id = '3a6570b8-6f7a-432d-99d1-21a3ec73bd68';

-- Resultado esperado:
-- total_licencas: 24

-- Ver todas as licenças O365 da Agroplay com nome do cliente
SELECT 
    l.id,
    c.client_name,
    l.username,
    l.email,
    l.license_type,
    l.renewal_status
FROM o365_licenses l
JOIN o365_clients c ON l.client_id = c.id
WHERE UPPER(TRIM(c.client_name)) = 'AGROPLAY';


-- ============================================
-- 3. GMAIL - AGROPLAY
-- ============================================

-- Buscar o client_id da Agroplay
SELECT id, client_name, contact_email
FROM gmail_clients
WHERE UPPER(TRIM(client_name)) = 'AGROPLAY';

-- Resultado esperado:
-- id: 029f526e26accb9ea987337965b545ff
-- client_name: Agroplay

-- Contar licenças Gmail da Agroplay
SELECT COUNT(*) as total_licencas
FROM gmail_licenses
WHERE client_id = '029f526e26accb9ea987337965b545ff';

-- Resultado esperado:
-- total_licencas: 68

-- Ver todas as licenças Gmail da Agroplay com nome do cliente
SELECT 
    l.id,
    c.client_name,
    l.username,
    l.email,
    l.license_type,
    l.renewal_status
FROM gmail_licenses l
JOIN gmail_clients c ON l.client_id = c.id
WHERE UPPER(TRIM(c.client_name)) = 'AGROPLAY';


-- ============================================
-- 4. FORTIGATE - AGROPLAY
-- ============================================

-- Contar dispositivos Fortigate da Agroplay
SELECT 
    id,
    serial,
    model,
    client,
    vencimento,
    renewal_status
FROM fortigate_devices
WHERE UPPER(TRIM(client)) = 'AGROPLAY';

-- Resultado esperado:
-- 1 dispositivo


-- ============================================
-- 5. RESUMO GERAL - AGROPLAY
-- ============================================

-- Resumo de todas as licenças/dispositivos da Agroplay
SELECT 
    'Bitdefender' as produto,
    SUM(total_licenses) as quantidade
FROM bitdefender_licenses
WHERE UPPER(TRIM(company)) = 'AGROPLAY'

UNION ALL

SELECT 
    'Office 365' as produto,
    COUNT(*) as quantidade
FROM o365_licenses l
JOIN o365_clients c ON l.client_id = c.id
WHERE UPPER(TRIM(c.client_name)) = 'AGROPLAY'

UNION ALL

SELECT 
    'Gmail' as produto,
    COUNT(*) as quantidade
FROM gmail_licenses l
JOIN gmail_clients c ON l.client_id = c.id
WHERE UPPER(TRIM(c.client_name)) = 'AGROPLAY'

UNION ALL

SELECT 
    'Fortigate' as produto,
    COUNT(*) as quantidade
FROM fortigate_devices
WHERE UPPER(TRIM(client)) = 'AGROPLAY';

-- Resultado esperado:
-- Bitdefender: 60
-- Office 365: 24
-- Gmail: 68
-- Fortigate: 1


-- ============================================
-- 6. VERIFICAR TODOS OS CLIENTES
-- ============================================

-- Listar todos os clientes únicos de todas as fontes
SELECT DISTINCT company as cliente, 'Bitdefender' as fonte
FROM bitdefender_licenses
WHERE company IS NOT NULL

UNION

SELECT DISTINCT client as cliente, 'Fortigate' as fonte
FROM fortigate_devices
WHERE client IS NOT NULL

UNION

SELECT DISTINCT client_name as cliente, 'Office 365' as fonte
FROM o365_clients
WHERE client_name IS NOT NULL

UNION

SELECT DISTINCT client_name as cliente, 'Gmail' as fonte
FROM gmail_clients
WHERE client_name IS NOT NULL

ORDER BY cliente;


-- ============================================
-- 7. VERIFICAR VARIAÇÕES DE NOME
-- ============================================

-- Verificar se há variações do nome "Agroplay"
SELECT 
    'Bitdefender' as fonte,
    company as nome,
    LENGTH(company) as tamanho,
    HEX(company) as hex_value
FROM bitdefender_licenses
WHERE company LIKE '%agro%' OR company LIKE '%AGRO%'

UNION ALL

SELECT 
    'Fortigate' as fonte,
    client as nome,
    LENGTH(client) as tamanho,
    HEX(client) as hex_value
FROM fortigate_devices
WHERE client LIKE '%agro%' OR client LIKE '%AGRO%'

UNION ALL

SELECT 
    'Office 365' as fonte,
    client_name as nome,
    LENGTH(client_name) as tamanho,
    HEX(client_name) as hex_value
FROM o365_clients
WHERE client_name LIKE '%agro%' OR client_name LIKE '%AGRO%'

UNION ALL

SELECT 
    'Gmail' as fonte,
    client_name as nome,
    LENGTH(client_name) as tamanho,
    HEX(client_name) as hex_value
FROM gmail_clients
WHERE client_name LIKE '%agro%' OR client_name LIKE '%AGRO%';


-- ============================================
-- 8. TOTAL GERAL (SEM FILTRO)
-- ============================================

-- Total de licenças Bitdefender (soma de total_licenses)
SELECT 
    'Bitdefender' as produto,
    COUNT(*) as num_registros,
    SUM(total_licenses) as total_licencas
FROM bitdefender_licenses;

-- Total de licenças Office 365 (conta registros)
SELECT 
    'Office 365' as produto,
    COUNT(*) as total_licencas
FROM o365_licenses;

-- Total de licenças Gmail (conta registros)
SELECT 
    'Gmail' as produto,
    COUNT(*) as total_licencas
FROM gmail_licenses;

-- Total de dispositivos Fortigate (conta registros)
SELECT 
    'Fortigate' as produto,
    COUNT(*) as total_dispositivos
FROM fortigate_devices;


-- ============================================
-- 9. VERIFICAR INTEGRIDADE DOS DADOS
-- ============================================

-- Verificar licenças O365 sem cliente
SELECT COUNT(*) as licencas_sem_cliente
FROM o365_licenses l
LEFT JOIN o365_clients c ON l.client_id = c.id
WHERE c.id IS NULL;

-- Resultado esperado: 0

-- Verificar licenças Gmail sem cliente
SELECT COUNT(*) as licencas_sem_cliente
FROM gmail_licenses l
LEFT JOIN gmail_clients c ON l.client_id = c.id
WHERE c.id IS NULL;

-- Resultado esperado: 0

-- Verificar Bitdefender com total_licenses NULL ou 0
SELECT COUNT(*) as registros_sem_licencas
FROM bitdefender_licenses
WHERE total_licenses IS NULL OR total_licenses = 0;


-- ============================================
-- 10. ESTATÍSTICAS POR STATUS
-- ============================================

-- Bitdefender por status de renovação
SELECT 
    renewal_status,
    COUNT(*) as num_registros,
    SUM(total_licenses) as total_licencas
FROM bitdefender_licenses
GROUP BY renewal_status;

-- O365 por status de renovação
SELECT 
    renewal_status,
    COUNT(*) as total_licencas
FROM o365_licenses
GROUP BY renewal_status;

-- Gmail por status de renovação
SELECT 
    renewal_status,
    COUNT(*) as total_licencas
FROM gmail_licenses
GROUP BY renewal_status;

-- Fortigate por status de renovação
SELECT 
    renewal_status,
    COUNT(*) as total_dispositivos
FROM fortigate_devices
GROUP BY renewal_status;
