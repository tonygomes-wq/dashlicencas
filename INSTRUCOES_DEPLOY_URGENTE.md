# 🚨 INSTRUÇÕES DE DEPLOY - PERMISSÕES POR CLIENTE

## ⚠️ IMPORTANTE: O que você está vendo é a versão ANTIGA!

A funcionalidade **JÁ ESTÁ IMPLEMENTADA**, mas você precisa fazer o deploy dos novos arquivos.

---

## 📋 O QUE DEVE ACONTECER:

Quando você clicar em **"RESTRITO"** (botão laranja), deve aparecer **ABAIXO** uma caixa branca com:

```
┌─────────────────────────────────────────────┐
│ SELECIONAR CLIENTES AUTORIZADOS        👥  │
│ ┌─────────────────┬─────────────────┐      │
│ │☐ Cliente A      │☐ Cliente B      │      │
│ │☐ Cliente C      │☐ Cliente D      │      │
│ └─────────────────┴─────────────────┘      │
└─────────────────────────────────────────────┘
```

---

## 🚀 PASSO A PASSO PARA DEPLOY:

### 1️⃣ Fazer Upload dos Arquivos

Você precisa fazer upload destes arquivos da pasta `dist/` para o servidor:

```
dist/
├── index.html                    ← ATUALIZAR
├── assets/
│   ├── index-4ab2a339.js        ← NOVO (substituir o antigo)
│   ├── index-f9be2b33.css       ← NOVO (substituir o antigo)
│   └── logo-e02fd245.png        ← Manter
```

**Arquivos que DEVEM ser substituídos no servidor:**
- ✅ `index.html`
- ✅ `assets/index-4ab2a339.js` (novo JS)
- ✅ `assets/index-f9be2b33.css` (novo CSS)

### 2️⃣ Limpar Cache do Navegador

Depois do upload, **TODOS os usuários** devem:
1. Pressionar `Ctrl + Shift + R` (Windows/Linux)
2. Ou `Cmd + Shift + R` (Mac)
3. Ou abrir em aba anônima para testar

### 3️⃣ Verificar se Funcionou

1. Abrir **Gerenciamento de Usuários**
2. Clicar em **"Editar"** em um usuário
3. Rolar até qualquer dashboard (Bitdefender, Fortigate, etc.)
4. Clicar no botão **"RESTRITO"** (laranja)
5. **DEVE APARECER** uma lista de checkboxes abaixo

---

## 🔍 COMO SABER SE ESTÁ NA VERSÃO NOVA:

### Método 1: Verificar no Console do Navegador
1. Pressione `F12` para abrir o Console
2. Vá na aba **"Console"**
3. Abra o modal de editar usuário
4. Clique em "RESTRITO"
5. Deve aparecer no console:
   ```
   Hardware clients fetched: (2) [{…}, {…}]
   Processed hardware clients: (2) [{…}, {…}]
   Items for hardware: (2) [{…}, {…}]
   ```

### Método 2: Verificar o arquivo JS carregado
1. Pressione `F12`
2. Vá na aba **"Network"** (Rede)
3. Recarregue a página
4. Procure por `index-*.js`
5. Deve ser: **`index-4ab2a339.js`**
6. Se for outro nome (ex: `index-941fa2d9.js`), está na versão antiga!

---

## 🐛 SE AINDA NÃO FUNCIONAR:

### Problema: Lista não aparece mesmo após deploy

**Causa possível**: Não há clientes cadastrados no módulo

**Solução**:
1. Vá em **"Inventário de Hardware"**
2. Clique em **"Novo Cliente"**
3. Cadastre pelo menos 1 cliente
4. Volte ao gerenciamento de usuários
5. Tente novamente

### Problema: Erro no console

**Se aparecer erro no console**, copie e cole aqui para eu analisar.

---

## 📊 ESTRUTURA ESPERADA:

Quando clicar em "RESTRITO", a interface deve ficar assim:

```
┌──────────────────────────────────────────────────────┐
│  📊 Bitdefender                    [TUDO] [RESTRITO] │
│  ┌────────────────────────────────────────────────┐  │
│  │ SELECIONAR CLIENTES AUTORIZADOS            👥 │  │
│  │ ┌──────────────────┬──────────────────┐       │  │
│  │ │☑️ AGROPLAY       │☐ CLIENTE B       │       │  │
│  │ │☐ CLIENTE C       │☐ CLIENTE D       │       │  │
│  │ └──────────────────┴──────────────────┘       │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE DEPLOY:

- [ ] Upload de `index.html`
- [ ] Upload de `assets/index-4ab2a339.js`
- [ ] Upload de `assets/index-f9be2b33.css`
- [ ] Limpar cache do navegador (`Ctrl + Shift + R`)
- [ ] Abrir modal de editar usuário
- [ ] Clicar em "RESTRITO"
- [ ] Verificar se lista de clientes aparece
- [ ] Marcar alguns clientes
- [ ] Salvar alterações
- [ ] Testar com usuário restrito

---

## 🎯 TESTE COMPLETO:

### 1. Configurar Usuário Restrito
1. Login como **admin**
2. Gerenciamento de Usuários → Editar usuário
3. Bitdefender → Clicar em **"RESTRITO"**
4. Marcar apenas **2 clientes** (ex: AGROPLAY e CLIENTE X)
5. Salvar

### 2. Testar Acesso Restrito
1. Fazer **logout**
2. Login com o **usuário restrito**
3. Abrir **Bitdefender**
4. **Verificar**: Deve ver apenas os 2 clientes selecionados
5. **Verificar**: Não deve ver outros clientes

---

## 📞 SUPORTE:

Se após seguir todos os passos ainda não funcionar:

1. Tire um **print do console** (F12 → Console)
2. Tire um **print da aba Network** mostrando o arquivo JS carregado
3. Envie para análise

---

**Build Atual**: `index-4ab2a339.js`  
**Data**: 22/05/2026  
**Status**: ✅ Pronto para Deploy

**IMPORTANTE**: A funcionalidade está 100% implementada. Você só precisa fazer o upload dos arquivos e limpar o cache!
