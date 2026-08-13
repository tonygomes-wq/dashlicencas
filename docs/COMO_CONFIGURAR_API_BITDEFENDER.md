# 🔧 Como Configurar API Bitdefender Corretamente

## 🚨 Problema Atual

A API Bitdefender está **temporariamente desabilitada** porque:
- ❌ A URL da API está incorreta (retorna HTTP 404)
- ❌ Nenhum método da API está disponível
- ❌ Pode ser necessário URL específica para cada cliente

---

## 📋 Como Obter a URL Correta

### Opção 1: Verificar no Painel Bitdefender

1. **Acesse o Bitdefender GravityZone**
   ```
   https://cloud.gravityzone.bitdefender.com
   ```

2. **Vá em API Keys**
   - Clique no seu nome (canto superior direito)
   - Clique em "API Keys" ou "My Account > API Keys"

3. **Verifique a URL da API**
   - Ao criar ou visualizar uma API Key, deve aparecer a **URL base da API**
   - Exemplo: `https://cloudgz-<region>.gravityzone.bitdefender.com/api/v1.0/jsonrpc/`

4. **Copie a URL completa**
   - Anote a URL exata mostrada no painel

### Opção 2: Contatar Suporte Bitdefender

Se não encontrar a URL no painel:

1. **Abra um ticket** no suporte Bitdefender
2. **Pergunte**: "Qual é a URL base da API para minha conta?"
3. **Informe**: Você precisa acessar a API via JSON-RPC

---

## 🔧 Como Atualizar a URL no Sistema

### Passo 1: Atualizar no Banco de Dados

Execute no **phpMyAdmin**:

```sql
-- Atualizar URL para todos os clientes
UPDATE bitdefender_licenses 
SET client_access_url = 'SUA_URL_AQUI'
WHERE client_api_key IS NOT NULL;

-- Exemplo com URL correta:
-- UPDATE bitdefender_licenses 
-- SET client_access_url = 'https://cloudgz-us.gravityzone.bitdefender.com/api/v1.0/jsonrpc/'
-- WHERE client_api_key IS NOT NULL;
```

### Passo 2: Reabilitar no Frontend

Edite o arquivo: `src/components/dashboard/BitdefenderAPIStats.tsx`

Encontre esta linha:
```typescript
const API_DISABLED = true;
```

Mude para:
```typescript
const API_DISABLED = false;
```

### Passo 3: Testar

1. Salve o arquivo
2. Recarregue o dashboard
3. Clique em "📡 Sincronizar Todos os Clientes"
4. Verifique se funciona

---

## 🧪 Testar URL Manualmente

Antes de atualizar no sistema, teste a URL:

```bash
# Substitua:
# - YOUR_URL pela URL da API
# - YOUR_API_KEY pela sua API Key

curl -X POST YOUR_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'YOUR_API_KEY:' | base64)" \
  -d '{
    "params": {},
    "jsonrpc": "2.0",
    "method": "getApiKeyDetails",
    "id": "1"
  }'
```

**Resultado esperado**: JSON com informações da API Key

---

## 📊 URLs Comuns do Bitdefender GravityZone

Dependendo da sua região/conta, a URL pode ser:

### Cloud (Regiões)
```
https://cloudgz-us.gravityzone.bitdefender.com/api/v1.0/jsonrpc/
https://cloudgz-eu.gravityzone.bitdefender.com/api/v1.0/jsonrpc/
https://cloudgz-ap.gravityzone.bitdefender.com/api/v1.0/jsonrpc/
```

### MSP (Managed Service Provider)
```
https://msp.gravityzone.bitdefender.com/api/v1.0/jsonrpc/
```

### On-Premise
```
https://seu-servidor.com/api/v1.0/jsonrpc/
```

---

## 🎯 Alternativa: Usar Apenas Gerenciamento Manual

Se a API for muito complexa de configurar, você pode:

1. **Remover as API Keys** dos clientes
2. **Gerenciar licenças manualmente** (funciona perfeitamente)
3. **O card de estatísticas** ficará oculto
4. **Todas as outras funcionalidades** continuam funcionando

Para remover as API Keys:

```sql
-- Remover todas as API Keys
UPDATE bitdefender_licenses 
SET client_api_key = NULL, 
    client_access_url = NULL;
```

---

## 📝 Resumo

**Status Atual**: API desabilitada temporariamente

**Para reabilitar**:
1. ✅ Obter URL correta da API Bitdefender
2. ✅ Atualizar no banco de dados
3. ✅ Mudar `API_DISABLED = false` no código
4. ✅ Testar sincronização

**Alternativa**: Usar apenas gerenciamento manual (sem API)

---

## 🆘 Precisa de Ajuda?

Se conseguir a URL correta da API, me avise que eu te ajudo a configurar!

**Informações necessárias**:
- URL base da API Bitdefender
- Região da sua conta (US, EU, AP)
- Tipo de conta (Cloud, MSP, On-Premise)

---

**Última atualização**: 28/04/2026  
**Status**: API temporariamente desabilitada
