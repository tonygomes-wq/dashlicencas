-- disable_2fa.sql - Desabilitar 2FA de todos os usuários

-- Desabilitar 2FA para todos os usuários
UPDATE users 
SET two_factor_enabled = 0,
    two_factor_secret = NULL
WHERE two_factor_enabled = 1;

-- Verificar resultado
SELECT id, email, two_factor_enabled 
FROM users;
