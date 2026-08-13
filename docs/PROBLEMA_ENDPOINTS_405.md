# 🐛 PROBLEMA: Erro 405 nos Endpoints Bitdefender

## ❌ ERRO IDENTIFICADO

### Mensagens de Erro no Console
```
GET https://dashlicencas.macip.com.br/app_bitdefender_license_usage.php?action=alerts 
405 (Method Not Allowed)

GET https://dashlicencas.macip.com.br/app_bitdefender_endpoints.php?action=stats 
405 (Method Not Allowed)
```

### Causa Provável
**Arquivos PHP não estão no servidor** ou **não foram deployados corretamente** pelo Easypanel.

## 🔍 DIAGNÓSTICO

### Arquivos Afetados
1. `app_bitdefender_license_usage.php` - Endpoint de uso de licença
2. `app_bitdefender_endpoints.php` - Endpoint de estatísticas de endpoints

### Status Local vs Servidor
| Arquivo | Local | Repositório | Servidor |
|---------|-------|-------------|----------|
| `app_bitdefender_license_usage.php` | ✅ Existe | ✅ Commitado | ❓ Desconhecido |
| `app_bitdefender_endpoints.php` | ✅ Existe | ✅ Commitado | ❓ Desconhecido |

## 🛠️ SOLUÇÃO TEMPORÁRIA APLICADA

### 1. Card de Alertas Desabilitado
**Arquivo:** `src/pages/DashboardHome.tsx`
```tsx
{/* License Usage Alerts - Temporariamente desabilitado até deploy */}
{/* <LicenseUsageAlerts /> */}
```

### 2. Tratamento de Erro no BitdefenderAPIStats
**Arquivo:** `src/components/dashboard/BitdefenderAPIStats.tsx`
```typescript
try {
  const data = await apiClient.endpoints.stats();
  // ... processar dados
} catch (endpointError) {
  console.warn('Endpoint de estatísticas não disponível:', endpointError);
  setHasData(false); // Não quebra o dashboard
}
```

### 3. Scripts de Debug Criados
- `verificar_arquivos_servidor.php` - Verifica se arquivos existem no servidor
- `test_endpoints.php` - Testa endpoints e autenticação

## 📋 PASSOS PARA RESOLVER

### 1. Aguardar Deploy do Easypanel
O Easypanel deve fazer o deploy automático do GitHub. Aguarde alguns minutos.

### 2. Verificar se Arquivos Existem no Servidor
Acesse no navegador:
```
https://dashlicencas.macip.com.br/verificar_arquivos_servidor.php
```

**Resposta Esperada:**
```json
{
  "servidor": "dashlicencas.macip.com.br",
  "diretorio": "/app",
  "arquivos": {
    "app_bitdefender.php": {
      "existe": true,
      "legivel": true,
      "tamanho": 9360
    },
    "app_bitdefender_endpoints.php": {
      "existe": true,  // ← Deve ser true
      "legivel": true,
      "tamanho": 11050
    },
    "app_bitdefender_license_usage.php": {
      "existe": true,  // ← Deve ser true
      "legivel": true,
      "tamanho": 11930
    }
  }
}
```

### 3. Testar Endpoints
Acesse no navegador:
```
https://dashlicencas.macip.com.br/test_endpoints.php
```

**Resposta Esperada:**
```json
{
  "app_bitdefender_license_usage.php": {
    "exists": true,
    "readable": true,
    "size": 11930
  },
  "app_bitdefender_endpoints.php": {
    "exists": true,
    "readable": true,
    "size": 11050
  },
  "session": {
    "started": true,
    "authenticated": true
  },
  "database": {
    "connected": true,
    "bitdefender_licenses_count": 5
  }
}
```

### 4. Se Arquivos Existirem, Reabilitar Cards

#### 4.1. Reabilitar LicenseUsageAlerts
**Arquivo:** `src/pages/DashboardHome.tsx`
```tsx
// Remover comentário:
<LicenseUsageAlerts />
```

#### 4.2. Fazer Build e Deploy
```bash
npm run build
git add .
git commit -m "✅ Reabilitar cards após confirmar deploy dos endpoints"
git push
```

### 5. Se Arquivos NÃO Existirem

#### Opção A: Deploy Manual via Easypanel
1. Acessar painel do Easypanel
2. Ir em "Deploy" → "Redeploy"
3. Aguardar conclusão

#### Opção B: Upload Manual via FTP/SSH
1. Conectar via FTP ou SSH
2. Fazer upload dos arquivos:
   - `app_bitdefender_license_usage.php`
   - `app_bitdefender_endpoints.php`
3. Verificar permissões (644 ou 755)

#### Opção C: Verificar .gitignore
Verificar se arquivos não estão sendo ignorados:
```bash
git check-ignore app_bitdefender_license_usage.php
git check-ignore app_bitdefender_endpoints.php
```

Se retornar algo, remover do `.gitignore`.

## 🎯 RESULTADO ESPERADO

### Após Resolver
1. ✅ Endpoint `app_bitdefender_license_usage.php` responde corretamente
2. ✅ Endpoint `app_bitdefender_endpoints.php` responde corretamente
3. ✅ Card "Alertas de Uso de Licença" funciona
4. ✅ Card "Estatísticas Bitdefender API" funciona
5. ✅ Dashboard sem erros no console

### Fluxo Correto
```
1. Usuário acessa dashboard
   ↓
2. Frontend chama endpoints:
   - /app_bitdefender_license_usage.php?action=alerts
   - /app_bitdefender_endpoints.php?action=stats
   ↓
3. Endpoints retornam JSON com dados
   ↓
4. Cards exibem informações corretas
   ↓
5. ✅ Dashboard funcional
```

## 📝 CHECKLIST DE VERIFICAÇÃO

- [ ] Aguardar 5-10 minutos após push
- [ ] Acessar `verificar_arquivos_servidor.php`
- [ ] Verificar se arquivos existem no servidor
- [ ] Acessar `test_endpoints.php`
- [ ] Verificar se endpoints respondem
- [ ] Se OK, reabilitar cards no código
- [ ] Fazer build e deploy
- [ ] Testar dashboard
- [ ] Remover scripts de debug

## 🚨 SE PROBLEMA PERSISTIR

### Verificar Logs do Easypanel
1. Acessar painel do Easypanel
2. Ir em "Logs"
3. Procurar por erros de deploy

### Verificar Logs do PHP
1. Acessar via SSH
2. Verificar logs: `tail -f /var/log/php-fpm/error.log`

### Contatar Suporte
Se nada funcionar, pode ser problema de configuração do servidor.

## ✅ STATUS ATUAL
- **Dashboard:** ✅ Funcional (sem cards de uso de licença)
- **Endpoints:** ❓ Aguardando verificação no servidor
- **Solução:** 🔄 Temporária até confirmar deploy

**PRÓXIMO PASSO:** Acessar `verificar_arquivos_servidor.php` após deploy!