# 🚀 DEPLOY DO MÓDULO RH - GUIA RÁPIDO

**Data:** 02/06/2026  
**Tempo Estimado:** 10-15 minutos

---

## ✅ PRÉ-REQUISITOS

- [x] Build executado com sucesso (`npm run build`)
- [x] Acesso ao servidor (FTP/SSH)
- [x] Acesso ao MySQL
- [x] Usuário admin no sistema

---

## 📦 PASSO 1: DEPLOY DO FRONTEND

### Opção A: Upload Manual (FTP)
```
1. Abrir cliente FTP (FileZilla, WinSCP, etc.)
2. Conectar ao servidor
3. Navegar até a pasta pública do site
4. Fazer upload dos arquivos da pasta 'dist/'
   - dist/index.html
   - dist/assets/*
```

### Opção B: Upload via SSH
```bash
# Copiar arquivos via SCP
scp -r dist/* usuario@servidor:/caminho/do/site/public/

# Ou via rsync
rsync -avz dist/ usuario@servidor:/caminho/do/site/public/
```

### Verificação
- Acesse o site no navegador
- Limpe o cache (Ctrl+F5)
- Faça login

---

## 🗄️ PASSO 2: DEPLOY DO BACKEND

### Upload do app_hr.php
```bash
# Via SCP
scp app_hr.php usuario@servidor:/caminho/do/site/

# Via FTP
# Fazer upload manual do arquivo app_hr.php
# para a mesma pasta onde estão os outros arquivos app_*.php
```

### Verificação
```bash
# Testar se o arquivo está acessível
curl https://seusite.com/app_hr.php
# Deve retornar: {"error": "Authentication required"}
```

---

## 💾 PASSO 3: EXECUTAR SCRIPTS SQL

### Conectar ao MySQL

#### Via Terminal (Linux/Mac)
```bash
mysql -u root -p nome_do_banco
```

#### Via phpMyAdmin
1. Acessar phpMyAdmin
2. Selecionar o banco de dados
3. Ir em "SQL"

### Executar Scripts na Ordem

#### Script 1: Criar Tabelas
```sql
-- Copiar e colar o conteúdo de db_hr_schema.sql
-- OU executar via terminal:
source /caminho/para/db_hr_schema.sql;
```

#### Script 2: Adicionar Permissões
```sql
-- Copiar e colar o conteúdo de add_hr_permissions_corrigido.sql
-- OU executar via terminal:
source /caminho/para/add_hr_permissions_corrigido.sql;
```

### Verificar Criação

```sql
-- Verificar se as tabelas foram criadas
SHOW TABLES LIKE 'hr_%';

-- Deve retornar:
-- hr_employees
-- hr_vacations
-- hr_leaves
-- hr_benefits
-- hr_documents

-- Verificar permissões
SELECT 
    email, 
    role,
    JSON_EXTRACT(permissions, '$.dashboards.hr') as hr_dashboard
FROM users 
WHERE role = 'admin';

-- Deve mostrar hr_dashboard = true para admins
```

---

## 🧪 PASSO 4: TESTES

### 1. Verificar Acesso ao Módulo
- [ ] Fazer login no sistema
- [ ] Verificar se aparece a aba "Recursos Humanos"
- [ ] Clicar na aba

### 2. Testar Dashboard
- [ ] Dashboard RH carrega?
- [ ] Cards de estatísticas aparecem?
- [ ] Abas (Funcionários, Férias, Afastamentos, Benefícios) funcionam?

### 3. Testar CRUD de Funcionários
- [ ] Clicar em "Novo Funcionário"
- [ ] Preencher formulário (mínimo: Nome, CPF, Cargo, Data Admissão, Tipo Contrato)
- [ ] Salvar
- [ ] Funcionário aparece na tabela?
- [ ] Clicar em "Ver" detalhes
- [ ] Clicar em "Editar"
- [ ] Fazer uma alteração
- [ ] Salvar
- [ ] Excluir funcionário de teste

### 4. Testar Férias
- [ ] Navegar para aba "Férias"
- [ ] Tabela carrega?
- [ ] Busca funciona?
- [ ] Filtros funcionam?

### 5. Testar Afastamentos
- [ ] Navegar para aba "Afastamentos"
- [ ] Tabela carrega?
- [ ] Filtros por tipo funcionam?

