# 🧪 Testar API Bitdefender

## 🚨 Problema Identificado

Todos os 15 clientes retornaram erro: **"Resposta inválida da API Bitdefender"**

Isso pode ser causado por:
1. ❌ API Keys incorretas ou expiradas
2. ❌ URL da API incorreta
3. ❌ Formato da requisição incorreto
4. ❌ Servidor sem acesso à internet
5. ❌ Firewall bloqueando

---

## 🧪 Teste 1: Verificar API de Um Cliente

Abra no navegador:

```
https://dashlicencas.macip.com.br/test_bitdefender_api.php?client_id=3
```

**Substitua `3` pelo ID de um cliente que você sabe que tem API Key válida.**

### IDs dos Clientes com API:
- 3: AGROPLAY
- 4: AMARAL VASCONCELLOS
- 5: CARAGA PESADA
- 6: COCRIAGRO
- 7: COMPERFORT
- 8: CONSULTOMAQ
- 12: DIALLI
- 13: DISMAFE
- 14: EAGLEFLEX
- 15: FOCUS
- 18: HIDROMAR
- 20: HYDRONLUBZ
- 25: MAGLON

---

## 📊 Resultado Esperado

Se a API estiver funcionando, você verá:

```json
{
  "step": 1,
  "message": "Cliente encontrado",
  "client": "AGROPLAY",
  "access_url": "https://cloud.gravityzone.bitdefender.com/api",
  "api_key_length": 40,
  "api_key_preview": "abc123..."
}

{
  "step": 2,
  "message": "Preparando requisição",
  "url": "https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/getEndpointsList",
  "payload": {...}
}

{
  "step": 3,
  "message": "Resposta recebida",
  "http_code": 200,
  "curl_error": null,
  "response_length": 1234,
  "response_preview": "..."
}

{
  "step": 4,
  "message": "JSON decodificado com sucesso",
  "has_result": true,
  "has_error": false,
  "decoded": {...}
}

{
  "step": 5,
  "message": "Endpoints encontrados",
  "total_endpoints": 5,
  "first_endpoint": {...}
}
```

---

## 🐛 Possíveis Erros

### Erro 1: HTTP Code 401 (Unauthorized)
**Causa**: API Key incorreta

**Solução**:
1. Vá na página Bitdefender
2. Edite o cliente
3. Verifique se a API Key está correta
4. A API Key deve ter este formato: `5a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t`

### Erro 2: HTTP Code 0 ou CURL Error
**Causa**: Servidor não consegue acessar a API

**Solução**: Verifique se o servidor tem acesso à internet

### Erro 3: "Erro ao decodificar JSON"
**Causa**: API retornou HTML ao invés de JSON

**Solução**: Verifique a URL da API

### Erro 4: "API retornou erro"
**Causa**: API Key válida mas sem permissões

**Solução**: Verifique as permissões da API Key no Bitdefender GravityZone

---

## 🔧 Teste 2: Verificar API Keys no Banco

Execute no **phpMyAdmin**:

```sql
-- Ver API Keys dos clientes
SELECT 
    id,
    company,
    LENGTH(client_api_key) as tamanho_api_key,
    SUBSTRING(client_api_key, 1, 10) as preview_api_key,
    client_access_url
FROM bitdefender_licenses
WHERE client_api_key IS NOT NULL
ORDER BY company;
```

**Verificar**:
- ✅ API Key deve ter entre 30-50 caracteres
- ✅ Não deve ter espaços no início ou fim
- ✅ URL deve ser: `https://cloud.gravityzone.bitdefender.com/api`

---

## 🔧 Teste 3: Testar Manualmente com CURL

Se você tiver acesso SSH ao servidor, teste:

```bash
# Substitua YOUR_API_KEY pela API Key real
curl -X POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/getEndpointsList \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'YOUR_API_KEY:' | base64)" \
  -d '{
    "params": {
      "perPage": 5,
      "page": 1
    },
    "jsonrpc": "2.0",
    "method": "getEndpointsList",
    "id": "1"
  }'
```

---

## 📝 Próximos Passos

1. **Execute o teste**: `test_bitdefender_api.php?client_id=3`
2. **Me envie o resultado** completo
3. **Vou analisar** e corrigir o problema

---

## 🎯 Ação Imediata

**Abra no navegador AGORA**:

```
https://dashlicencas.macip.com.br/test_bitdefender_api.php?client_id=3
```

Copie e cole o resultado completo aqui para eu analisar! 🔍

---

**Arquivo criado**: `test_bitdefender_api.php` - Script de diagnóstico
