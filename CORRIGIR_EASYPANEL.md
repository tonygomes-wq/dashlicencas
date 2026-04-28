# 🔧 Corrigir Configuração do Easypanel

## 🚨 Problema

O Easypanel está fazendo build na **raiz do projeto** (onde está o frontend), não na pasta `backend/`!

Por isso está tentando rodar `vite build` ao invés de `tsc`.

## ✅ Solução: Configurar Context Correto

### Passo 1: Ir nas Configurações do Serviço

1. No Easypanel, ir no serviço **dashlicencas-backend**
2. Clicar em **"Fonte"** ou **"Source"**

### Passo 2: Configurar Build Context

Procure por uma opção chamada:
- **"Build Context"** ou
- **"Context"** ou
- **"Working Directory"**

Configure para: **`backend`**

### Passo 3: Configurar Dockerfile Path

- **Dockerfile Path**: `Dockerfile` (não `backend/Dockerfile`)

**Por quê?**
- O Context já está em `backend/`
- Então o Dockerfile está em `backend/Dockerfile` → `./Dockerfile`

### Passo 4: Salvar e Fazer Redeploy

1. Salvar configurações
2. Clicar em **"Implantar"** ou **"Deploy"**

---

## 📊 Configuração Correta Final

```
┌─────────────────────────────────────────────────────────┐
│ CONFIGURAÇÃO DO BUILD                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Repositório: tonygomes-wq/dashlicencas                  │
│ Branch: main                                            │
│                                                         │
│ Build Method: Dockerfile                                │
│ Dockerfile Path: Dockerfile                             │
│ Context: backend                    ← IMPORTANTE!       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Alternativa: Dockerfile na Raiz

Se não conseguir configurar o Context, podemos criar um Dockerfile na raiz:

### Criar `Dockerfile.backend` na raiz

```dockerfile
# Usar imagem Node.js Alpine
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos do backend
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte do backend
COPY backend/src ./src

# Build do TypeScript
RUN npm run build

# Remover devDependencies
RUN npm prune --omit=dev

# Expor porta
EXPOSE 3001

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicação
CMD ["node", "dist/server.js"]
```

Depois configurar no Easypanel:
- **Dockerfile Path**: `Dockerfile.backend`
- **Context**: `.` (raiz)

---

## 🔍 Como Verificar se Está Correto

Nos logs do build, você deve ver:

```
✅ CORRETO:
> dashlicencas-backend@1.0.0 build
> tsc

❌ ERRADO:
> dashboard-licencas@1.0.0 build
> vite build
```

---

## 📝 Resumo

**Problema**: Easypanel está na pasta errada  
**Solução**: Configurar Context para `backend/`  
**Alternativa**: Criar Dockerfile na raiz

---

Qual opção você prefere tentar primeiro? 🤔
