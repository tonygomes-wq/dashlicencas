# Dashboard Licenças - Backend API

Backend em Node.js + TypeScript + Express para o sistema de gerenciamento de licenças.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **MySQL2** - Driver MySQL com suporte a Promises
- **JWT** - Autenticação via tokens
- **Bcrypt** - Hash de senhas
- **Helmet** - Segurança HTTP
- **CORS** - Cross-Origin Resource Sharing

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

## 🔧 Configuração

Edite o arquivo `.env` com suas credenciais:

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dashlicencas
JWT_SECRET=seu_secret_super_seguro
```

## 🏃 Executar

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Produção
npm start
```

## 📚 Endpoints

### Autenticação

- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Dados do usuário autenticado
- `POST /api/v1/auth/logout` - Logout

### Bitdefender

- `GET /api/v1/bitdefender` - Listar licenças
- `GET /api/v1/bitdefender/:id` - Obter licença por ID
- `POST /api/v1/bitdefender` - Criar licença (admin)
- `PUT /api/v1/bitdefender/:id` - Atualizar licença (admin)
- `DELETE /api/v1/bitdefender/:id` - Deletar licença (admin)
- `POST /api/v1/bitdefender/bulk-delete` - Deletar múltiplas (admin)

## 🔐 Autenticação

Todas as rotas (exceto login) requerem token JWT no header:

```
Authorization: Bearer seu_token_aqui
```

## 🏗️ Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações (DB, env)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Middlewares (auth, etc)
│   ├── routes/          # Definição de rotas
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários
│   ├── app.ts           # Configuração Express
│   └── server.ts        # Inicialização do servidor
├── .env.example         # Exemplo de variáveis
├── package.json         # Dependências
└── tsconfig.json        # Config TypeScript
```

## 🔄 Migração do PHP

Este backend substitui gradualmente os endpoints PHP:

1. ✅ Autenticação JWT
2. ✅ CRUD Bitdefender
3. ⏳ Estatísticas Bitdefender
4. ⏳ Sincronização API Bitdefender
5. ⏳ FortiGate
6. ⏳ Office 365
7. ⏳ Gmail

## 📝 Notas

- Dados do banco em `snake_case` são convertidos para `camelCase` na API
- Apenas administradores podem criar/editar/deletar registros
- Tokens JWT expiram em 7 dias (configurável)
