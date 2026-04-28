# Correção: Estatísticas Bitdefender API

## Problema Identificado

O card "Estatísticas Bitdefender API" estava retornando erro:
```
SyntaxError: Unexpected token '<', "<br /><b>"... is not valid JSON
```

### Causa Raiz

**Inconsistência entre nomes de colunas no SQL e no código PHP:**

- **SQL** (`add_license_usage_fields.sql`):
  - `used_slots`
  - `total_slots`
  - `license_usage_percent`
  - `license_usage_alert`
  - `license_usage_last_sync`

- **Código PHP** (estava usando):
  - `used_licenses` ❌
  - `free_licenses` ❌
  - `usage_percentage` ❌
  - `over_limit` ❌

Quando o PHP tentava fazer a query com colunas inexistentes, o MySQL retornava erro, e o PHP exibia o erro em HTML (com `<br />` e `<b>`), ao invés de JSON.

## Correções Aplicadas

### 1. `app_bitdefender_endpoints.php`

**Função `getStats()` atualizada:**
- ✅ Verifica dinamicamente quais colunas existem na tabela
- ✅ Usa nomes corretos: `used_slots`, `total_slots`, `license_usage_percent`
- ✅ Fallback para colunas básicas se as extras não existirem
- ✅ Try-catch para retornar JSON válido mesmo em caso de erro

### 2. `app_bitdefender_sync_client.php`

**Função de sincronização atualizada:**
- ✅ Usa `used_slots` ao invés de `used_licenses`
- ✅ Usa `total_slots` ao invés de campo inexistente
- ✅ Usa `license_usage_percent` ao invés de `usage_percentage`
- ✅ Usa `license_usage_alert` ao invés de `over_limit`
- ✅ Atualiza `license_usage_last_sync` com timestamp da sincronização

**Função `checkExtraColumns()` atualizada:**
- ✅ Verifica `used_slots` ao invés de `used_licenses`

## Próximos Passos

### 1. Verificar se as colunas existem no banco

Execute no **phpMyAdmin** ou **MySQL**:

```sql
SHOW COLUMNS FROM bitdefender_licenses;
```

Verifique se existem as colunas:
- `used_slots`
- `total_slots`
- `license_usage_percent`
- `license_usage_alert`
- `license_usage_last_sync`

### 2. Se as colunas NÃO existirem, execute o SQL

```sql
-- Adicionar campos de uso de licença
ALTER TABLE bitdefender_licenses
ADD COLUMN used_slots INT DEFAULT 0 COMMENT 'Número de assentos usados',
ADD COLUMN total_slots INT DEFAULT 0 COMMENT 'Número total de assentos disponíveis',
ADD COLUMN license_usage_percent DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Percentual de uso da licença',
ADD COLUMN license_usage_last_sync DATETIME NULL COMMENT 'Data da última sincronização de uso',
ADD COLUMN license_usage_alert BOOLEAN DEFAULT FALSE COMMENT 'Alerta de uso de licença (>= 90%)';

-- Criar índices para consultas rápidas
CREATE INDEX idx_license_usage_alert ON bitdefender_licenses(license_usage_alert);
CREATE INDEX idx_license_usage_percent ON bitdefender_licenses(license_usage_percent);
```

### 3. Fazer commit e push

```bash
git add app_bitdefender_endpoints.php app_bitdefender_sync_client.php
git commit -m "fix: corrigir nomes de colunas nas estatísticas Bitdefender"
git push origin main
```

### 4. Aguardar redeploy no Easypanel

O Easypanel vai detectar o push e fazer o redeploy automaticamente.

### 5. Sincronizar clientes

Após o deploy:
1. Acesse o menu **Bitdefender**
2. Clique em **Sincronizar** em cada cliente com API Key
3. Volte ao **Dashboard**
4. Clique em **🔄 Atualizar** no card de estatísticas

## Resultado Esperado

O card deve mostrar:
- **Total de Slots**: Soma de todos os `total_slots`
- **Sobre o Limite**: Licenças onde `used_slots > total_slots`
- **Uso Alto**: Licenças com `license_usage_percent >= 90`
- **Taxa de Uso Média**: Média de `license_usage_percent`
- **Licenças Vencendo**: Licenças com `expiration_date` nos próximos 30 dias

## Arquivos Modificados

- ✅ `app_bitdefender_endpoints.php` - Função `getStats()` corrigida
- ✅ `app_bitdefender_sync_client.php` - Sincronização corrigida
- 📝 `CORRECAO_ESTATISTICAS_BITDEFENDER.md` - Esta documentação

## Testes Criados

Para facilitar o debug, foram criados:
- `test_stats_endpoint.php` - Testa o endpoint de estatísticas
- `check_bitdefender_columns.php` - Verifica colunas da tabela

Execute-os diretamente no navegador para debug:
- `https://dashlicencas.macip.com.br/test_stats_endpoint.php`
- `https://dashlicencas.macip.com.br/check_bitdefender_columns.php`
