-- ============================================
-- INSTRUÇÕES PARA ADICIONAR CAMPO NOTES
-- ============================================
-- 
-- 1. Abra o phpMyAdmin
-- 2. Selecione o banco de dados: dashlicencas
-- 3. Clique na aba "SQL"
-- 4. Cole APENAS o comando abaixo
-- 5. Clique em "Executar"
--
-- ============================================

ALTER TABLE bitdefender_licenses 
ADD COLUMN notes TEXT NULL 
AFTER renewal_status;

-- ============================================
-- VERIFICAÇÃO (Execute depois do comando acima)
-- ============================================
-- Para verificar se o campo foi adicionado com sucesso:

DESCRIBE bitdefender_licenses;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Você deve ver uma linha com:
-- Field: notes
-- Type: text
-- Null: YES
-- Key: (vazio)
-- Default: NULL
-- Extra: (vazio)
-- ============================================
