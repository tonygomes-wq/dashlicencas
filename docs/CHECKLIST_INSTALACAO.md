# ✅ Checklist de Instalação

Use este checklist para garantir que tudo foi instalado corretamente.

---

## 📋 PRÉ-INSTALAÇÃO

- [ ] Backup do banco de dados criado
- [ ] Acesso ao phpMyAdmin ou MySQL CLI
- [ ] Acesso ao servidor (FTP/SFTP/Easypanel)
- [ ] Permissões de admin no banco de dados

---

## 🗄️ BANCO DE DADOS

### Executar Script SQL
- [ ] Arquivo `db_complete_upgrade_safe.sql` baixado
- [ ] Script executado no phpMyAdmin
- [ ] Nenhum erro crítico retornado
- [ ] Mensagem de sucesso exibida

### Verificar Tabelas Criadas
- [ ] `audit_log` existe
- [ ] `notifications` existe
- [ ] `notification_settings` existe
- [ ] `bitdefender_endpoints` existe
- [ ] `sync_logs` existe
- [ ] `contracts` existe
- [ ] `contract_renewals` existe
- [ ] `user_groups` existe
- [ ] `user_group_members` existe
- [ ] `user_client_access` existe
- [ ] `system_settings` existe

### Verificar Views Criadas
- [ ] `v_expiring_licenses` existe
- [ ] `v_expiring_warranties` existe
- [ ] `v_active_contracts` existe

### Verificar Dados Padrão
- [ ] 3 grupos de usuários criados (Técnico, Comercial, Gerente)
- [ ] 6 configurações do sistema criadas
- [ ] Índices adicionados nas tabelas existentes

**Comando de verificação:**
```sql
SELECT 
    (SELECT COUNT(*) FROM user_groups) as grupos,
    (SELECT COUNT(*) FROM system_settings) as configuracoes;
```
Resultado esperado: grupos=3, configuracoes=6

---

## 📁 ARQUIVOS PHP

### Upload dos Arquivos
- [ ] `app_audit.php` enviado
- [ ] `app_notifications.php` enviado
- [ ] `app_bitdefender_endpoints.php` enviado
- [ ] `app_contracts.php` enviado
- [ ] `cron_auto_sync.php` enviado
- [ ] `cron_send_notification_emails.php` enviado

### Verificar Permissões
- [ ] Arquivos `app_*.php` com permissão 644
- [ ] Arquivos `cron_*.php` com permissão 755

**Comandos:**
```bash
chmod 644 app_*.php
chmod 755 cron_*.php
ls -la app_*.php cron_*.php
```

### Verificar Acesso
- [ ] `app_audit.php` acessível via browser
- [ ] `app_notifications.php` acessível via browser
- [ ] `app_bitdefender_endpoints.php` acessível via browser
- [ ] `app_contracts.php` acessível via browser

---

## 🔐 VARIÁVEIS DE AMBIENTE

### Configurações Obrigatórias
- [ ] `CRON_SECRET_TOKEN` definido
- [ ] Token é aleatório e seguro (mínimo 32 caracteres)

### Configurações Opcionais (Email)
- [ ] `SMTP_HOST` definido (se usar SMTP)
- [ ] `SMTP_PORT` definido (se usar SMTP)
- [ ] `SMTP_USER` definido (se usar SMTP)
- [ ] `SMTP_PASS` definido (se usar SMTP)
- [ ] `SMTP_SECURE` definido (se usar SMTP)

### Verificar Variáveis
```bash
echo $CRON_SECRET_TOKEN
# Deve retornar o token configurado
```

---

## ⏰ CRON JOBS

### Configuração no Easypanel
- [ ] Acesso ao painel de Cron Jobs
- [ ] Cron de sincronização adicionado (0 */6 * * *)
- [ ] Cron de emails adicionado (*/30 * * * *)
- [ ] Crons salvos e ativos

### Teste Manual
- [ ] `php cron_auto_sync.php` executado sem erro
- [ ] `php cron_send_notification_emails.php` executado sem erro
- [ ] Logs criados em `/var/log/sync.log`
- [ ] Logs criados em `/var/log/emails.log`

### Verificar Execução Automática
Aguarde 30 minutos e verifique:
- [ ] Arquivo `/var/log/sync.log` foi atualizado
- [ ] Arquivo `/var/log/emails.log` foi atualizado
- [ ] Registros criados na tabela `sync_logs`

**Comando de verificação:**
```sql
SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 5;
```

---

## 🧪 TESTES DE API

### Auditoria
- [ ] GET `/app_audit.php?page=1&limit=10` retorna JSON
- [ ] Resposta contém array `logs`
- [ ] Resposta contém objeto `pagination`

### Notificações
- [ ] GET `/app_notifications.php?action=list` retorna JSON
- [ ] GET `/app_notifications.php?action=unread_count` retorna JSON
- [ ] GET `/app_notifications.php?action=settings` retorna JSON

### Endpoints Bitdefender
- [ ] GET `/app_bitdefender_endpoints.php?action=list` retorna JSON
- [ ] GET `/app_bitdefender_endpoints.php?action=stats` retorna JSON

### Contratos
- [ ] GET `/app_contracts.php?action=list` retorna JSON
- [ ] GET `/app_contracts.php?action=stats` retorna JSON

