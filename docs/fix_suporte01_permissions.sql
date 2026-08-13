-- Script SQL para corrigir permissões do usuário suporte01

-- Verificar dados atuais
SELECT 
    id,
    email,
    role,
    is_active,
    created_at
FROM users 
WHERE email = 'suporte01@macip.com.br';

-- Atualizar role para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'suporte01@macip.com.br';

-- Garantir que está ativo
UPDATE users 
SET is_active = TRUE 
WHERE email = 'suporte01@macip.com.br';

-- Verificar dados finais
SELECT 
    id,
    email,
    role,
    is_active,
    'ATUALIZADO COM SUCESSO' as status
FROM users 
WHERE email = 'suporte01@macip.com.br';