### 6. Testar Benefícios
- [ ] Navegar para aba "Benefícios"
- [ ] Tabela carrega?
- [ ] Valores monetários aparecem formatados?

---

## 🐛 TROUBLESHOOTING

### Problema: Tab "Recursos Humanos" não aparece

**Solução:**
```sql
-- Verificar permissões do usuário
SELECT email, permissions FROM users WHERE email = 'seu@email.com';

-- Se necessário, adicionar permissão manualmente:
UPDATE users 
SET permissions = JSON_SET(
    COALESCE(permissions, '{}'),
    '$.dashboards.hr', true
)
WHERE role = 'admin';
```

### Problema: Erro 404 ao acessar app_hr.php

**Solução:**
- Verificar se o arquivo foi enviado corretamente
- Verificar permissões do arquivo (chmod 644)
- Verificar caminho no servidor

### Problema: Tabelas não foram criadas

**Solução:**
```sql
-- Verificar erros de sintaxe
-- Executar linha por linha do script SQL
-- Verificar se o usuário MySQL tem permissões CREATE TABLE
```

### Problema: "Erro ao carregar dados"

**Solução:**
- Abrir DevTools (F12) > Console
- Verificar erros de rede
- Verificar se app_hr.php retorna JSON válido
- Verificar logs do PHP no servidor

### Problema: Build antigo carregando

**Solução:**
- Limpar cache do navegador (Ctrl+Shift+Delete)
- Forçar refresh (Ctrl+F5)
- Tentar em aba anônima
- Verificar se os arquivos novos foram realmente enviados

---

## 📋 CHECKLIST DE DEPLOY

```
Frontend:
[ ] Executar npm run build
[ ] Upload de dist/* para o servidor
[ ] Limpar cache do navegador
[ ] Testar acesso ao site

Backend:
[ ] Upload de app_hr.php
[ ] Verificar permissões do arquivo
[ ] Testar endpoint com curl

Banco de Dados:
[ ] Executar db_hr_schema.sql
[ ] Executar add_hr_permissions_corrigido.sql
[ ] Verificar criação das tabelas
[ ] Verificar permissões dos usuários

Testes:
[ ] Login no sistema
[ ] Aba RH aparece
[ ] Dashboard carrega
[ ] Cadastrar funcionário teste
[ ] Editar funcionário
[ ] Excluir funcionário
[ ] Navegar entre abas
```

---

## 🎯 DEPLOY RÁPIDO (RESUMO)

```bash
# 1. Build
npm run build

# 2. Upload Frontend
scp -r dist/* servidor:/caminho/public/

# 3. Upload Backend
scp app_hr.php servidor:/caminho/

# 4. SQL
mysql -u root -p banco < db_hr_schema.sql
mysql -u root -p banco < add_hr_permissions_corrigido.sql

# 5. Testar
# Acessar site > Login > Clicar em "Recursos Humanos"
```

---

## ✅ CONFIRMAÇÃO DE SUCESSO

Você saberá que o deploy foi bem-sucedido quando:

1. ✅ Conseguir fazer login no sistema
2. ✅ Visualizar a aba "Recursos Humanos"
3. ✅ Clicar na aba e ver o Dashboard RH
4. ✅ Ver os 4 cards de estatísticas
5. ✅ Conseguir cadastrar um funcionário
6. ✅ Navegar entre as abas sem erros
7. ✅ Todas as tabelas carregarem

---

## 📞 COMANDOS ÚTEIS

### Ver logs do MySQL
```sql
SHOW VARIABLES LIKE 'log_error';
```

### Ver logs do PHP (servidor)
```bash
tail -f /var/log/apache2/error.log
# ou
tail -f /var/log/nginx/error.log
```

### Backup antes do deploy
```bash
# Backup do banco
mysqldump -u root -p nome_do_banco > backup_antes_rh.sql

# Backup dos arquivos
tar -czf backup_site.tar.gz /caminho/do/site/
```

---

## 🎉 PRONTO!

Após seguir todos os passos, o Módulo RH estará **100% operacional** em produção!

**Tempo médio de deploy:** 10-15 minutos

---

**Última atualização:** 02/06/2026  
**Dificuldade:** ⭐⭐ (Fácil)  
**Tempo:** 10-15 minutos
