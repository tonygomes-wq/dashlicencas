-- ========================================
-- Correção de URLs Duplicadas
-- ========================================
-- Execute este SQL direto no banco de dados

-- 1. Ver URLs atuais
SELECT id, company, client_access_url 
FROM bitdefender_licenses 
WHERE client_api_key IS NOT NULL;

-- 2. Corrigir URLs com /api/api duplicado
UPDATE bitdefender_licenses
SET client_access_url = REPLACE(client_access_url, '/api/api', '/api')
WHERE client_access_url LIKE '%/api/api%';

-- 3. Remover /api do final
UPDATE bitdefender_licenses
SET client_access_url = TRIM(TRAILING '/api' FROM client_access_url)
WHERE client_access_url LIKE '%/api';

-- 4. Remover barra final (se houver)
UPDATE bitdefender_licenses
SET client_access_url = TRIM(TRAILING '/' FROM client_access_url)
WHERE client_access_url LIKE '%/';

-- 5. Verificar resultado
SELECT id, company, client_access_url 
FROM bitdefender_licenses 
WHERE client_api_key IS NOT NULL;

-- ========================================
-- RESULTADO ESPERADO:
-- https://cloud.gravityzone.bitdefender.com
-- (SEM /api no final!)
-- ========================================
