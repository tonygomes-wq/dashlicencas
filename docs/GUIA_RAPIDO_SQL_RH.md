# 🚀 GUIA RÁPIDO: Executar SQL do Módulo RH

## ⚠️ ERRO RESOLVIDO

O erro `Coluna 'username' desconhecida` foi corrigido. A tabela `users` usa `email` em vez de `username`.

---

## 📝 ORDEM DE EXECUÇÃO

### PASSO 1: Criar Tabelas ✅
**Arquivo:** `db_hr_schema.sql`

No phpMyAdmin:
1. Selecione seu banco de dados
2. Clique em "SQL"
3. Cole o conteúdo de `db_hr_schema.sql`
4. Clique em "Executar"

**Resultado esperado:** 5 tabelas criadas (`hr_employees`, `hr_vacations`, `hr_leaves`, `hr_benefits`, `hr_documents`)

---

### PASSO 2: Adicionar Permissões ✅
**Arquivo:** `EXECUTAR_PRIMEIRO_RH.sql` (novo arquivo corrigido)

No phpMyAdmin:
1. Clique em "SQL"
2. Cole o conteúdo de `EXECUTAR_PRIMEIRO_RH.sql`
3. Clique em "Executar"

**Resultado esperado:** 
- Query 1: Mostra estrutura da tabela users
- Query 2: Mostra permissões atuais
- Query 3: Atualiza permissões (deve mostrar "X rows affected")
- Query 4: Mostra `hr_habilitado` = `1` ou `true`

---

## ✅ VERIFICAÇÃO

Execute este comando para confirmar:

```sql
SELECT 
    email,
    JSON_EXTRACT(permissions, '$.dashboards.hr') AS rh_ativo
FROM users
WHERE role = 'admin';
```

**Se mostrar `1` ou `true`, está funcionando!** ✅

---

## 🐛 SE DER ERRO

### Erro: "Table already exists"
**Solução:** As tabelas já foram criadas. Pule o PASSO 1.

### Erro: "Unknown column 'username'"
**Solução:** Use o arquivo `EXECUTAR_PRIMEIRO_RH.sql` em vez de `add_hr_permissions.sql`

### Erro: "Syntax error"
**Solução:** Certifique-se de estar executando TODO o conteúdo do arquivo de uma vez.

---

## 📁 ARQUIVOS DISPONÍVEIS

| Arquivo | Descrição | Status |
|---------|-----------|--------|
| `db_hr_schema.sql` | Cria 5 tabelas RH | ✅ Correto |
| `EXECUTAR_PRIMEIRO_RH.sql` | Adiciona permissões | ✅ Correto e testado |
| `add_hr_permissions.sql` | Versão original | ✅ Corrigido |
| `add_hr_permissions_corrigido.sql` | Versão simplificada | ✅ Correto |

**Recomendação:** Use `EXECUTAR_PRIMEIRO_RH.sql` (mais simples e direto)

---

## 🎯 PRÓXIMO PASSO

Após executar os SQLs:

1. ✅ Fazer logout do sistema
2. ✅ Fazer login novamente
3. ✅ Verificar se aparece o menu "Recursos Humanos"
4. ✅ Se não aparecer, integrar ao Dashboard (ver `INSTRUCOES_INTEGRACAO_RH.md`)

---

## 💡 COMANDOS ÚTEIS

### Ver todas as tabelas HR:
```sql
SHOW TABLES LIKE 'hr_%';
```

### Ver estrutura de uma tabela:
```sql
DESCRIBE hr_employees;
```

### Deletar todas as tabelas HR (caso precise recomeçar):
```sql
DROP TABLE IF EXISTS hr_documents;
DROP TABLE IF EXISTS hr_benefits;
DROP TABLE IF EXISTS hr_leaves;
DROP TABLE IF EXISTS hr_vacations;
DROP TABLE IF EXISTS hr_employees;
```

### Remover permissões RH (rollback):
```sql
UPDATE users
SET permissions = JSON_REMOVE(
    permissions,
    '$.dashboards.hr',
    '$.client_access.hr'
);
```

---

**Criado em:** 02/06/2026  
**Erro corrigido:** ✅ username → email
