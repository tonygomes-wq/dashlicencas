# 🚀 Deploy na Hostgator - API Individual Bitdefender

## 📋 Arquivos para Upload

### ✅ ARQUIVOS OBRIGATÓRIOS

#### 1. Backend PHP (Raiz do site)
```
app_bitdefender_sync_client.php    ← NOVO! API de sincronização individual
```

#### 2. Frontend Compilado (Raiz do site)
```
index.html                          ← Atualizado com novos assets
assets/index-6a7b1f8d.js           ← JavaScript compilado (NOVO)
assets/index-9488a2cc.css          ← CSS compilado (NOVO)
assets/logo-BjiOwf8N-e02fd245.png  ← Logo (se não existir)
```

#### 3. Banco de Dados (Executar no phpMyAdmin)
```
db_bitdefender_client_api.sql      ← Script SQL (já executado)
```

---

## 📦 PASSO A PASSO COMPLETO

### Passo 1: Fazer Backup (IMPORTANTE!)

Antes de fazer qualquer upload, faça backup dos arquivos atuais:

1. Acesse o cPanel da Hostgator
2. Vá em **File Manager**
3. Baixe estes arquivos (backup):
   - `index.html` (atual)
   - Pasta `assets/` (atual)
   - `app_bitdefender_sync_client.php` (se existir)

---

### Passo 2: Upload do Backend PHP

#### Via cPanel File Manager:

1. **Acesse cPanel** → **File Manager**
2. Navegue até a **raiz do site** (geralmente `public_html`)
3. **Upload** do arquivo:
   ```
   app_bitdefender_sync_client.php
   ```
4. Verifique se o arquivo foi enviado corretamente

#### Via FTP (Alternativa):

1. Conecte via FTP (FileZilla, WinSCP, etc.)
2. Vá para a pasta raiz do site
3. Envie o arquivo `app_bitdefender_sync_client.php`

---

### Passo 3: Upload do Frontend Compilado

#### 3.1 Atualizar index.html

1. No **File Manager**, vá para a raiz do site
2. **Substitua** o arquivo `index.html` pelo novo
3. Ou edite diretamente e atualize as linhas:

```html
<!-- ANTES (linhas antigas) -->
<script type="module" crossorigin src="./assets/index-zmKFda2j.js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-1H3156wl.css">

<!-- DEPOIS (linhas novas) -->
<script type="module" crossorigin src="/assets/index-6a7b1f8d.js"></script>
<link rel="stylesheet" href="/assets/index-9488a2cc.css">
```

#### 3.2 Upload dos Assets

1. No **File Manager**, vá para a pasta `assets/`
2. **Upload** dos novos arquivos:
   ```
   assets/index-6a7b1f8d.js
   assets/index-9488a2cc.css
   ```
3. **OPCIONAL:** Você pode deletar os arquivos antigos:
   ```
   assets/index-zmKFda2j.js  (antigo)
   assets/index-1H3156wl.css (antigo)
   ```

---

### Passo 4: Banco de Dados (Se ainda não executou)

1. Acesse **cPanel** → **phpMyAdmin**
2. Selecione o banco: `faceso56_dashlicencas`
3. Clique na aba **SQL**
4. Execute cada comando separadamente:

```sql
-- Comando 1
ALTER TABLE bitdefender_licenses 
ADD COLUMN client_api_key VARCHAR(255) NULL COMMENT 'API Key específica do cliente' AFTER license_key;

-- Comando 2
ALTER TABLE bitdefender_licenses 
ADD COLUMN client_access_url VARCHAR(255) NULL COMMENT 'Access URL específica do cliente' AFTER client_api_key;

-- Comando 3
ALTER TABLE bitdefender_licenses 
ADD COLUMN last_sync TIMESTAMP NULL COMMENT 'Última sincronização deste cliente' AFTER client_access_url;

-- Comando 4 (Opcional - Performance)
ALTER TABLE bitdefender_licenses 
ADD INDEX idx_client_api (client_api_key);
```

**Nota:** Se aparecer erro "Duplicate column name", ignore (coluna já existe).

---

### Passo 5: Verificar Permissões

1. No **File Manager**, clique com botão direito em `app_bitdefender_sync_client.php`
2. Selecione **Permissions** ou **Change Permissions**
3. Configure para: **644** (rw-r--r--)
   - Owner: Read + Write
   - Group: Read
   - Public: Read

---

### Passo 6: Testar a Instalação

1. **Limpar cache do navegador:**
   - Pressione **Ctrl+F5** (Windows) ou **Cmd+Shift+R** (Mac)

2. **Acessar o dashboard:**
   - Abra o site no navegador
   - Faça login

3. **Verificar interface:**
   - Clique em um cliente Bitdefender
   - Procure a seção **"API Bitdefender (Opcional)"**
   - Deve aparecer:
     - Campo "API Key do Cliente"
     - Campo "Access URL do Cliente"
     - Botão "Sincronizar Este Cliente" (após configurar API Key)

