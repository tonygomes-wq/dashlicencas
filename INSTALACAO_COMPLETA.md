# 🚀 Guia de Instalação Completa - Inventário de Hardware

## ⚠️ Situação Atual

Este diretório contém apenas os arquivos **compilados** (produção). Para adicionar a nova funcionalidade, você precisa:

1. Instalar o backend (pode fazer agora)
2. Compilar o frontend (precisa do projeto de desenvolvimento)

---

## 📦 PARTE 1: Instalação do Backend (FAÇA AGORA)

### Passo 1: Criar as Tabelas no Banco de Dados

Abra o terminal e execute:

```bash
mysql -u faceso56_dashlicencas -p faceso56_dashlicencas < db_hardware_schema.sql
```

Ou use o phpMyAdmin:
1. Acesse phpMyAdmin
2. Selecione o banco `faceso56_dashlicencas`
3. Vá em "SQL"
4. Cole o conteúdo do arquivo `db_hardware_schema.sql`
5. Clique em "Executar"

### Passo 2: Verificar o Backend

O arquivo `app_hardware.php` já está criado e pronto. Teste se está funcionando:

```bash
# Teste básico (deve retornar erro de autenticação, o que é normal)
curl http://localhost/app_hardware.php
```

✅ **Backend instalado!** A API está pronta para receber requisições.

---

## 🎨 PARTE 2: Compilação do Frontend (PRECISA DO PROJETO ORIGINAL)

### Onde está o projeto de desenvolvimento?

Este diretório (`05.DASHLICENCAS`) contém apenas:
- ❌ Arquivos compilados em `/assets`
- ❌ Sem `package.json`
- ❌ Sem `node_modules`
- ❌ Sem ferramentas de build

Você precisa encontrar o **projeto original** que tem:
- ✅ `package.json`
- ✅ `node_modules/`
- ✅ Configuração do Vite/Webpack
- ✅ Código fonte TypeScript/React

### Locais comuns onde pode estar:

```
C:\projetos\dashlicencas\
C:\dev\dashlicencas\
C:\Users\[seu-usuario]\Documents\projetos\dashlicencas\
Desktop\projetos\dashlicencas\
```

---

## 🔧 PARTE 3: Quando Encontrar o Projeto Original

### Passo 1: Copiar os Arquivos Novos

Copie estes arquivos para o projeto de desenvolvimento:

**Arquivos Novos:**
```
src/components/HardwareInventoryTable.tsx
src/components/AddHardwareModal.tsx
src/components/HardwareDetailModal.tsx
```

**Arquivos Modificados:**
```
src/types.ts
src/lib/apiClient.ts
src/pages/Dashboard.tsx
```

### Passo 2: Instalar Dependências (se necessário)

```bash
cd [caminho-do-projeto-original]
npm install
```

### Passo 3: Compilar o Projeto

```bash
npm run build
```

### Passo 4: Copiar Arquivos Compilados

Após o build, copie de volta para produção:

```bash
# Do projeto de desenvolvimento para produção
cp -r dist/* C:/Users/suporte04/Macip\ Tecnologia\ LTDA/MACIP\ -\ TECNICO\ -\ DOCUMENTAÇÃO\ INTERNA/06.\ DESENVOLVIMENTO/05.DASHLICENCAS/
```

---

## 🎯 ALTERNATIVA: Criar Projeto de Desenvolvimento do Zero

Se não encontrar o projeto original, posso ajudar a criar um novo:

### 1. Criar novo projeto Vite + React + TypeScript

```bash
npm create vite@latest dashlicencas-dev -- --template react-ts
cd dashlicencas-dev
npm install
```

### 2. Instalar dependências necessárias

```bash
npm install lucide-react react-hot-toast downloadjs html-to-image
npm install @xyflow/react
npm install -D @types/downloadjs
```

### 3. Copiar todos os arquivos `src/` deste diretório

### 4. Configurar o build para produção

### 5. Executar `npm run build`

---

## 📊 Status Atual da Instalação

| Componente | Status | Ação Necessária |
|------------|--------|-----------------|
| Backend PHP | ✅ Pronto | Execute o SQL |
| Banco de Dados | ⏳ Pendente | Execute `db_hardware_schema.sql` |
| Frontend (código) | ✅ Pronto | Precisa compilar |
| Frontend (compilado) | ❌ Não existe | Precisa fazer build |

---

## 🆘 Precisa de Ajuda?

### Opção 1: Encontre o Projeto Original
Procure por pastas que contenham `package.json` no seu computador:

**Windows:**
```powershell
Get-ChildItem -Path C:\ -Filter package.json -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Directory.Name -like "*dash*" -or $_.Directory.Name -like "*licen*" }
```

### Opção 2: Trabalhe Apenas com Backend
Por enquanto, você pode:
1. Instalar o backend (SQL + PHP)
2. Testar a API diretamente
3. Aguardar o build do frontend

### Opção 3: Crie Novo Projeto
Posso ajudar a criar um projeto de desenvolvimento completo do zero.

---

## 📝 Próximos Passos Recomendados

1. **AGORA:** Execute o script SQL para criar as tabelas
2. **DEPOIS:** Encontre ou crie o projeto de desenvolvimento
3. **POR FIM:** Compile e implante o frontend

---

## 🔍 Verificação Rápida

Execute este comando para verificar se há um projeto de desenvolvimento próximo:

```bash
# Procurar package.json em diretórios próximos
ls ../*/package.json
ls ../../*/package.json
```

Se encontrar, navegue até lá e execute `npm run build`!

---

**Dúvidas?** Me avise qual opção você quer seguir e posso ajudar com os próximos passos!
