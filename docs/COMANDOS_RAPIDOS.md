# ⚡ Comandos Rápidos - Migração Node.js

## 🚀 Iniciar Desenvolvimento

```bash
# Backend
cd backend
npm run dev

# Frontend (em outro terminal)
npm run dev
```

## 🧪 Testar API

### Health Check
```bash
curl http://localhost:3001/health
```

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

### Listar Licenças (substitua TOKEN)
```bash
curl http://localhost:3001/api/v1/bitdefender \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📦 Build e Deploy

### Build Local
```bash
cd backend
npm run build
npm start
```

### Docker Local
```bash
# Build
docker build -t dashlicencas-backend ./backend

# Run
docker run -p 3001:3001 --env-file backend/.env dashlicencas-backend
```

### Git Push
```bash
git add .
git commit -m "feat: migração backend Node.js completa"
git push origin main
```

## 🔧 Manutenção

### Instalar Dependências
```bash
cd backend
npm install
```

### Atualizar Dependências
```bash
npm update
```

### Verificar Vulnerabilidades
```bash
npm audit
npm audit fix
```

### Limpar node_modules
```bash
rm -rf node_modules
npm install
```

## 🐛 Debug

### Ver Logs do Servidor
```bash
cd backend
npm run dev
# Logs aparecem no terminal
```

### Testar Conexão MySQL
```bash
mysql -u root -p
USE dashlicencas;
SHOW TABLES;
```

### Verificar Porta em Uso
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001
```

## 📊 Monitoramento

### Ver Processos Node
```bash
# Windows
tasklist | findstr node

# Linux/Mac
ps aux | grep node
```

### Matar Processo na Porta 3001
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

## 🔐 Segurança

### Gerar JWT Secret Seguro
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### Verificar Variáveis de Ambiente
```bash
cd backend
cat .env
```

## 📝 Logs

### Ver Logs em Tempo Real
```bash
cd backend
npm run dev | tee logs.txt
```

### Buscar Erros nos Logs
```bash
grep -i error logs.txt
```

## 🧹 Limpeza

### Limpar Build
```bash
cd backend
rm -rf dist
npm run build
```

### Limpar Cache npm
```bash
npm cache clean --force
```

## 🔄 Reiniciar Tudo

```bash
# Parar processos
# Ctrl+C nos terminais

# Backend
cd backend
rm -rf node_modules dist
npm install
npm run dev

# Frontend
rm -rf node_modules dist
npm install
npm run dev
```

## 📚 Documentação

### Ver Rotas Disponíveis
```bash
# Abrir no navegador
http://localhost:3001/health
```

### Testar com REST Client (VS Code)
```bash
# Abrir arquivo
code backend/test-api.http
# Clicar em "Send Request"
```

## 🎯 Atalhos Úteis

### Desenvolvimento Rápido
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: MySQL
mysql -u root -p
```

### Deploy Rápido
```bash
# Build tudo
cd backend && npm run build && cd ..
npm run build

# Commit e push
git add .
git commit -m "deploy: atualização"
git push origin main
```

### Teste Completo
```bash
# 1. Iniciar backend
cd backend && npm run dev &

# 2. Aguardar 3 segundos
sleep 3

# 3. Testar health
curl http://localhost:3001/health

# 4. Testar login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'
```

## 🔍 Troubleshooting Rápido

### Erro: Cannot connect to MySQL
```bash
# Verificar se MySQL está rodando
mysql -u root -p

# Verificar .env
cat backend/.env | grep DB_
```

### Erro: Port 3001 already in use
```bash
# Mudar porta no .env
echo "PORT=3002" >> backend/.env
```

### Erro: Module not found
```bash
cd backend
rm -rf node_modules
npm install
```

### Erro: JWT Secret not configured
```bash
# Adicionar no .env
echo "JWT_SECRET=$(openssl rand -hex 64)" >> backend/.env
```

## 📱 Comandos Mobile (Termux/Android)

```bash
# Instalar Node.js
pkg install nodejs

# Clonar repo
git clone https://github.com/seu-usuario/dashlicencas.git
cd dashlicencas/backend

# Instalar e rodar
npm install
npm run dev
```

## 🎨 Aliases Úteis (Bash/Zsh)

Adicione ao seu `.bashrc` ou `.zshrc`:

```bash
# Backend
alias bd='cd ~/dashlicencas/backend'
alias bdev='cd ~/dashlicencas/backend && npm run dev'
alias bbuild='cd ~/dashlicencas/backend && npm run build'

# Frontend
alias fd='cd ~/dashlicencas'
alias fdev='cd ~/dashlicencas && npm run dev'
alias fbuild='cd ~/dashlicencas && npm run build'

# Git
alias gp='git add . && git commit -m "update" && git push'
alias gs='git status'
alias gl='git log --oneline -10'

# Docker
alias dps='docker ps'
alias dlogs='docker logs -f'
```

## 🔥 Comandos Pro

### Watch de Arquivos
```bash
# Reiniciar ao mudar arquivos
cd backend
npx nodemon src/server.ts
```

### Benchmark de Performance
```bash
# Instalar Apache Bench
# Windows: baixar do Apache
# Linux: apt-get install apache2-utils
# Mac: brew install ab

# Testar 1000 requisições, 10 concorrentes
ab -n 1000 -c 10 http://localhost:3001/health
```

### Monitorar Uso de Recursos
```bash
# Instalar htop
# Linux: apt-get install htop
# Mac: brew install htop

# Rodar
htop
```

---

**Dica**: Salve este arquivo nos favoritos para acesso rápido! 🚀
