# 🔧 Corrigir Estatísticas Bitdefender API

## 🚨 Problema

O card "Estatísticas Bitdefender API" está mostrando "Nenhum endpoint sincronizado" e há erros no console.

**Causa**: A tabela `bitdefender_endpoints` está vazia porque os clientes ainda não foram sincronizados com a API do Bitdefender.

---

## ✅ Solução

### Passo 1: Verificar se a Tabela Existe

Execute no **phpMyAdmin**:

```sql
-- Verificar se a tabela existe
SHOW TABLES LIKE 'bitdefender_endpoints';

-- Ver estrutura
DESCRIBE bitdefender_endpoints;

-- Contar endpoints
SELECT COUNT(*) as total FROM bitdefender_endpoints;
```

Se a tabela não existir, execute o script de upgrade:
- `db_complete_upgrade.sql` ou
- `db_complete_upgrade_safe.sql`

---

### Passo 2: Verificar Clientes com API Configurada

Execute no **phpMyAdmin**:

```sql
SELECT 
    id,
    company,
    CASE 
        WHEN client_api_key IS NOT NULL AND client_api_key != '' THEN 'Sim'
        ELSE 'Não'
    END as tem_api_key,
    client_access_url
FROM bitdefender_licenses
WHERE client_api_key IS NOT NULL AND client_api_key != '';
```

**Resultado esperado**: Lista de clientes que têm API Key configurada.

Se nenhum cliente aparecer, você precisa configurar a API Key para pelo menos um cliente.

---

### Passo 3: Sincronizar Endpoints

Há 3 formas de sincronizar:

#### Opção A: Pelo Dashboard (Recomendado)

1. No dashboard, vá no card "Estatísticas Bitdefender API"
2. Clique no botão **"📡 Sincronizar Todos os Clientes"**
3. Aguarde a sincronização (pode levar alguns segundos)
4. Clique em **"🔄 Atualizar"** para ver os dados

#### Opção B: Pela Tabela Bitdefender

1. Vá na página **Bitdefender**
2. Clique no cliente que tem API configurada
3. Clique em **"Sincronizar"** ou **"Sync"**
4. Aguarde a sincronização
5. Volte ao dashboard

#### Opção C: Via API Diretamente

Abra o console do navegador (F12) e execute:

```javascript
// Sincronizar todos os clientes
fetch('/app_bitdefender_endpoints.php?action=sync')
  .then(r => r.json())
  .then(data => console.log('Resultado:', data));

// OU sincronizar um cliente específico (substitua 1 pelo ID do cliente)
fetch('/app_bitdefender_endpoints.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_id: 1 })
})
  .then(r => r.json())
  .then(data => console.log('Resultado:', data));
```

---

### Passo 4: Verificar se Funcionou

Execute no **phpMyAdmin**:

```sql
-- Ver endpoints sincronizados
SELECT 
    e.id,
    e.name,
    e.ip_address,
    e.protection_status,
    e.last_sync,
    b.company as cliente
FROM bitdefender_endpoints e
LEFT JOIN bitdefender_licenses b ON e.client_id = b.id
ORDER BY e.last_sync DESC
LIMIT 10;

-- Ver estatísticas
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN protection_status = 'protected' THEN 1 ELSE 0 END) as protegidos,
    SUM(CASE WHEN protection_status = 'at_risk' THEN 1 ELSE 0 END) as em_risco,
    SUM(CASE WHEN protection_status = 'offline' THEN 1 ELSE 0 END) as offline
FROM bitdefender_endpoints;
```

Se aparecerem dados, a sincronização funcionou! ✅

---

## 🔍 Troubleshooting

### Erro: "Cliente não possui API Key configurada"

**Solução**: Configure a API Key do cliente:

1. Vá na página **Bitdefender**
2. Clique em **Editar** no cliente
3. Preencha os campos:
   - **API Key**: Chave da API Bitdefender
   - **Access URL**: `https://cloud.gravityzone.bitdefender.com/api` (padrão)
4. Salve

### Erro: "Resposta inválida da API Bitdefender"

**Possíveis causas**:
- API Key incorreta
- Access URL incorreta
- Firewall bloqueando a conexão
- API Bitdefender fora do ar

**Solução**:
1. Verifique se a API Key está correta
2. Teste a conexão manualmente:

```bash
curl -X POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/getEndpointsList \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'SUA_API_KEY:' | base64)" \
  -d '{"params":{"perPage":10,"page":1},"jsonrpc":"2.0","method":"getEndpointsList","id":"1"}'
```

### Erro: "Timeout" ou "Connection refused"

**Causa**: Servidor não consegue acessar a API Bitdefender

**Solução**:
1. Verifique se o servidor tem acesso à internet
2. Verifique se há firewall bloqueando
3. Teste com `curl` no servidor:

```bash
curl -I https://cloud.gravityzone.bitdefender.com
```

### Card continua vazio após sincronização

**Solução**:
1. Limpe o cache do navegador (Ctrl+F5)
2. Abra o console (F12) e veja se há erros
3. Clique em **"🔄 Atualizar"** no card
4. Verifique se há dados no banco:

```sql
SELECT COUNT(*) FROM bitdefender_endpoints;
```

---

## 📊 Como Deve Ficar

Após a sincronização bem-sucedida, o card deve mostrar:

```
┌─────────────────────────────────────────────────────────┐
│ Estatísticas Bitdefender API                            │
│ Dados em tempo real via API                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Endpoints Protegidos: 45                                │
│ Em Risco: 2                                             │
│ Offline: 3                                              │
│ Taxa de Proteção: 90%                                   │
│                                                         │
│ [Gráfico de ameaças bloqueadas]                         │
│ [Top 5 ameaças]                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Resumo Rápido

1. **Verificar** se a tabela `bitdefender_endpoints` existe
2. **Verificar** se há clientes com API Key configurada
3. **Sincronizar** clicando no botão "📡 Sincronizar Todos os Clientes"
4. **Atualizar** clicando no botão "🔄 Atualizar"
5. **Verificar** se os dados aparecem no card

---

## 📝 Scripts Úteis

Arquivo criado: `verificar_endpoints_bitdefender.sql`

Execute este arquivo no phpMyAdmin para fazer todas as verificações de uma vez.

---

**Última atualização**: 28/04/2026  
**Status**: Aguardando sincronização dos endpoints
