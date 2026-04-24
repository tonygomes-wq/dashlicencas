# 🔧 GUIA DE TROUBLESHOOTING - DEPLOY E BUILD

## 📚 DOCUMENTAÇÃO DE ERROS RESOLVIDOS

Este documento registra todos os problemas encontrados durante o deploy e suas soluções para referência futura.

---

## ❌ ERRO 1: Campo de Observações Não Aparecia

### Sintomas
- Código TypeScript modificado e commitado
- Campo `notes` existe no banco de dados
- Backend retorna o campo corretamente
- **MAS** o campo não aparece no modal do frontend

### Causa Raiz
Sistema estava usando arquivos JavaScript antigos porque o build do frontend não estava sendo executado no deploy.

### Problemas Identificados

#### 1.1. `.dockerignore` Bloqueava Arquivos Necessários

**Erro:**
```
ERROR: failed to calculate checksum: "/src": not found
ERROR: failed to calculate checksum: "/tsconfig.json": not found
ERROR: failed to calculate checksum: "/package.json": not found
```

**Causa:**
O `.dockerignore` estava excluindo arquivos essenciais:
```
# Arquivos de desenvolvimento
src/
vite.config.ts
tsconfig.json
package.json
package-lock.json
```

**Solução:**
Remover essas exclusões do `.dockerignore`:
```diff
- # Arquivos de desenvolvimento
- src/
- vite.config.ts
- tsconfig.json
- package.json
- package-lock.json

+ # NOTA: NÃO excluir src/, package.json, etc.
+ # Esses arquivos são necessários para o build do frontend no Dockerfile
```

#### 1.2. Dockerfile Não Fazia Build do Frontend

**Problema:**
O Dockerfile apenas copiava arquivos sem compilar o código TypeScript.

**Solução:**
Implementar build em 2 stages:

```dockerfile
# Stage 1: Build do Frontend React/Vite
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte e arquivos de configuração
COPY src/ ./src/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Build do frontend
RUN npm run build

# Stage 2: Servidor PHP/Apache
FROM php:8.2-apache

# ... instalação PHP ...

# Copiar arquivos buildados do frontend
COPY --from=frontend-builder --chown=www-data:www-data /app/dist/ ./
```

#### 1.3. index.html com Referências Hardcoded

**Erro:**
```
[vite]: Rollup failed to resolve import "/assets/index-2727af80.js" from "/app/index.html"
```

**Causa:**
O `index.html` tinha referências hardcoded aos arquivos buildados antigos:
```html
<script type="module" crossorigin src="/assets/index-2727af80.js"></script>
<link rel="stylesheet" href="/assets/index-bda104fb.css">
```

**Solução:**
Remover referências hardcoded e apontar para o código fonte:
```html
<body class="bg-gray-100 dark:bg-gray-900">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

O Vite processa automaticamente durante o build e gera as referências corretas.

#### 1.4. vite.config.ts com outDir Incorreto

**Erro:**
```
ERROR: "/app/dist": not found
```

**Causa:**
O `vite.config.ts` estava configurado para gerar arquivos no diretório atual:
```typescript
build: {
  outDir: '.',        // ❌ Gera em /app/
  emptyOutDir: false,
}
```

O Dockerfile tentava copiar de `/app/dist/`, mas os arquivos estavam em `/app/`.

**Solução:**
Configurar para gerar em `dist/`:
```typescript
build: {
  outDir: 'dist',     // ✅ Gera em /app/dist/
  emptyOutDir: true,  // ✅ Limpa pasta antes do build
}
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO PRÉ-DEPLOY

Antes de fazer deploy, verifique:

### Arquivos de Configuração

- [ ] `.dockerignore` **NÃO** exclui `src/`, `package.json`, `vite.config.ts`, `tsconfig.json`
- [ ] `Dockerfile` tem build do frontend em 2 stages
- [ ] `Dockerfile` copia de `/app/dist/` (não de `/app/`)
- [ ] `index.html` aponta para `/src/main.tsx` (não tem referências hardcoded)
- [ ] `vite.config.ts` tem `outDir: 'dist'` (não `outDir: '.'`)

### Banco de Dados

- [ ] Campos novos foram adicionados nas tabelas
- [ ] Backend PHP retorna os campos novos
- [ ] Tipos TypeScript incluem os campos novos

### Git

- [ ] Todas as mudanças foram commitadas
- [ ] Push foi feito para o GitHub
- [ ] Branch correta está sendo deployada

---

## 🚀 PROCESSO DE DEPLOY CORRETO

### 1. Desenvolvimento Local

```bash
# Fazer mudanças no código
# Testar localmente
npm run dev

# Build local para verificar
npm run build

# Verificar se não há erros
```

### 2. Commit e Push

```bash
# Adicionar arquivos
git add .

# Commit
git commit -m "Descrição das mudanças"

# Push
git push origin main
```

### 3. Deploy no Easypanel

1. Acessar Easypanel
2. Ir até o projeto
3. Clicar em "Redeploy"
4. Aguardar build completar (3-5 minutos)

### 4. Verificar Logs

Logs de sucesso devem mostrar:

