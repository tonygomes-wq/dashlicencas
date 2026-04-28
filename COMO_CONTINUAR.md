# 🚀 Como Continuar a Migração

## ✅ O Que Já Está Pronto

A estrutura base do backend Node.js está **100% completa**:

- ✅ Autenticação JWT
- ✅ CRUD Bitdefender completo
- ✅ Segurança (Helmet, CORS, Bcrypt)
- ✅ Transformação automática de dados
- ✅ Error handling global
- ✅ Documentação completa

## 🎯 Próximo Passo: Testar Localmente

### 1. Iniciar MySQL

Certifique-se de que o MySQL está rodando:

```bash
# Windows (XAMPP)
# Iniciar XAMPP Control Panel e startar MySQL

# Ou verificar se está rodando
mysql -u root -p
```

### 2. Configurar .env

Edite `backend/.env` com suas credenciais:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=dashlicencas
```

### 3. Iniciar Backend

```bash
cd backend
npm run dev
```

Você deve ver:

```
🔍 Validando configurações...
🔌 Testando conexão com banco de dados...
✅ Conexão com banco de dados estabelecida

🚀 ========================================
🚀 Servidor rodando na porta 3001
🚀 Ambiente: development
🚀 API: http://localhost:3001/api/v1
🚀 Health: http://localhost:3001/health
🚀 ========================================
```

### 4. Testar Endpoints

#### Opção A: Usar REST Client (VS Code)

1. Instalar extensão "REST Client" no VS Code
2. Abrir arquivo `backend/test-api.http`
3. Clicar em "Send Request" acima de cada requisição

#### Opção B: Usar cURL

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'

# Copiar o token da resposta e usar nos próximos comandos

# Listar licenças
curl http://localhost:3001/api/v1/bitdefender \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Opção C: Usar Postman/Insomnia

Importar as requisições do arquivo `backend/test-api.http`

## 📊 Próximos Endpoints a Criar

### 1. Endpoint de Estatísticas

Criar `backend/src/controllers/bitdefender-stats.controller.ts`:

```typescript
export async function getStats(req: Request, res: Response) {
  // Total de licenças
  const total = await queryOne('SELECT COUNT(*) as count FROM bitdefender_licenses');
  
  // Licenças vencidas
  const expired = await queryOne(`
    SELECT COUNT(*) as count 
    FROM bitdefender_licenses 
    WHERE expiration_date < CURDATE()
  `);
  
  // Licenças vencendo em 30 dias
  const expiring = await queryOne(`
    SELECT COUNT(*) as count 
    FROM bitdefender_licenses 
    WHERE expiration_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  `);
  
  res.json({
    success: true,
    data: {
      total: total.count,
      expired: expired.count,
      expiring: expiring.count
    }
  });
}
```

Adicionar rota em `backend/src/routes/bitdefender.routes.ts`:

```typescript
router.get('/stats', bitdefenderStatsController.getStats);
```

### 2. Endpoint de Uso de Licença

Criar `backend/src/controllers/bitdefender-usage.controller.ts`:

```typescript
export async function getUsageAlerts(req: Request, res: Response) {
  const alerts = await query(`
    SELECT * FROM bitdefender_licenses
    WHERE license_usage_alert = 1
    ORDER BY license_usage_percent DESC
  `);
  
  res.json({
    success: true,
    data: transformToCamelCase(alerts)
  });
}
```

### 3. Endpoint de Sincronização

Criar `backend/src/services/bitdefender-api.service.ts`:

```typescript
export async function syncLicenseUsage(licenseId: number) {
  // Buscar dados da licença
  const license = await queryOne('SELECT * FROM bitdefender_licenses WHERE id = ?', [licenseId]);
  
  if (!license.client_api_key || !license.client_access_url) {
    throw new Error('API não configurada');
  }
  
  // Chamar API Bitdefender
  const response = await fetch(`${license.client_access_url}/v1.0/jsonrpc/licensing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(license.client_api_key).toString('base64')}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'getLicenseInfo',
      id: 1
    })
  });
  
  const data = await response.json();
  
  // Atualizar banco
  await query(`
    UPDATE bitdefender_licenses 
    SET used_slots = ?, 
        total_slots = ?,
        license_usage_percent = ?,
        license_usage_last_sync = NOW()
    WHERE id = ?
  `, [data.usedSlots, data.totalSlots, (data.usedSlots / data.totalSlots) * 100, licenseId]);
}
```

## 🎨 Atualizar Frontend

### 1. Modificar apiClient.ts

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

// Atualizar após login
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  const { token, user } = response.data.data;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return { token, user };
}
```

### 2. Testar Integração

1. Iniciar backend: `cd backend && npm run dev`
2. Iniciar frontend: `npm run dev`
3. Fazer login
4. Verificar se dados carregam corretamente

## 🐳 Deploy no Easypanel

### 1. Criar Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Build TypeScript
RUN npm run build

# Expor porta
EXPOSE 3001

# Iniciar
CMD ["npm", "start"]
```

### 2. Configurar no Easypanel

1. **Criar novo serviço**
   - Nome: `dashlicencas-backend`
   - Tipo: Docker
   - Repositório: Seu GitHub

2. **Configurar Build**
   - Dockerfile: `backend/Dockerfile`
   - Context: `backend/`

3. **Variáveis de Ambiente**
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=seu_mysql_host
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=dashlicencas
   JWT_SECRET=seu_secret_super_seguro_mude_isso
   CORS_ORIGIN=https://dashlicencas.macip.com.br
   ```

4. **Configurar Domínio**
   - Domínio: `api.dashlicencas.macip.com.br`
   - SSL: Automático (Let's Encrypt)

5. **Deploy**
   - Push para GitHub
   - Easypanel faz deploy automático

### 3. Atualizar Frontend

Editar `.env.production`:

```env
VITE_API_URL=https://api.dashlicencas.macip.com.br/api/v1
```

## 📝 Checklist de Deploy

- [ ] Backend rodando localmente
- [ ] Todos os endpoints testados
- [ ] Frontend integrado e testado
- [ ] Dockerfile criado
- [ ] Variáveis de ambiente configuradas
- [ ] Serviço criado no Easypanel
- [ ] Domínio configurado
- [ ] SSL ativo
- [ ] Deploy realizado
- [ ] Testes em produção
- [ ] Monitoramento ativo

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar logs
cd backend
npm run dev

# Verificar MySQL
mysql -u root -p

# Verificar .env
cat .env
```

### Frontend não conecta

```bash
# Verificar CORS no backend
CORS_ORIGIN=http://localhost:5173

# Verificar URL no frontend
console.log(import.meta.env.VITE_API_URL)
```

### Erro 401 Unauthorized

```bash
# Verificar token
localStorage.getItem('token')

# Fazer login novamente
```

## 📚 Documentação

- ✅ `backend/README.md` - Documentação do backend
- ✅ `GUIA_MIGRACAO_NODEJS.md` - Guia completo
- ✅ `RESUMO_MIGRACAO.md` - Resumo do que foi feito
- ✅ `CHECKLIST_MIGRACAO.md` - Checklist de progresso
- ✅ `backend/test-api.http` - Testes HTTP

## 💡 Dicas

1. **Sempre testar localmente antes de fazer deploy**
2. **Fazer commits pequenos e frequentes**
3. **Documentar mudanças importantes**
4. **Manter PHP rodando em paralelo até migração completa**
5. **Fazer backup do banco antes de mudanças grandes**

## 🎯 Ordem Recomendada

1. ✅ Testar backend localmente
2. ⏳ Criar endpoints de estatísticas
3. ⏳ Criar endpoint de sincronização
4. ⏳ Atualizar frontend
5. ⏳ Testar integração completa
6. ⏳ Fazer deploy no Easypanel
7. ⏳ Migrar outros módulos (FortiGate, Office 365, Gmail)
8. ⏳ Desativar endpoints PHP antigos

## 🚀 Comandos Úteis

```bash
# Backend
cd backend
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Produção

# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build

# Git
git add .
git commit -m "feat: migração backend Node.js"
git push origin main

# Docker (local)
docker build -t dashlicencas-backend ./backend
docker run -p 3001:3001 --env-file backend/.env dashlicencas-backend
```

---

**Boa sorte com a migração! 🚀**

Se tiver dúvidas, consulte os documentos de referência ou entre em contato.
