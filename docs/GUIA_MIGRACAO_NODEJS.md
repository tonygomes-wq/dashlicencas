# 🚀 Guia de Migração: PHP → Node.js + TypeScript

## ✅ Status da Migração

### Fase 1: Estrutura Base (CONCLUÍDA)
- ✅ Configuração TypeScript
- ✅ Configuração do banco de dados MySQL
- ✅ Sistema de autenticação JWT
- ✅ Middleware de autenticação
- ✅ Transformadores snake_case ↔ camelCase
- ✅ CRUD completo Bitdefender
- ✅ Estrutura de rotas e controllers
- ✅ Error handling global
- ✅ Segurança (Helmet, CORS)

### Fase 2: Próximos Passos
- ⏳ Endpoint de estatísticas Bitdefender
- ⏳ Endpoint de uso de licença
- ⏳ Sincronização com API Bitdefender
- ⏳ Migração FortiGate
- ⏳ Migração Office 365
- ⏳ Migração Gmail

## 📁 Estrutura Criada

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Pool MySQL + helpers
│   │   └── env.ts                # Configurações centralizadas
│   ├── controllers/
│   │   ├── auth.controller.ts    # Login, logout, me
│   │   └── bitdefender.controller.ts  # CRUD Bitdefender
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication
│   ├── routes/
│   │   ├── auth.routes.ts        # Rotas de autenticação
│   │   └── bitdefender.routes.ts # Rotas Bitdefender
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   ├── utils/
│   │   └── transformers.ts       # Conversores de dados
│   ├── app.ts                    # Configuração Express
│   └── server.ts                 # Inicialização
├── .env                          # Variáveis de ambiente
├── .env.example                  # Exemplo de configuração
├── .gitignore                    # Arquivos ignorados
├── package.json                  # Dependências
├── tsconfig.json                 # Config TypeScript
└── README.md                     # Documentação
```

## 🔧 Instalação e Configuração

### 1. Instalar Dependências

```bash
cd backend
npm install
```

### 2. Configurar Banco de Dados

Edite `backend/.env` com suas credenciais MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dashlicencas
```

### 3. Configurar JWT Secret

**IMPORTANTE**: Mude o JWT_SECRET em produção!

```env
JWT_SECRET=seu_secret_super_seguro_aqui
```

### 4. Configurar CORS

Adicione o domínio do frontend:

```env
CORS_ORIGIN=http://localhost:5173,https://dashlicencas.macip.com.br
```

### 5. Iniciar Servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm run build
npm start
```

## 🔄 Comparação: PHP vs Node.js

### Autenticação

**PHP (Sessões):**
```php
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    exit;
}
```

**Node.js (JWT):**
```typescript
// Middleware automático
router.use(authenticate);

// Token no header: Authorization: Bearer <token>
```

### CRUD Bitdefender

**PHP:**
```php
// app_bitdefender.php
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET': ...
    case 'POST': ...
}
```

**Node.js:**
```typescript
// Rotas RESTful
router.get('/', bitdefenderController.list);
router.post('/', bitdefenderController.create);
router.put('/:id', bitdefenderController.update);
router.delete('/:id', bitdefenderController.remove);
```

### Conversão de Dados

**PHP:**
```php
// Manual para cada campo
$data['contactPerson'] → $data['contact_person']
```

**Node.js:**
```typescript
// Automático com transformers
const dbData = transformToSnakeCase(data);
const apiData = transformToCamelCase(dbRow);
```

## 🌐 Endpoints Disponíveis

### Base URL
```
http://localhost:3001/api/v1
```

### Autenticação

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "senha123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obter Usuário Autenticado
```http
GET /api/v1/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "isActive": true
  }
}
```

### Bitdefender

#### Listar Licenças
```http
GET /api/v1/bitdefender
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company": "ACIL",
      "licenseKey": "Q3VY4T4-C2E7ZJI",
      "totalLicenses": 10,
      "expirationDate": "2026-06-14",
      "usedSlots": 8,
      "totalSlots": 10,
      "licenseUsagePercent": 80,
      ...
    }
  ]
}
```

#### Criar Licença (Admin)
```http
POST /api/v1/bitdefender
Authorization: Bearer <token>
Content-Type: application/json

