# ⚡ Instalação Rápida - 5 Passos

**Tempo estimado:** 15-20 minutos

---

## 1️⃣ Banco de Dados (5 min)

### phpMyAdmin
1. Acesse phpMyAdmin
2. Selecione seu banco de dados
3. Clique em "SQL"
4. Copie **TODO** o conteúdo de `db_complete_upgrade_safe.sql`
5. Cole e clique em "Executar"
6. Aguarde mensagem de sucesso

### Verificar
```sql
SELECT COUNT(*) FROM audit_log;
SELECT COUNT(*) FROM notifications;
SELECT COUNT(*) FROM user_groups;
```

Se retornar sem erro = ✅ Sucesso!

---

## 2️⃣ Upload de Arquivos PHP (3 min)

Faça upload destes 6 arquivos para a raiz do projeto:

```
app_audit.php
app_notifications.php
app_bitdefender_endpoints.php
app_contracts.php
cron_auto_sync.php
cron_send_notification_emails.php
```

### Via FTP/SFTP
- Host: seu-servidor.com
- Pasta: `/app/` ou `/var/www/html/`

### Via Easypanel
1. Acesse o painel
2. Vá em "Files"
3. Faça upload dos arquivos

---

## 3️⃣ Configurar Variáveis de Ambiente (2 min)

Adicione ao `.env` ou configurações do Easypanel:

```env
# Token secreto (gere um aleatório)
CRON_SECRET_TOKEN=abc123xyz789_seu_token_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha
SMTP_SECURE=tls
```

### Gerar token:
```bash
openssl rand -hex 32
```

Ou use qualquer string aleatória longa.

---

## 4️⃣ Configurar Cron Jobs (5 min)

### No Easypanel

1. Acesse seu projeto
2. Vá em "Advanced" → "Cron Jobs"
3. Adicione:

**Sincronização (a cada 6 horas):**
```
0 */6 * * * /usr/bin/php /app/cron_auto_sync.php >> /var/log/sync.log 2>&1
```

**Emails (a cada 30 minutos):**
```
*/30 * * * * /usr/bin/php /app/cron_send_notification_emails.php >> /var/log/emails.log 2>&1
```

4. Salve

### Testar Manualmente

```bash
php cron_auto_sync.php
php cron_send_notification_emails.php
```

Se não der erro = ✅ Sucesso!

---

## 5️⃣ Testar APIs (5 min)

### Via Browser ou Postman

**Testar Auditoria:**
```
GET https://seu-dominio.com/app_audit.php?page=1&limit=10
```

**Testar Notificações:**
```
GET https://seu-dominio.com/app_notifications.php?action=unread_count
```

**Testar Endpoints:**
```
GET https://seu-dominio.com/app_bitdefender_endpoints.php?action=stats
```

**Testar Contratos:**
```
GET https://seu-dominio.com/app_contracts.php?action=stats
```

Se retornar JSON = ✅ Sucesso!

---

## ✅ Pronto!

Você agora tem:

✅ Sistema de auditoria  
✅ Notificações automáticas  
✅ Sincronização a cada 6 horas  
✅ Inventário de endpoints  
✅ Módulo de contratos  

---

## 🚨 Problemas?

### Erro no SQL
Veja: `TROUBLESHOOTING_SQL.md`

### Cron não executa
```bash
# Verificar se cron está rodando
service cron status

# Ver logs
tail -f /var/log/sync.log
```

### API retorna erro 500
```bash
# Ver logs do PHP
tail -f /var/log/php_errors.log
```

### Permissões
```bash
chmod 644 app_*.php
chmod 755 cron_*.php
```

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- `INSTALACAO_COMPLETA_UPGRADE.md` - Guia detalhado
- `TROUBLESHOOTING_SQL.md` - Solução de problemas
- `RESUMO_IMPLEMENTACAO_COMPLETA.md` - O que foi implementado

---

**Desenvolvido por:** Kiro AI  
**Para:** Macip Tecnologia  
**Data:** 24/04/2026
