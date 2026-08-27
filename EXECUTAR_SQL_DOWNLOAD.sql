-- ========================================
-- SCRIPT SQL PARA TESTAR DOWNLOAD DO RELATÓRIO #14
-- Execute este SQL no phpMyAdmin
-- ========================================

-- 1. Verificar relatório #14
SELECT 
    id,
    report_name,
    status,
    bitdefender_report_id,
    download_url,
    pdf_path,
    csv_path
FROM bitdefender_reports
WHERE id = 14;

-- ========================================
-- RESULTADO ESPERADO:
-- - status: 'ready'
-- - bitdefender_report_id: '6a904795048c7746a00800b7'
-- - download_url: NULL (precisa buscar)
-- ========================================

-- 2. Verificar client_access_url (deve estar SEM /api no final)
SELECT 
    bl.id,
    bl.company,
    bl.client_access_url,
    bl.client_api_key IS NOT NULL as tem_api_key
FROM bitdefender_licenses bl
JOIN bitdefender_reports br ON br.client_id = bl.id
WHERE br.id = 14;

-- ========================================
-- RESULTADO ESPERADO:
-- client_access_url: 'https://cloud.gravityzone.bitdefender.com'
-- (SEM /api no final!)
-- tem_api_key: 1
-- ========================================

-- ========================================
-- PRÓXIMOS PASSOS APÓS VERIFICAR:
-- ========================================
-- 
-- Se client_access_url estiver COM /api no final:
--   1. Execute o fix_urls.sql que criamos
--   2. Ou corrija manualmente no dashboard
--
-- Se client_access_url estiver correto:
--   1. Aguarde deploy dos scripts PHP
--   2. Execute download_report_14_direct.php
--   3. Sistema deve baixar PDF/CSV automaticamente
--
-- ========================================
