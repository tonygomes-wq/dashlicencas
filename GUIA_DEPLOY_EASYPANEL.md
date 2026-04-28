# 🚀 Guia de Deploy no Easypanel

## 📋 Pré-requisitos

- ✅ Conta no Easypanel
- ✅ Repositório GitHub configurado
- ✅ MySQL rodando no Easypanel
- ✅ Domínio configurado

---

## 🐳 Configuração do Backend

### 1. Criar Serviço no Easypanel

1. Acessar painel do Easypanel
2. Clicar em "+ Serviço"
3. Selecionar "GitHub"
4. Escolher repositório: `dashlicencas`
5. Nome do serviço: `dashlicencas-backend`

### 2. Configurar Build

**Build Settings:**
- **Dockerfile Path**: `backend/Dockerfile`
- **Context**: `backend/`
- **Branch**: `main`

### 3. Configurar Variáveis de Ambiente

Adicionar as seguintes variáveis em "Environment Variables":

```env
# Ambiente
NODE_ENV=production

# Servidor
PORT=3001
API_PREFIX=/api/v1

# Banco de Dados
DB_HOST=sistema_mysql
DB_PORT=3306
DB_USER=mysql
DB_PASSWORD=v3n6jxpe2qmky582gb3s
DB_NAME=faceso56_dashlicencas

# JWT
JWT_SECRET=ac37484837f3cddcbb3674391be7d0ebb69eb155f23b932bf87bc3807279b5e62a32439bd1f2d2d5939ec32389cb94883b64aa3b1456a8d49fe364872a4379f7
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CRON
CRON_SECRET_TOKEN=a036f4146482d8ee63093fae67318a3809b105815c3354f49917c9649329e45b

# Encryption
ENCRYPTION_KEY=ca043add73ede2a40b3a51e99d1debf5257c129a11eb5fa1f01e458476ae387c

# SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_SECURE=tls

# Aplicação
COMPANY_NAME=Macip Tecnologia
NOTIFICATION_EMAIL_FROM=suporte@macip.com.br

# CORS
CORS_ORIGIN=https://dashlicencas.macip.com.br,https://sistema-dashlicencas.ku83to.easypanel.host
```

### 4. Configurar Porta

- **Port**: `3001`
- **Protocol**: `HTTP`

### 5. Configurar Domínio

**Opção 1: Subdomínio**
- Domínio: `api.dashlicencas.macip.com.br`
- SSL: Automático (Let's Encrypt)

**Opção 2: Path**
- Domínio: `dashlicencas.macip.com.br/api`
- Rewrite: `/api` → `/`

### 6. Deploy

1. Clicar em "Deploy"
2. Aguardar build (2-3 minutos)
3. Verificar logs
4. Testar health check

---

## 🔍 Verificação

### 1. Health Check

```bash
curl https://api.dashlicencas.macip.com.br/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "API está funcionando",
  "timestamp": "2026-04-28T...",
  "environment": "production"
}
```

### 2. Testar Login

```bash
curl -X POST https://api.dashlicencas.macip.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Testar Estatísticas

```bash
curl https://api.dashlicencas.macip.com.br/api/v1/bitdefender/stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🎨 Atualizar Frontend

### 1. Atualizar apiClient.ts

```typescript
// src/lib/apiClient.ts

const API_BASE_URL = import.meta.env.PROD
  ? 'https://api.dashlicencas.macip.com.br/api/v1'
  : 'http://localhost:3001/api/v1';

// Adicionar interceptor para JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Atualizar função de login
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data.data;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
}
```

### 2. Criar .env.production

```env
VITE_API_URL=https://api.dashlicencas.macip.com.br/api/v1
```

### 3. Build e Deploy Frontend

```bash
npm run build
git add .
git commit -m "feat: integração com backend Node.js"
git push origin main
```

---

## 🔄 Deploy Automático

### Configurar Webhook (Opcional)

1. No Easypanel, ir em "Settings" > "Webhooks"
2. Copiar URL do webhook
3. No GitHub, ir em "Settings" > "Webhooks"
4. Adicionar webhook:
   - URL: [URL copiada]
   - Content type: `application/json`
   - Events: `push`

Agora, a cada push no GitHub, o Easypanel fará deploy automático!

---

## 📊 Monitoramento

### Logs

```bash
# Ver logs em tempo real no Easypanel
# Ou via CLI:
easypanel logs dashlicencas-backend --follow
```

### Métricas

No painel do Easypanel, você pode ver:
- CPU usage
- Memory usage
- Network I/O
- Request count

---

## 🐛 Troubleshooting

### Erro: Cannot connect to database

**Solução:**
1. Verificar se MySQL está rodando
2. Verificar credenciais em "Environment Variables"
3. Verificar se `DB_HOST=sistema_mysql` está correto

### Erro: CORS blocked

**Solução:**
1. Adicionar domínio do frontend em `CORS_ORIGIN`
2. Verificar se HTTPS está ativo
3. Reiniciar serviço

### Erro: 502 Bad Gateway

**Solução:**
1. Verificar logs do serviço
2. Verificar se porta 3001 está correta
3. Verificar health check
4. Reiniciar serviço

### Build falha

**Solução:**
1. Verificar logs de build
2. Verificar se `backend/Dockerfile` existe
3. Verificar se `package.json` está correto
4. Limpar cache e fazer rebuild

---

## 🔐 Segurança

### Checklist de Segurança

- ✅ HTTPS ativo (Let's Encrypt)
- ✅ JWT_SECRET forte (128 caracteres)
- ✅ Variáveis de ambiente não commitadas
- ✅ CORS configurado corretamente
- ✅ Helmet ativo (headers de segurança)
- ✅ Rate limiting (implementar futuramente)

### Recomendações

1. **Rotacionar chaves** a cada 6 meses
2. **Monitorar logs** regularmente
3. **Fazer backup** do banco de dados
4. **Atualizar dependências** mensalmente
5. **Implementar rate limiting** em breve

---

## 📝 Checklist de Deploy

- [ ] Backend configurado no Easypanel
- [ ] Variáveis de ambiente adicionadas
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Health check funcionando
- [ ] Login testado
- [ ] Estatísticas testadas
- [ ] Frontend atualizado
- [ ] Frontend deployado
- [ ] Testes em produção
- [ ] Monitoramento ativo
- [ ] Backup configurado

---

## 🎉 Conclusão

Após seguir este guia, você terá:

- ✅ Backend Node.js rodando no Easypanel
- ✅ Deploy automático via GitHub
- ✅ SSL configurado
- ✅ Monitoramento ativo
- ✅ Frontend integrado

**Próximo passo**: Testar tudo em produção e monitorar logs!

---

**Data**: 28/04/2026  
**Status**: Pronto para deploy 🚀
