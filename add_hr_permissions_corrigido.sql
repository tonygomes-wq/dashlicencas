-- ========================================================================
-- ADICIONAR PERMISSÕES DO MÓDULO RH (VERSÃO CORRIGIDA)
-- Data: 02/06/2026
-- ========================================================================
-- Este script adiciona a permissão 'hr' aos usuários admin existentes

-- ========================================================================
-- PASSO 1: Atualizar usuários admin que já tem permissões
-- ========================================================================

UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.dashboards.hr', true,
    '$.client_access.hr', JSON_ARRAY()
)
WHERE role = 'admin'
AND permissions IS NOT NULL
AND permissions != '';

-- ========================================================================
-- PASSO 2: Verificar se foi atualizado corretamente
-- ========================================================================

SELECT 
    id,
    email,
    role,
    JSON_EXTRACT(permissions, '$.dashboards.hr') AS hr_dashboard_access,
    JSON_EXTRACT(permissions, '$.dashboards') AS todos_dashboards
FROM users
WHERE role = 'admin';

-- ========================================================================
-- EXEMPLO: Habilitar RH para um usuário específico
-- ========================================================================

-- Caso queira habilitar para um usuário específico, descomente e ajuste:
/*
UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.dashboards.hr', true,
    '$.client_access.hr', JSON_ARRAY()
)
WHERE email = 'seu.email@empresa.com';
*/

-- ========================================================================
-- FIM DO SCRIPT
-- ========================================================================
