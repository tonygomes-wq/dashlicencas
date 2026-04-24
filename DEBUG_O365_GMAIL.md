# Debug: Office 365 e Gmail Não Carregam Dados

## Problema
As tabelas de Office 365 e Gmail mostram linhas com "N/A" ao invés dos dados reais.

## Possíveis Causas

### 1. Banco de Dados Vazio
As tabelas `o365_clients`, `o365_licenses`, `gmail_clients` e `gmail_licenses` podem estar vazias.

**Como verificar:**
```sql
SELECT COUNT(*) FROM o365_clients;
SELECT COUNT(*) FROM o365_licenses;
SELECT COUNT(*) FROM gmail_clients;
SELECT COUNT(*) FROM gmail_licenses;
```

### 2. API Retornando Dados Incorretos
Os endpoints PHP podem estar retornando dados em formato incorreto ou vazio.

**Endpoints a verificar:**
- `/app_o365.php?type=clients`
- `/app_o365.php?type=licenses`
- `/app_gmail.php?type=clients`
- `/app_gmail.php?type=licenses`

### 3. Estrutura de Dados Incompatível
Os dados retornados pela API podem não corresponder à interface TypeScript esperada.

## Debug Adicionado

Foi adicionado um log no console do navegador que mostra quantos registros foram carregados:

```typescript
console.log('📊 Dados carregados:', {
  bitdefender: bitdefenderData?.length || 0,
  fortigate: fortigateData?.length || 0,
  o365Clients: o365ClientsData?.length || 0,
  o365Licenses: o365LicensesData?.length || 0,
  gmailClients: gmailClientsData?.length || 0,
  gmailLicenses: gmailLicensesData?.length || 0,
  hardware: hardwareData?.length || 0
});
```

## Como Investigar

1. **Abra o Console do Navegador** (`F12` → Console)
2. **Recarregue a página** (`Ctrl + Shift + R`)
3. **Procure pelo log** `📊 Dados carregados:`
4. **Verifique os números:**
   - Se `o365Clients: 0` → Não há clientes cadastrados
   - Se `o365Licenses: 0` → Não há licenças cadastradas
   - Se `gmailClients: 0` → Não há clientes cadastrados
   - Se `gmailLicenses: 0` → Não há licenças cadastradas

## Solução Temporária

Se não houver dados no banco, você pode:

1. **Cadastrar clientes manualmente** através do Dashboard antigo (`Dashboard.tsx`)
2. **Importar dados** de um backup
3. **Criar dados de teste** via SQL

### Exemplo de Dados de Teste (SQL)

```sql
-- Inserir cliente O365 de teste
INSERT INTO o365_clients (id, client_name, contact_email, created_at) 
VALUES ('test-client-1', 'Cliente Teste', 'teste@exemplo.com', NOW());

-- Inserir licença O365 de teste
INSERT INTO o365_licenses (client_id, user_email, license_type, renewal_status, created_at) 
VALUES ('test-client-1', 'usuario@exemplo.com', 'Microsoft 365 Business Standard', 'Ativo', NOW());

-- Inserir cliente Gmail de teste
INSERT INTO gmail_clients (id, client_name, contact_email, created_at) 
VALUES ('test-gmail-1', 'Cliente Gmail Teste', 'gmail@exemplo.com', NOW());

-- Inserir licença Gmail de teste
INSERT INTO gmail_licenses (client_id, user_email, license_type, renewal_status, created_at) 
VALUES ('test-gmail-1', 'usuario@gmail.com', 'Google Workspace Business', 'Ativo', NOW());
```

## Próximos Passos

1. ✅ Aguardar deploy no Easypanel
2. ✅ Limpar cache (`Ctrl + Shift + R`)
3. ✅ Abrir console do navegador
4. ✅ Verificar o log `📊 Dados carregados:`
5. ⏳ Reportar os números encontrados
6. ⏳ Decidir se precisa cadastrar dados ou investigar API

---

**Data:** 24/04/2026
**Commit:** `5599dee` - "fix: adicionar cores brancas ao texto das tabelas Bitdefender e Fortigate + debug logs para O365/Gmail"
