# 🚀 Deploy Agora - Passo a Passo

## ✅ Pré-requisitos

- [x] Código pronto
- [x] Chaves geradas
- [x] Dockerfile criado
- [x] Easypanel configurado

---

## 📦 Passo 1: Commit e Push

```bash
# Adicionar todos os arquivos
git add .

# Commit
git commit -m "feat: backend Node.js completo - estatísticas + Docker + deploy"

# Push para GitHub
git push origin main
```

---

## 🐳 Passo 2: Configurar no Easypanel

### 2.1 Criar Serviço

1. Acessar: https://easypanel.macip.com.br
2. Selecionar projeto: **sistema**
3. Clicar em **"+ Serviço"**
4. Selecionar **"GitHub"**
5. Escolher repositório: **dashlicencas**
6. Nome do serviço: **dashlicencas-backend**

### 2.2 Configurar Build

**Build Settings:**
- **Dockerfile Path**: `backend/Dockerfile`
- **Context**: `backend/`
- **Branch**: `main`
- **Auto Deploy**: ✅ Ativado

### 2.3 Adicionar Variáveis de Ambiente

Copiar e colar no campo "Environment Variables":

```env
NODE_ENV=production
PORT=3001
API_PREFIX=/api/v1
DB_HOST=sistema_mysql
DB_PORT=3306
DB_USER=mysql
DB_PASSWORD=v3n6jxpe2qmky582gb3s
DB_NAME=faceso56_dashlicencas
JWT_SECRET=ac37484837f3cddcbb3674391be7d0ebb69eb155f23b932bf87bc3807279b5e62a32439bd1f2d2d5939ec32389cb94883b64aa3b1456a8d49fe364872a4379f7
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CRON_SECRET_TOKEN=a036f4146482d8ee63093fae67318a3809b105815c3354f49917c9649329e45b
ENCRYPTION_KEY=ca043add73ede2a40b3a51e99d1debf5257c129a11eb5fa1f01e458476ae387c
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_SECURE=tls
COMPANY_NAME=Macip Tecnologia
NOTIFICATION_EMAIL_FROM=suporte@macip.com.br
CORS_ORIGIN=https://dashlicencas.macip.com.br,https://sistema-dashlicencas.ku83to.easypanel.host
```

### 2.4 Configurar Porta

- **Port**: `3001`
- **Protocol**: `HTTP`

### 2.5 Configurar Domínio

**Opção 1: Usar domínio existente com path**
- Domínio: `dashlicencas.macip.com.br`
- Path: `/api`
- Rewrite: `/api` → `/`

**Opção 2: Criar subdomínio (recomendado)**
- Domínio: `api.dashlicencas.macip.com.br`
- SSL: Automático

### 2.6 Deploy

1. Clicar em **"Deploy"**
2. Aguardar build (2-3 minutos)
3. Acompanhar logs

---

## 🔍 Passo 3: Verificar Deploy

### 3.1 Health Check

```bash
# Testar health check
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

### 3.2 Testar Login

```bash
# Fazer login
curl -X POST https://api.dashlicencas.macip.com.br/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

**Copiar o token da resposta!**

### 3.3 Testar Estatísticas

```bash
# Substituir SEU_TOKEN pelo token obtido no login
curl https://api.dashlicencas.macip.com.br/api/v1/bitdefender/stats \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3.4 Testar Alertas

```bash
curl https://api.dashlicencas.macip.com.br/api/v1/bitdefender/alerts \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🎨 Passo 4: Atualizar Frontend

### 4.1 Atualizar apiClient.ts

Editar `src/lib/apiClient.ts`:

```typescript
import axios from 'axios';

// URL base da API
const API_BASE_URL = import.meta.env.PROD
  ? 'https://api.dashlicencas.macip.com.br/api/v1'
  : 'http://localhost:3001/api/v1';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Função de login
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data.data;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
}

// Função de logout
export async function logout() {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Obter usuário autenticado
export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data.data;
}
```

### 4.2 Criar .env.production

Criar arquivo `.env.production` na raiz do frontend:

```env
VITE_API_URL=https://api.dashlicencas.macip.com.br/api/v1
```

### 4.3 Commit e Push

```bash
git add .
git commit -m "feat: integração com backend Node.js"
git push origin main
```

O Easypanel fará deploy automático do frontend!

---

## ✅ Passo 5: Testar Integração

### 5.1 Acessar Frontend

```
https://dashlicencas.macip.com.br
```

### 5.2 Fazer Login

- Email: `admin@example.com`
- Senha: `senha123`

### 5.3 Verificar Dashboard

- Estatísticas devem carregar
- Alertas devem aparecer
- Tabelas devem funcionar

---

## 🐛 Troubleshooting

### Erro: Build falhou

**Solução:**
1. Ver logs no Easypanel
2. Verificar se `backend/Dockerfile` existe
3. Verificar se `package.json` está correto

### Erro: Cannot connect to database

**Solução:**
1. Verificar se MySQL está rodando
2. Verificar variáveis de ambiente
3. Verificar se `DB_HOST=sistema_mysql` está correto

### Erro: CORS blocked

**Solução:**
1. Adicionar domínio em `CORS_ORIGIN`
2. Verificar se HTTPS está ativo
3. Reiniciar serviço

### Erro: 502 Bad Gateway

**Solução:**
1. Verificar logs do serviço
2. Verificar se porta 3001 está correta
3. Verificar health check
4. Reiniciar serviço

---

## 📊 Checklist Final

- [ ] Código commitado e pushed
- [ ] Serviço criado no Easypanel
- [ ] Variáveis de ambiente adicionadas
- [ ] Dockerfile configurado
- [ ] Porta configurada (3001)
- [ ] Domínio configurado
- [ ] Deploy realizado
- [ ] Health check OK
- [ ] Login testado
- [ ] Estatísticas testadas
- [ ] Frontend atualizado
- [ ] Frontend deployado
- [ ] Integração testada
- [ ] Tudo funcionando! 🎉

---

## 🎉 Sucesso!

Se todos os testes passaram, você tem:

- ✅ Backend Node.js rodando em produção
- ✅ API funcionando com JWT
- ✅ Estatísticas e alertas ativos
- ✅ Frontend integrado
- ✅ Deploy automático configurado

**Parabéns! 🚀**

---

## 📝 Próximos Passos

1. Monitorar logs por alguns dias
2. Migrar outros módulos (FortiGate, Office 365, Gmail)
3. Implementar testes automatizados
4. Adicionar rate limiting
5. Implementar cache

---

**Data**: 28/04/2026  
**Status**: Pronto para deploy! 🚀  
**Tempo estimado**: 30-45 minutos
