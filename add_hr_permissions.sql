-- ========================================================================
-- ADICIONAR PERMISSÕES DO MÓDULO RH AOS USUÁRIOS EXISTENTES
-- Data: 02/06/2026
-- ========================================================================

-- Este script atualiza as permissões dos usuários admin existentes
-- para incluir acesso ao novo módulo RH

-- ========================================================================
-- BACKUP DE SEGURANÇA (Comentar após executar)
-- ========================================================================
-- SELECT id, username, permissions INTO OUTFILE '/tmp/users_backup.csv'
-- FROM users;

-- ========================================================================
-- ATUALIZAR USUÁRIOS ADMIN
-- Adiciona permissão 'hr' ao dashboard para todos os admins
-- ========================================================================

-- Para usuários admin com permissions NULL ou vazias
UPDATE users 
SET permissions = JSON_OBJECT(
    'dashboards', JSON_OBJECT(
        'bitdefender', true,
        'fortigate', true,
        'o365', true,
        'gmail', true,
        'network', true,
        'hr', true
    ),
    'actions', JSON_OBJECT(
        'edit', true,
        'delete', true
    ),
    'client_access_all', true,
    'client_access', JSON_OBJECT(
        'bitdefender', JSON_ARRAY(),
        'fortigate', JSON_ARRAY(),
        'o365', JSON_ARRAY(),
        'gmail', JSON_ARRAY(),
        'network', JSON_ARRAY(),
        'hr', JSON_ARRAY()
    )
)
WHERE role = 'admin' 
AND (permissions IS NULL OR permissions = '');

-- ========================================================================
-- ATUALIZAR USUÁRIOS ADMIN QUE JÁ TEM PERMISSÕES
-- Adiciona 'hr' aos dashboards existentes
-- ========================================================================

-- Esta query adiciona 'hr': true ao objeto dashboards
UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.dashboards.hr', true,
    '$.client_access.hr', JSON_ARRAY()
)
WHERE role = 'admin'
AND permissions IS NOT NULL
AND permissions != ''
AND JSON_EXTRACT(permissions, '$.dashboards') IS NOT NULL;

-- ========================================================================
-- ATUALIZAR USUÁRIOS NÃO-ADMIN
-- Adiciona 'hr' desabilitado por padrão
-- ========================================================================

UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.dashboards.hr', false,
    '$.client_access.hr', JSON_ARRAY()
)
WHERE role != 'admin'
AND permissions IS NOT NULL
AND permissions != ''
AND JSON_EXTRACT(permissions, '$.dashboards') IS NOT NULL;

-- ========================================================================
-- VERIFICAÇÃO
-- Lista todos os usuários e suas permissões de RH
-- ========================================================================

SELECT 
    id,
    email,
    role,
    JSON_EXTRACT(permissions, '$.dashboards.hr') AS hr_dashboard_access,
    JSON_EXTRACT(permissions, '$.client_access.hr') AS hr_client_access
FROM users
ORDER BY role DESC, email;

-- ========================================================================
-- EXEMPLO: Conceder acesso RH a um usuário específico
-- ========================================================================

-- Descomente e ajuste o email para habilitar RH para um usuário específico:
/*
UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.dashboards.hr', true
)
WHERE email = 'usuario@empresa.com';
*/

-- ========================================================================
-- EXEMPLO: Restringir acesso a departamentos específicos (futuro)
-- ========================================================================

-- Quando implementar filtro por departamento, use algo como:
/*
UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.hr_departments', JSON_ARRAY('TI', 'Comercial')
)
WHERE email = 'gerente.ti@empresa.com';
*/

-- ========================================================================
-- ROLLBACK (Se necessário)
-- ========================================================================

-- Para remover as permissões RH:
/*
UPDATE users
SET permissions = JSON_REMOVE(
    permissions,
    '$.dashboards.hr',
    '$.client_access.hr'
)
WHERE JSON_EXTRACT(permissions, '$.dashboards.hr') IS NOT NULL;
*/

-- ========================================================================
-- FIM DO SCRIPT
-- ========================================================================

-- NOTAS:
-- 1. Execute este script APÓS criar as tabelas (db_hr_schema.sql)
-- 2. Verifique os resultados com a query SELECT no final
-- 3. Teste o login após executar para garantir que não quebrou nada
-- 4. Em caso de erro, use o ROLLBACK acima