```
✓ [frontend-builder] COPY src/ ./src/
✓ [frontend-builder] RUN npm ci
✓ [frontend-builder] RUN npm run build
✓ vite v4.5.14 building for production...
✓ transforming...
✓ ✓ XXXX modules transformed.
✓ ✓ built in XXXs
✓ [stage-1] COPY --from=frontend-builder /app/dist/ ./
✓ Successfully built
✓ Successfully tagged easypanel/sistema/dashlicencas
```

### 5. Testar no Browser

1. Abrir o dashboard
2. Pressionar `Ctrl + Shift + R` (hard refresh)
3. Testar funcionalidades modificadas
4. Verificar console do browser (F12) para erros

---

## 🆘 ERROS COMUNS E SOLUÇÕES

### Erro: "not found" Durante Build

**Sintomas:**
```
ERROR: failed to calculate checksum: "/src": not found
```

**Causa:** `.dockerignore` está excluindo o arquivo/pasta

**Solução:** Remover a exclusão do `.dockerignore`

---

### Erro: "Rollup failed to resolve import"

**Sintomas:**
```
[vite]: Rollup failed to resolve import "/assets/index-XXXXX.js"
```

**Causa:** `index.html` tem referências hardcoded

**Solução:** Remover referências hardcoded e apontar para `/src/main.tsx`

---

### Erro: Build Completa Mas Mudanças Não Aparecem

**Sintomas:**
- Build completa sem erros
- Deploy finaliza com sucesso
- **MAS** mudanças não aparecem no browser

**Causas Possíveis:**

1. **Cache do Browser**
   - Solução: `Ctrl + Shift + R` ou `Ctrl + Shift + Delete`

2. **Push Não Foi Feito**
   - Verificar: `git log origin/main..HEAD`
   - Solução: `git push origin main`

3. **Branch Errada no Easypanel**
   - Verificar configuração do projeto no Easypanel
   - Garantir que está deployando a branch `main`

---

### Erro: "npm ci failed"

**Sintomas:**
```
ERROR: process "/bin/sh -c npm ci" did not complete successfully
```

**Causas Possíveis:**

1. **package-lock.json desatualizado**
   - Solução: Deletar `package-lock.json` e `node_modules/`, executar `npm install`

2. **Dependências incompatíveis**
   - Solução: Verificar versões no `package.json`

---

### Erro: "npm run build failed"

**Sintomas:**
```
ERROR: process "/bin/sh -c npm run build" did not complete successfully
```

**Causas Possíveis:**

1. **Erros de TypeScript**
   - Solução: Executar `npm run build` localmente para ver erros detalhados

2. **Imports faltando**
   - Solução: Verificar todos os imports no código

3. **Configuração do Vite incorreta**
   - Solução: Verificar `vite.config.ts`

---

## 📊 ESTRUTURA DE ARQUIVOS CORRETA

```
dashlicencas/
├── .dockerignore          ← Não exclui src/, package.json
├── Dockerfile             ← Build em 2 stages
├── index.html             ← Aponta para /src/main.tsx
├── vite.config.ts         ← outDir: 'dist'
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
│
├── src/
│   ├── main.tsx           ← Entry point
│   ├── App.tsx
│   ├── types.ts
│   ├── components/
│   ├── pages/
│   └── lib/
│
├── srv/                   ← Backend PHP
│   ├── config.php
│   └── permissions.php
│
└── *.php                  ← Arquivos PHP da API
```

---

## 🔍 COMANDOS ÚTEIS PARA DEBUG

### Verificar Status do Git
```bash
git status
git log --oneline -5
git log origin/main..HEAD
```

### Verificar Diferenças
```bash
git diff
git diff --cached
git diff origin/main
```

### Testar Build Localmente
```bash
npm run build
ls -la dist/
```

### Verificar Configuração do Vite
```bash
cat vite.config.ts
```

### Verificar .dockerignore
```bash
cat .dockerignore
```

---

## 📝 NOTAS IMPORTANTES

1. **Sempre faça push antes de fazer redeploy**
   - O Easypanel baixa código do GitHub, não do seu computador

2. **Limpe o cache do browser após deploy**
   - Arquivos JavaScript são cacheados agressivamente

3. **Verifique os logs do Easypanel**
   - Erros de build aparecem nos logs

4. **Teste localmente antes de fazer deploy**
   - `npm run build` deve funcionar sem erros

5. **Mantenha documentação atualizada**
   - Documente mudanças significativas na arquitetura

---

## 🎯 RESUMO EXECUTIVO

### Problema Principal
Sistema não fazia build do frontend durante o deploy, resultando em código desatualizado.

### Solução Implementada
1. Corrigir `.dockerignore` para permitir arquivos necessários
2. Adicionar build do frontend no `Dockerfile` (2 stages)
3. Corrigir `index.html` para apontar para código fonte
4. Corrigir `vite.config.ts` para gerar em `dist/`

### Resultado
Build automático do frontend a cada deploy, garantindo que o código mais recente seja sempre deployado.

---

**Data de Criação:** 24/04/2026  
**Última Atualização:** 24/04/2026  
**Autor:** Kiro AI Assistant  
**Status:** ✅ Documentado e Testado
