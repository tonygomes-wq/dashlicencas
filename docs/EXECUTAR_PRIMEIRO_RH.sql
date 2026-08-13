-- ========================================================================
-- SCRIPT RÁPIDO: Configurar Permissões RH
-- Execute este script DEPOIS de executar db_hr_schema.sql
-- ========================================================================

-- Verificar estrutura atual da tabela users
DESCRIBE users;

-- Ver permissões atuais dos admins
SELECT id, email, role, permissions 
FROM users 
WHERE role = 'admin';

-- Atualizar permissões para incluir módulo RH
UPDATE users
SET permissions = JSON_SET(
    permissions,
    '$.dashboards.hr', true,
    '$.client_access.hr', JSON_ARRAY()
)
WHERE role = 'admin'
AND permissions IS NOT NULL;

-- Verificar se foi aplicado
SELECT 
    id,
    email,
    role,
    JSON_EXTRACT(permissions, '$.dashboards.hr') AS hr_habilitado,
    JSON_EXTRACT(permissions, '$.dashboards') AS todos_modulos
FROM users
WHERE role = 'admin';

-- ========================================================================
-- Se aparecer "1" ou "true" na coluna hr_habilitado, está correto! ✅
-- ========================================================================
