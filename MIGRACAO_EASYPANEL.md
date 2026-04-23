# 🚀 Migração para Easypanel

Guia completo para migrar o Dashboard de Licenças para o Easypanel usando Docker.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação dos Arquivos](#preparação-dos-arquivos)
3. [Configuração no Easypanel](#configuração-no-easypanel)
4. [Deploy](#deploy)
5. [Migração do Banco de Dados](#migração-do-banco-de-dados)
6. [Testes](#testes)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

- ✅ Conta no Easypanel
- ✅ Servidor VPS com Docker instalado
- ✅ Acesso SSH ao servidor (opcional)
- ✅ Backup do banco de dados atual

---

## 📦 Preparação dos Arquivos

### 1. Estrutura do Projeto

Certifique-se de que você tem estes arquivos na raiz do projeto:

```
dashlicencas/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── index.html
├── assets/
│   ├── index-f981d49f.js
│   └── index-bda104fb.css
├── srv/
│   ├── config.php
│   └── config.docker.php
├── app_*.php (todos os arquivos PHP)
└── db_init/
    └── init.sql (vamos criar)
```

### 2. Criar Pasta de Inicialização do Banco

```bash
mkdir -p db_init
```

### 3. Exportar Banco de Dados Atual

No phpMyAdmin da Hostgator:

1. Selecione o banco `faceso56_dashlicencas`
2. Clique em "Exportar"
3. Método: "Rápido"
4. Formato: "SQL"
5. Clique em "Executar"
6. Salve o arquivo como `db_init/init.sql`

---

## ⚙️ Configuração no Easypanel

### Método 1: Deploy via Git (Recomendado)

#### 1. Criar Repositório Git

```bash
# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Initial commit - Dashboard Licenças"

# Adicionar remote (GitHub, GitLab, etc)
git remote add origin https://github.com/seu-usuario/dashlicencas.git

# Push
git push -u origin main
```

#### 2. No Easypanel

1. **Login** no Easypanel
2. Clique em **"Create Service"**
3. Selecione **"App"**
4. Escolha **"From Git Repository"**
5. Cole a URL do repositório
6. Branch: `main`
7. Clique em **"Create"**

#### 3. Configurar Variáveis de Ambiente

No Easypanel, vá em **Environment Variables** e adicione:

```env
DB_HOST=db
DB_NAME=dashlicencas
DB_USER=dashlicencas_user
DB_PASSWORD=SuaSenhaSeguraAqui123!
```

#### 4. Configurar Domínio

1. Vá em **Domains**
2. Adicione seu domínio: `dashlicencas.seudominio.com`
3. Habilite **SSL/HTTPS** (automático com Let's Encrypt)

---

### Método 2: Deploy via Docker Compose (Alternativo)

#### 1. Conectar via SSH ao servidor

```bash
ssh usuario@seu-servidor.com
```

#### 2. Criar diretório do projeto

```bash
mkdir -p /opt/dashlicencas
cd /opt/dashlicencas
```

#### 3. Fazer upload dos arquivos

Use SCP, SFTP ou Git para enviar os arquivos:

```bash
# Via SCP (do seu computador local)
scp -r ./dashlicencas/* usuario@seu-servidor.com:/opt/dashlicencas/
```

#### 4. Iniciar os containers

```bash
cd /opt/dashlicencas
docker-compose up -d
```

---

## 🗄️ Migração do Banco de Dados

### Opção A: Importação Automática (Recomendado)

Se você colocou o arquivo `init.sql` na pasta `db_init/`, o MySQL vai importar automaticamente na primeira inicialização.

### Opção B: Importação Manual

```bash
# Copiar arquivo SQL para o container
docker cp db_init/init.sql dashlicencas-db:/tmp/

# Executar importação
docker exec -i dashlicencas-db mysql -u dashlicencas_user -p dashlicencas < /tmp/init.sql
```

### Opção C: Via phpMyAdmin

1. Instale phpMyAdmin no Easypanel (opcional)
2. Acesse via navegador
3. Importe o arquivo `init.sql`

---

## 🧪 Testes

### 1. Verificar se os containers estão rodando

```bash
docker ps
```

Deve mostrar:
- `dashlicencas-app` (porta 80)
- `dashlicencas-db` (porta 3306)

### 2. Verificar logs

```bash
# Logs da aplicação
docker logs dashlicencas-app

# Logs do banco
docker logs dashlicencas-db
```

### 3. Testar acesso

Acesse no navegador:
```
http://seu-dominio.com
```

### 4. Testar sincronização Bitdefender

1. Faça login
2. Clique em um cliente Bitdefender
3. Preencha API Key e URL
4. Clique em "Sincronizar Este Cliente"
5. **Deve funcionar sem timeout!** ✅

---

## 🔧 Configurações Adicionais

### Atualizar config.php para usar Docker

Edite `srv/config.php` para detectar ambiente Docker:

```php
<?php
// Detectar se está rodando no Docker
if (getenv('DB_HOST')) {
    // Ambiente Docker
    require_once __DIR__ . '/config.docker.php';
} else {
    // Ambiente tradicional (Hostgator)
    $db_host = 'localhost';
    $db_name = 'faceso56_dashlicencas';
    $db_user = 'faceso56_dashlicencas';
    $db_password = 'dash@123@macip';
    
    try {
        $pdo = new PDO(
            "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
            $db_user,
            $db_password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode([
            'error' => 'Erro de conexão com o banco de dados',
            'message' => $e->getMessage()
        ]));
    }
}
```

---

## 🔒 Segurança

### 1. Alterar senhas padrão

No `docker-compose.yml`, altere:
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_PASSWORD`

### 2. Configurar firewall

```bash
# Permitir apenas portas necessárias
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 3. Backup automático

Crie um script de backup:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup do banco
docker exec dashlicencas-db mysqldump -u root -p$MYSQL_ROOT_PASSWORD dashlicencas > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /opt/dashlicencas

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Adicione ao cron:
```bash
crontab -e
# Adicionar linha:
0 2 * * * /opt/scripts/backup.sh
```

---

## 🚀 Vantagens do Easypanel

### ✅ Sem Bloqueios de Firewall
- Conexões HTTPS funcionam sem restrições
- API Bitdefender vai funcionar imediatamente

### ✅ Melhor Performance
- Recursos dedicados
- Sem limitações de hospedagem compartilhada

### ✅ Escalabilidade
- Fácil aumentar recursos
- Adicionar mais containers se necessário

### ✅ Controle Total
- Acesso root ao servidor
- Configurações personalizadas

### ✅ Deploy Automático
- Git push → Deploy automático
- CI/CD integrado

---

## 📊 Comparação: Hostgator vs Easypanel

| Recurso | Hostgator | Easypanel |
|---------|-----------|-----------|
| Firewall | ❌ Bloqueado | ✅ Liberado |
| Performance | ⚠️ Compartilhada | ✅ Dedicada |
| Controle | ❌ Limitado | ✅ Total |
| Escalabilidade | ❌ Difícil | ✅ Fácil |
| Deploy | ⚠️ Manual | ✅ Automático |
| Custo | $ | $$ |

---

## 🆘 Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker logs dashlicencas-app --tail 100

# Verificar configuração
docker-compose config
```

### Problema: Erro de conexão com banco

```bash
# Verificar se o banco está rodando
docker exec dashlicencas-db mysql -u root -p -e "SHOW DATABASES;"

# Verificar variáveis de ambiente
docker exec dashlicencas-app env | grep DB_
```

### Problema: Permissões de arquivo

```bash
# Ajustar permissões
docker exec dashlicencas-app chown -R www-data:www-data /var/www/html
docker exec dashlicencas-app chmod -R 755 /var/www/html
```

---

## 📞 Suporte

Se tiver problemas durante a migração:

1. Verifique os logs dos containers
2. Consulte a documentação do Easypanel
3. Entre em contato com o suporte do Easypanel

---

## ✅ Checklist de Migração

- [ ] Backup do banco de dados atual
- [ ] Criar arquivos Docker (Dockerfile, docker-compose.yml)
- [ ] Exportar banco para db_init/init.sql
- [ ] Criar repositório Git (opcional)
- [ ] Configurar serviço no Easypanel
- [ ] Configurar variáveis de ambiente
- [ ] Configurar domínio e SSL
- [ ] Fazer deploy
- [ ] Testar acesso ao site
- [ ] Testar login
- [ ] Testar sincronização Bitdefender
- [ ] Configurar backups automáticos
- [ ] Desativar site na Hostgator (após confirmar funcionamento)

---

## 🎉 Conclusão

Após a migração para o Easypanel:

- ✅ **Sem bloqueios de firewall**
- ✅ **API Bitdefender funcionando**
- ✅ **Melhor performance**
- ✅ **Deploy automático**
- ✅ **Controle total**

**A sincronização vai funcionar imediatamente, sem precisar abrir ticket!** 🚀

---

**Tempo estimado de migração:** 1-2 horas

**Dificuldade:** Intermediária

**Recomendação:** ⭐⭐⭐⭐⭐ Altamente recomendado!