4. **Testar sincronização:**
   - Configure uma API Key de teste
   - Clique em "Salvar Alterações"
   - Clique em "Sincronizar Este Cliente"
   - Verifique se os dados são atualizados

---

## 📁 ESTRUTURA FINAL NA HOSTGATOR

```
public_html/  (ou raiz do site)
├── index.html                           ← Atualizado
├── app_bitdefender_sync_client.php      ← NOVO!
├── app_bitdefender_sync.php             ← Existente
├── app_bitdefender.php                  ← Existente
├── app_fortigate.php                    ← Existente
├── app_o365.php                         ← Existente
├── app_gmail.php                        ← Existente
├── app_hardware.php                     ← Existente
├── app_auth.php                         ← Existente
├── ... (outros arquivos PHP)
│
├── assets/
│   ├── index-6a7b1f8d.js              ← NOVO!
│   ├── index-9488a2cc.css             ← NOVO!
│   ├── logo-BjiOwf8N-e02fd245.png     ← Existente
│   ├── index-zmKFda2j.js              ← Antigo (pode deletar)
│   └── index-1H3156wl.css             ← Antigo (pode deletar)
│
└── srv/
    └── config.php                       ← Existente
```

---

## ✅ CHECKLIST DE DEPLOY

### Antes do Deploy:
- [ ] Fazer backup do `index.html` atual
- [ ] Fazer backup da pasta `assets/` atual
- [ ] Anotar versão atual dos arquivos

### Durante o Deploy:
- [ ] Upload de `app_bitdefender_sync_client.php`
- [ ] Upload de `index.html` (atualizado)
- [ ] Upload de `assets/index-6a7b1f8d.js`
- [ ] Upload de `assets/index-9488a2cc.css`
- [ ] Verificar permissões (644)
- [ ] Executar SQL no phpMyAdmin (se necessário)

### Após o Deploy:
- [ ] Limpar cache do navegador (Ctrl+F5)
- [ ] Fazer login no dashboard
- [ ] Abrir detalhes de um cliente Bitdefender
- [ ] Verificar se aparece seção "API Bitdefender (Opcional)"
- [ ] Testar configuração de API Key
- [ ] Testar sincronização individual
- [ ] Verificar logs no painel de sincronização

---

## 🔧 COMANDOS ÚTEIS

### Via SSH (se tiver acesso):

```bash
# Navegar para a raiz do site
cd ~/public_html

# Verificar se arquivo foi enviado
ls -la app_bitdefender_sync_client.php

# Verificar permissões
ls -l app_bitdefender_sync_client.php

# Alterar permissões (se necessário)
chmod 644 app_bitdefender_sync_client.php

# Verificar assets
ls -la assets/index-6a7b1f8d.js
ls -la assets/index-9488a2cc.css
```

---

## 🐛 TROUBLESHOOTING

### Erro 404 ao sincronizar
**Causa:** Arquivo PHP não foi enviado ou está em local errado  
**Solução:** Verifique se `app_bitdefender_sync_client.php` está na raiz do site

### Erro 500 Internal Server Error
**Causa:** Permissões incorretas ou erro de sintaxe  
**Solução:** 
1. Verifique permissões (644)
2. Verifique logs de erro do PHP no cPanel

### Interface antiga aparece
**Causa:** Cache do navegador  
**Solução:** Pressione Ctrl+F5 para forçar atualização

### Seção de API não aparece
**Causa:** Frontend não foi atualizado  
**Solução:** 
1. Verifique se `index.html` aponta para os novos assets
2. Limpe cache do navegador
3. Verifique se os arquivos JS/CSS foram enviados

### Erro ao salvar API Key
**Causa:** Colunas não foram criadas no banco  
**Solução:** Execute os comandos SQL no phpMyAdmin

### Erro "Duplicate column name"
**Causa:** Colunas já existem (normal!)  
**Solução:** Ignore o erro e continue

---

## 📞 SUPORTE

Se encontrar problemas:

1. **Verifique logs de erro:**
   - cPanel → **Error Log**
   - Procure por erros relacionados a `app_bitdefender_sync_client.php`

2. **Verifique console do navegador:**
   - Pressione F12
   - Vá na aba **Console**
   - Procure por erros JavaScript

3. **Verifique Network:**
   - F12 → Aba **Network**
   - Tente sincronizar
   - Veja se a requisição para `app_bitdefender_sync_client.php` retorna 200

---

## 🎉 DEPLOY CONCLUÍDO!

Após seguir todos os passos, você terá:

✅ Backend PHP funcionando  
✅ Frontend atualizado com nova interface  
✅ Banco de dados configurado  
✅ Funcionalidade de API individual ativa  

**Pronto para usar!** 🚀

---

**Desenvolvido para Dashboard de Licenças - Macip Tecnologia**  
**Data:** 23/04/2026