{
  "company": "Nova Empresa",
  "licenseKey": "ABC123",
  "totalLicenses": 50,
  "expirationDate": "2027-12-31",
  "renewalStatus": "Ativo"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Atualizar Licença (Admin)
```http
PUT /api/v1/bitdefender/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "totalLicenses": 60,
  "renewalStatus": "Renovado"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Deletar Licença (Admin)
```http
DELETE /api/v1/bitdefender/1
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Licença deletada com sucesso"
}
```

## 🔐 Segurança

### Implementações

1. **JWT Authentication**: Tokens com expiração configurável
2. **Helmet**: Headers de segurança HTTP
3. **CORS**: Controle de origens permitidas
4. **Bcrypt**: Hash de senhas com salt
5. **Role-based Access**: Admin vs User
6. **SQL Injection Protection**: Prepared statements
7. **Error Handling**: Sem exposição de stack traces em produção

### Boas Práticas

- ✅ Senhas nunca retornadas nas respostas
- ✅ Tokens JWT com expiração
- ✅ Validação de entrada de dados
- ✅ HTTPS obrigatório em produção
- ✅ Rate limiting (implementar futuramente)

## 📊 Vantagens da Migração

### Performance
- ✅ **Async/Await**: Operações não-bloqueantes
- ✅ **Connection Pool**: Reutilização de conexões MySQL
- ✅ **Compression**: Respostas comprimidas automaticamente

### Desenvolvimento
- ✅ **TypeScript**: Tipagem estática, menos bugs
- ✅ **Hot Reload**: Mudanças refletem instantaneamente
- ✅ **Modular**: Código organizado em módulos
- ✅ **Testável**: Fácil escrever testes unitários

### Manutenção
- ✅ **Código Limpo**: Separação de responsabilidades
- ✅ **Documentação**: Tipos auto-documentados
- ✅ **Escalável**: Fácil adicionar novos endpoints
- ✅ **Debugging**: Stack traces mais claros

## 🚀 Deploy no Easypanel

### 1. Criar Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Configurar Easypanel

1. Criar novo serviço "Backend API"
2. Conectar ao repositório GitHub
3. Configurar variáveis de ambiente:
   - `NODE_ENV=production`
   - `DB_HOST=<host_mysql>`
   - `DB_PASSWORD=<senha>`
   - `JWT_SECRET=<secret_forte>`
4. Definir porta: 3001
5. Deploy automático no push

### 3. Atualizar Frontend

Editar `src/lib/apiClient.ts`:

```typescript
const API_BASE_URL = import.meta.env.PROD
  ? 'https://api.dashlicencas.macip.com.br/api/v1'
  : 'http://localhost:3001/api/v1';
```

## 📝 Próximos Passos

### Imediato
1. ✅ Testar endpoints localmente
2. ⏳ Criar endpoint de estatísticas
3. ⏳ Criar endpoint de sincronização API
4. ⏳ Atualizar frontend para usar nova API

### Curto Prazo
1. ⏳ Migrar endpoints FortiGate
2. ⏳ Migrar endpoints Office 365
3. ⏳ Migrar endpoints Gmail
4. ⏳ Criar testes unitários

### Médio Prazo
1. ⏳ Implementar rate limiting
2. ⏳ Adicionar logs estruturados
3. ⏳ Implementar cache (Redis)
4. ⏳ Monitoramento e métricas

## 🐛 Troubleshooting

### Erro: "Cannot connect to MySQL"
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar credenciais no .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
```

### Erro: "JWT Secret not configured"
```bash
# Adicionar no .env
JWT_SECRET=seu_secret_super_seguro_aqui
```

### Erro: "CORS blocked"
```bash
# Adicionar origem no .env
CORS_ORIGIN=http://localhost:5173,https://seu-dominio.com
```

## 📚 Recursos

- [Express.js Docs](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JWT.io](https://jwt.io/)
- [MySQL2 Docs](https://github.com/sidorares/node-mysql2)

---

**Migração iniciada em**: 28/04/2026  
**Status**: Fase 1 Completa ✅
