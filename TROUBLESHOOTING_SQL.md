# 🔧 Troubleshooting - Erros SQL

## Erro: "IF NOT EXISTS" em ALTER TABLE

### Problema
```
#1064 - Você tem um erro de sintaxe no seu SQL próximo a 'IF NOT EXISTS'
```

### Causa
MySQL não suporta `IF NOT EXISTS` em `ALTER TABLE ADD COLUMN`.

### Solução
Use o arquivo **`db_complete_upgrade_safe.sql`** ao invés de `db_complete_upgrade.sql`.

---

## Erro: "Duplicate key name"

### Problema
```
#1061 - Duplicate key name 'idx_client_name'
```

### Causa
O índice já existe na tabela.

### Solução
Isso é normal se você já executou o script antes. O arquivo `db_complete_upgrade_safe.sql` ignora esse erro automaticamente.

Se estiver usando o arquivo original, você pode:

1. **Ignorar o erro** - Continue com as próximas queries
2. **Remover o índice primeiro:**
```sql
ALTER TABLE hardware_devices DROP INDEX idx_client_name;
-- Depois execute o ALTER TABLE novamente
```

---

## Erro: "Table already exists"

### Problema
```
#1050 - Table 'audit_log' already exists
```

### Causa
A tabela já foi criada em uma execução anterior.

### Solução
Isso é normal. O script usa `CREATE TABLE IF NOT EXISTS`, então deve ignorar automaticamente.

Se quiser recriar a tabela:
```sql
DROP TABLE IF EXISTS audit_log;
-- Depois execute o CREATE TABLE novamente
```

---

## Erro: "Duplicate entry" ao inserir dados

### Problema
```
#1062 - Duplicate entry 'Técnico' for key 'name'
```

### Causa
Os dados de exemplo já foram inseridos.

### Solução
O script usa `INSERT IGNORE`, então deve pular automaticamente. Se não funcionar:

```sql
-- Verificar se já existe
SELECT * FROM user_groups WHERE name = 'Técnico';

-- Se existir, não precisa inserir novamente
```

---

## Erro: "Unknown column" ao criar view

### Problema
```
#1054 - Unknown column 'warranty_expiration' in 'field list'
```

### Causa
A tabela `hardware_devices` não existe ou não tem essa coluna.

### Solução
1. Verificar se a tabela existe:
```sql
SHOW TABLES LIKE 'hardware_devices';
```

2. Se não existir, execute primeiro:
```sql
SOURCE db_hardware_schema.sql;
```

3. Se existir mas não tem a coluna:
```sql
ALTER TABLE hardware_devices 
ADD COLUMN warranty_expiration DATE NULL;
```

---

## Erro: "Cannot add foreign key constraint"

### Problema
```
#1215 - Cannot add foreign key constraint
```

### Causa
A tabela referenciada não existe ou a coluna não corresponde.

### Solução
O script desabilita temporariamente as verificações de chave estrangeira:

```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Execute suas queries
SET FOREIGN_KEY_CHECKS = 1;
```

Se ainda der erro, verifique:
```sql
-- Verificar se a tabela users existe
SHOW TABLES LIKE 'users';

-- Verificar estrutura
DESCRIBE users;
```

---

## Erro: "Procedure does not exist"

### Problema
```
#1305 - PROCEDURE AddIndexIfNotExists does not exist
```

### Causa
A procedure não foi criada ou foi dropada antes de ser usada.

### Solução
Execute o bloco completo que cria e usa a procedure:

```sql
DELIMITER $$

DROP PROCEDURE IF EXISTS AddIndexIfNotExists$$
CREATE PROCEDURE AddIndexIfNotExists(...)
BEGIN
    ...
END$$

DELIMITER ;

-- Usar a procedure
CALL AddIndexIfNotExists(...);

-- Limpar
DROP PROCEDURE IF EXISTS AddIndexIfNotExists;
```

---

## Executar Seções Individualmente

Se o script completo não funcionar, execute por partes:

### 1. Criar Tabelas Principais
```sql
-- Copie e execute apenas as seções CREATE TABLE
-- (audit_log, notifications, bitdefender_endpoints, etc)
```

### 2. Inserir Dados Padrão
```sql
-- Copie e execute apenas os INSERT INTO
-- (system_settings, user_groups)
```

### 3. Criar Views
```sql
-- Copie e execute apenas os CREATE OR REPLACE VIEW
-- (v_expiring_licenses, v_expiring_warranties, v_active_contracts)
```

