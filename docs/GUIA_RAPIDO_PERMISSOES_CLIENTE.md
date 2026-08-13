# 🎯 Guia Rápido: Permissões por Cliente

## Como Configurar Permissões de Acesso

### 1️⃣ Acessar Gerenciamento de Usuários
1. Faça login como **administrador**
2. Clique no ícone de **usuário** no canto superior direito
3. Selecione **"Gerenciamento de Usuários"**

### 2️⃣ Editar Permissões de um Usuário
1. Na lista de usuários, clique no botão **"Editar"** (ícone de lápis)
2. O modal de edição será aberto

### 3️⃣ Configurar Acesso aos Dashboards

Você verá uma lista de dashboards disponíveis:
- ✅ **Bitdefender**
- ✅ **Fortigate**
- ✅ **Office 365**
- ✅ **Gmail**
- ✅ **Inventário de Hardware** ← NOVO!
- ✅ **Mapa de Rede**

Para cada dashboard, você pode:
- **Habilitar/Desabilitar** o acesso completo ao módulo
- **Controlar quais clientes** o usuário pode ver

### 4️⃣ Controlar Acesso por Cliente

Quando um dashboard está **habilitado**, você verá dois botões:

#### 🔵 Modo "TUDO"
- Usuário vê **todos os clientes** daquele dashboard
- Sem restrições

#### 🟠 Modo "RESTRITO"
- Usuário vê **apenas os clientes selecionados**
- Ao clicar em "RESTRITO", uma lista de checkboxes aparece
- Marque os clientes que o usuário pode acessar

### 5️⃣ Exemplo Prático

**Cenário**: Criar um usuário que só vê clientes específicos no Hardware

1. Abra o modal de edição do usuário
2. Role até **"Inventário de Hardware"**
3. Certifique-se que está **habilitado** (azul)
4. Clique no botão **"RESTRITO"** (laranja)
5. A lista de clientes aparecerá abaixo
6. **Marque apenas os clientes** que o usuário pode ver:
   - ☑️ Cliente A
   - ☑️ Cliente C
   - ☐ Cliente B (não marcado = não verá)
7. Clique em **"Salvar Alterações"**

### 6️⃣ Testar as Permissões

1. Faça **logout**
2. Faça **login com o usuário restrito**
3. Acesse **"Inventário de Hardware"**
4. **Verifique**: Deve ver apenas os clientes selecionados

---

## 🔍 Solução de Problemas

### Problema: Lista de clientes não aparece ao clicar em "RESTRITO"

**Possíveis causas:**
1. Não há clientes cadastrados no módulo
2. Cache do navegador desatualizado
3. Erro ao carregar dados

**Soluções:**
1. **Cadastre pelo menos um cliente** no módulo de Hardware
2. Limpe o cache: **Ctrl + Shift + R**
3. Abra o **Console do navegador** (F12) e verifique erros
4. Verifique se o arquivo `app_hardware_clients.php` existe no servidor

### Problema: Erro "Cannot read properties of undefined"

**Solução:**
- Atualize a página com **Ctrl + Shift + R**
- Verifique se há clientes cadastrados
- Veja os logs no console (F12)

### Problema: Usuário ainda vê todos os clientes

**Causas:**
1. Usuário é **admin** (admins sempre veem tudo)
2. Permissões não foram salvas
3. Usuário não fez logout/login após mudança

**Soluções:**
1. Verifique se o usuário tem `role = 'user'` (não admin)
2. Salve as permissões novamente
3. Usuário deve fazer **logout e login** para aplicar mudanças

---

## 📊 Estrutura Visual

```
┌─────────────────────────────────────────┐
│  Inventário de Hardware          [✓]   │
│  ┌─────────────────────────────────┐   │
│  │  [TUDO]  [RESTRITO]             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Selecionar Clientes Autorizados │   │
│  │ ┌─────────────┬─────────────┐   │   │
│  │ │☑️ Cliente A  │☑️ Cliente C  │   │   │
│  │ │☐ Cliente B  │☐ Cliente D  │   │   │
│  │ └─────────────┴─────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## ⚙️ Configurações Avançadas

### Permissões de Ação

Além do acesso por cliente, você pode controlar:
- ✏️ **Pode Editar**: Usuário pode modificar dados
- 🗑️ **Pode Excluir**: Usuário pode deletar registros

Essas permissões se aplicam a **todos os dashboards**.

---

## 🚀 Após Deploy

1. **Fazer upload** da pasta `dist/` para o servidor
2. **Instruir todos os usuários** a limpar cache: `Ctrl + Shift + R`
3. **Testar com admin** primeiro
4. **Criar usuário teste** com permissões restritas
5. **Validar** que os filtros funcionam

---

## 📝 Notas Importantes

- ⚠️ **Administradores sempre veem tudo**, independente das permissões
- ⚠️ **Usuários devem fazer logout/login** após mudanças de permissão
- ⚠️ **Cache do navegador** pode causar problemas - sempre limpar com `Ctrl + Shift + R`
- ✅ **Permissões são salvas em tempo real** no banco de dados
- ✅ **Cada dashboard tem controle independente** de clientes

---

## 🐛 Debug

Se algo não funcionar, abra o **Console do navegador** (F12) e procure por:

```
Hardware clients fetched: [...]
Processed hardware clients: [...]
```

Isso mostrará se os clientes estão sendo carregados corretamente.

---

**Build Atual**: `index-4b2a3126.js`  
**Data**: 21/05/2026  
**Status**: ✅ Funcional