### Teste com Autenticação
- [ ] APIs retornam erro 401 sem autenticação
- [ ] APIs retornam dados com autenticação válida

---

## 🎨 FRONTEND (Opcional - Próxima Fase)

### Componentes React
- [ ] `NotificationCenter.tsx` criado
- [ ] `NotificationBadge.tsx` criado
- [ ] `AuditLogTable.tsx` criado
- [ ] `BitdefenderEndpointsTable.tsx` criado
- [ ] `ContractsTable.tsx` criado

### Integração
- [ ] `src/types.ts` atualizado
- [ ] `src/lib/apiClient.ts` atualizado
- [ ] `src/pages/Dashboard.tsx` atualizado

### Build e Deploy
- [ ] `npm install` executado
- [ ] `npm run build` executado sem erros
- [ ] Arquivos de `dist/` copiados para produção
- [ ] Frontend acessível via browser

---

## 🔍 VERIFICAÇÃO FINAL

### Funcionalidades Básicas
- [ ] Login no dashboard funciona
- [ ] Dashboards existentes (Bitdefender, Fortigate, etc) funcionam
- [ ] Sem erros no console do browser (F12)

### Novas Funcionalidades
- [ ] Centro de notificações acessível
- [ ] Badge de notificações aparece no header
- [ ] Logs de auditoria acessíveis
- [ ] Página de contratos acessível
- [ ] Endpoints Bitdefender sincronizam

### Sincronização Automática
- [ ] Primeira sincronização executada
- [ ] Dados de licenças atualizados
- [ ] Endpoints Bitdefender sincronizados
- [ ] Notificações criadas para vencimentos

### Notificações por Email
- [ ] Configurações de email definidas
- [ ] Email de teste enviado com sucesso
- [ ] Notificações chegam na caixa de entrada

---

## 📊 MÉTRICAS DE SUCESSO

Após 24 horas de instalação, verifique:

### Sincronizações
```sql
SELECT 
    COUNT(*) as total_syncs,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM sync_logs;
```
Esperado: 4 sincronizações (a cada 6 horas)

### Notificações
```sql
SELECT 
    COUNT(*) as total_notifications,
    SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read,
    SUM(CASE WHEN is_email_sent = TRUE THEN 1 ELSE 0 END) as emailed
FROM notifications;
```

### Auditoria
```sql
SELECT 
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as active_users,
    COUNT(DISTINCT action) as action_types
FROM audit_log;
```

### Endpoints
```sql
SELECT 
    COUNT(*) as total_endpoints,
    SUM(CASE WHEN protection_status = 'protected' THEN 1 ELSE 0 END) as protected,
    SUM(CASE WHEN protection_status = 'at_risk' THEN 1 ELSE 0 END) as at_risk
FROM bitdefender_endpoints;
```

---

## 🚨 PROBLEMAS COMUNS

### ❌ Erro no SQL
- [ ] Consultei `TROUBLESHOOTING_SQL.md`
- [ ] Executei seções individualmente
- [ ] Verifiquei permissões do usuário MySQL

### ❌ Cron não executa
- [ ] Verifiquei se cron está rodando: `service cron status`
- [ ] Verifiquei sintaxe do crontab
- [ ] Testei execução manual
- [ ] Verifiquei logs: `tail -f /var/log/sync.log`

### ❌ API retorna erro 500
- [ ] Verifiquei logs do PHP: `tail -f /var/log/php_errors.log`
- [ ] Verifiquei conexão com banco de dados
- [ ] Verifiquei permissões dos arquivos

### ❌ Emails não são enviados
- [ ] Verifiquei configurações SMTP
- [ ] Testei conexão SMTP manualmente
- [ ] Verifiquei logs: `tail -f /var/log/emails.log`
- [ ] Verifiquei se PHPMailer está instalado

---

## ✅ INSTALAÇÃO COMPLETA

Se todos os itens acima estão marcados:

🎉 **PARABÉNS!** A instalação foi concluída com sucesso!

Você agora tem:
- ✅ Sistema de auditoria completo
- ✅ Notificações automáticas
- ✅ Sincronização a cada 6 horas
- ✅ Inventário de endpoints Bitdefender
- ✅ Módulo de contratos e renovações
- ✅ Logs detalhados de todas as operações

---

## 📚 PRÓXIMOS PASSOS

1. **Configurar notificações** - Definir preferências de email
2. **Criar grupos de usuários** - Atribuir permissões
3. **Configurar API Keys** - Adicionar chaves dos clientes
4. **Sincronizar endpoints** - Primeira sincronização manual
5. **Criar contratos** - Adicionar contratos existentes

---

## 📞 SUPORTE

Documentação disponível:
- `INSTALACAO_RAPIDA.md` - Guia rápido
- `INSTALACAO_COMPLETA_UPGRADE.md` - Guia detalhado
- `TROUBLESHOOTING_SQL.md` - Solução de problemas
- `RESUMO_IMPLEMENTACAO_COMPLETA.md` - O que foi implementado

---

**Data da instalação:** ___/___/______  
**Instalado por:** _________________  
**Tempo total:** _______ minutos

---

**Desenvolvido por:** Kiro AI  
**Para:** Macip Tecnologia  
**Versão:** 2.0  
**Data:** 24/04/2026