### 4. Adicionar Índices
```sql
-- Execute manualmente cada ALTER TABLE ADD INDEX
-- Ignore erros de "Duplicate key name"
```

---

## Verificar Instalação

Após executar o script, verifique se tudo foi criado:

```sql
-- Verificar tabelas
SHOW TABLES LIKE 'audit_log';
SHOW TABLES LIKE 'notifications';
SHOW TABLES LIKE 'bitdefender_endpoints';
SHOW TABLES LIKE 'contracts';
SHOW TABLES LIKE 'sync_logs';
SHOW TABLES LIKE 'user_groups';
SHOW TABLES LIKE 'system_settings';

-- Verificar views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Verificar dados de exemplo
SELECT COUNT(*) as grupos FROM user_groups;
SELECT COUNT(*) as configuracoes FROM system_settings;

-- Verificar índices
SHOW INDEX FROM hardware_devices;
SHOW INDEX FROM bitdefender_licenses;
```

Resultado esperado:
- 11 tabelas novas
- 3 views
- 3 grupos de usuários
- 6 configurações do sistema

---

## Script de Verificação Completo

Execute este script para verificar tudo:

```sql
SELECT 'Verificando instalação...' as status;

-- Contar tabelas
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = DATABASE() 
     AND table_name IN ('audit_log', 'notifications', 'notification_settings', 
                        'bitdefender_endpoints', 'sync_logs', 'contracts', 
                        'contract_renewals', 'user_groups', 'user_group_members', 
                        'user_client_access', 'system_settings')) as tabelas_criadas,
    11 as tabelas_esperadas;

-- Contar views
SELECT 
    (SELECT COUNT(*) FROM information_schema.views 
     WHERE table_schema = DATABASE() 
     AND table_name IN ('v_expiring_licenses', 'v_expiring_warranties', 'v_active_contracts')) as views_criadas,
    3 as views_esperadas;

-- Contar dados
SELECT 
    (SELECT COUNT(*) FROM user_groups) as grupos,
    (SELECT COUNT(*) FROM system_settings) as configuracoes;

-- Verificar índices importantes
SELECT 
    table_name, 
    index_name, 
    column_name
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name IN ('hardware_devices', 'bitdefender_licenses', 'fortigate_devices')
  AND index_name LIKE 'idx_%'
ORDER BY table_name, index_name;
```

---

## Rollback (Desfazer Instalação)

Se precisar desfazer tudo:

```sql
-- ⚠️ CUIDADO: Isso vai deletar todas as tabelas e dados!

DROP TABLE IF EXISTS contract_renewals;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS user_client_access;
DROP TABLE IF EXISTS user_group_members;
DROP TABLE IF EXISTS user_groups;
DROP TABLE IF EXISTS sync_logs;
DROP TABLE IF EXISTS bitdefender_endpoints;
DROP TABLE IF EXISTS notification_settings;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS system_settings;

DROP VIEW IF EXISTS v_expiring_licenses;
DROP VIEW IF EXISTS v_expiring_warranties;
DROP VIEW IF EXISTS v_active_contracts;

-- Remover índices adicionados
ALTER TABLE hardware_devices DROP INDEX IF EXISTS idx_client_name;
ALTER TABLE hardware_devices DROP INDEX IF EXISTS idx_device_type;
ALTER TABLE hardware_devices DROP INDEX IF EXISTS idx_status;

ALTER TABLE bitdefender_licenses DROP INDEX IF EXISTS idx_company;
ALTER TABLE bitdefender_licenses DROP INDEX IF EXISTS idx_expiration_date;
ALTER TABLE bitdefender_licenses DROP INDEX IF EXISTS idx_renewal_status;

-- ... (continue para outras tabelas)
```

---

## Suporte

Se nenhuma solução acima funcionar:

1. **Exporte o erro completo** (mensagem + query)
2. **Verifique a versão do MySQL:**
```sql
SELECT VERSION();
```
3. **Verifique permissões do usuário:**
```sql
SHOW GRANTS FOR CURRENT_USER();
```

Você precisa das permissões:
- `CREATE` - Para criar tabelas
- `ALTER` - Para modificar tabelas
- `INDEX` - Para criar índices
- `CREATE VIEW` - Para criar views
- `CREATE ROUTINE` - Para criar procedures

---

**Última atualização:** 24/04/2026
