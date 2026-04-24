# 🚀 Instalação Completa - Upgrade do Sistema

**Data:** 24/04/2026  
**Ambiente:** Easypanel

---

## 📋 VISÃO GERAL

Este upgrade adiciona funcionalidades avançadas ao Dashboard de Licenças:

### ✅ Alta Prioridade (Implementado)
- Sistema de Auditoria Completo
- Notificações In-App e por Email
- Inventário de Endpoints Bitdefender
- Sincronização Automática (Cron Jobs)

### ✅ Média Prioridade (Implementado)
- Módulo de Contratos e Renovações
- Permissões Granulares
- Logs de Sincronização

### ⏳ Pendente (Próximas Fases)
- Importação/Exportação CSV
- Integração Mapa + Hardware
- Otimizações de Performance
- PWA

---

## 🗄️ PASSO 1: Atualizar Banco de Dados

### ⚠️ IMPORTANTE: Use a Versão Segura

Existem dois arquivos SQL:
- `db_complete_upgrade.sql` - Versão original
- `db_complete_upgrade_safe.sql` - **Versão recomendada** (ignora erros se já existir)

### Via phpMyAdmin (Recomendado)

1. Acesse phpMyAdmin no Easypanel
2. Selecione o banco de dados
3. Vá em "SQL"
4. Copie e execute o conteúdo de **`db_complete_upgrade_safe.sql`**
5. Aguarde conclusão (pode levar 1-2 minutos)

### Via CLI

```bash
mysql -u [usuario] -p [banco] < db_complete_upgrade_safe.sql
```

### Se Encontrar Erros

Se ainda encontrar erros de sintaxe, execute as seções individualmente:

```sql
-- 1. Criar tabelas (copie seção 1-6 do SQL)
-- 2. Inserir dados (copie seção 7-8 do SQL)
-- 3. Criar views (copie seção 9 do SQL)
-- 4. Adicionar índices (copie seção 10 do SQL)
```

### Verificar Instalação

```sql
-- Verificar se as tabelas foram criadas
SHOW TABLES LIKE 'audit_log';
SHOW TABLES LIKE 'notifications';
SHOW TABLES LIKE 'bitdefender_endpoints';
SHOW TABLES LIKE 'contracts';
SHOW TABLES LIKE 'sync_logs';

-- Verificar dados de exemplo
SELECT * FROM user_groups;
SELECT * FROM system_settings;
```

---

## 📁 PASSO 2: Upload dos Arquivos PHP

Faça upload dos seguintes arquivos para o diretório raiz do projeto:

### Novos Arquivos Backend

```
app_audit.php                      - API de auditoria
app_notifications.php              - API de notificações
app_bitdefender_endpoints.php      - API de endpoints Bitdefender
app_contracts.php                  - API de contratos
cron_auto_sync.php                 - Sincronização automática
cron_send_notification_emails.php  - Envio de emails
```

### Verificar Permissões

```bash
chmod 644 app_*.php
chmod 755 cron_*.php
```

---

## ⏰ PASSO 3: Configurar Cron Jobs no Easypanel

### 3.1 Sincronização Automática (a cada 6 horas)

```bash
0 */6 * * * /usr/bin/php /app/cron_auto_sync.php >> /var/log/sync.log 2>&1
```

### 3.2 Envio de Emails (a cada 30 minutos)

```bash
*/30 * * * * /usr/bin/php /app/cron_send_notification_emails.php >> /var/log/emails.log 2>&1
```

### Como Configurar no Easypanel

1. Acesse o painel do Easypanel
2. Vá em seu projeto
3. Clique em "Advanced" → "Cron Jobs"
4. Adicione os dois cron jobs acima
5. Salve as alterações

### Alternativa: Via Docker

Adicione ao `docker-compose.yml`:

```yaml
services:
  cron:
    image: php:8.2-cli
    volumes:
      - ./:/app
    command: >
      sh -c "
      echo '0 */6 * * * /usr/bin/php /app/cron_auto_sync.php >> /var/log/sync.log 2>&1' > /etc/crontabs/root &&
      echo '*/30 * * * * /usr/bin/php /app/cron_send_notification_emails.php >> /var/log/emails.log 2>&1' >> /etc/crontabs/root &&
      crond -f
      "
```

---

## 🔐 PASSO 4: Configurar Variáveis de Ambiente

Adicione ao arquivo `.env` ou configurações do Easypanel:

```env
# Token secreto para cron jobs (gere um aleatório)
CRON_SECRET_TOKEN=seu_token_secreto_aqui_123456

# Configurações SMTP (opcional, para emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
SMTP_SECURE=tls

# Configurações da aplicação
COMPANY_NAME=Macip Tecnologia
NOTIFICATION_EMAIL_FROM=noreply@macip.com.br
```

### Gerar Token Secreto

```bash
# Linux/Mac
openssl rand -hex 32

# Ou use qualquer string aleatória longa
```

---

## 🎨 PASSO 5: Atualizar Frontend (React)

### 5.1 Criar Novos Componentes

Crie os seguintes arquivos em `src/components/`:

```
NotificationCenter.tsx       - Centro de notificações
NotificationBadge.tsx        - Badge de notificações não lidas
AuditLogTable.tsx           - Tabela de logs de auditoria
BitdefenderEndpointsTable.tsx - Tabela de endpoints
ContractsTable.tsx          - Tabela de contratos
ContractDetailModal.tsx     - Modal de detalhes do contrato
RenewalPipeline.tsx         - Pipeline de renovações
```

### 5.2 Atualizar Arquivos Existentes

Atualize:
- `src/types.ts` - Adicionar novos tipos
- `src/lib/apiClient.ts` - Adicionar novos métodos de API
- `src/pages/Dashboard.tsx` - Integrar novos componentes
- `src/components/Header.tsx` - Adicionar badge de notificações

### 5.3 Compilar Frontend

```bash
cd /caminho/do/projeto
npm install
npm run build
```

### 5.4 Deploy no Easypanel

```bash
# Copiar arquivos compilados
cp -r dist/* /app/

# Ou fazer commit e push (se usando Git)
git add .
git commit -m "feat: adicionar funcionalidades avançadas"
git push origin main
```

---

## 🧪 PASSO 6: Testar Funcionalidades

### 6.1 Testar APIs

```bash
# Testar auditoria
curl -X GET "https://seu-dominio.com/app_audit.php?page=1&limit=10" \
  -H "Authorization: Bearer SEU_TOKEN"

# Testar notificações
curl -X GET "https://seu-dominio.com/app_notifications.php?action=unread_count" \
  -H "Authorization: Bearer SEU_TOKEN"

# Testar endpoints Bitdefender
curl -X GET "https://seu-dominio.com/app_bitdefender_endpoints.php?action=stats" \
  -H "Authorization: Bearer SEU_TOKEN"

# Testar contratos
curl -X GET "https://seu-dominio.com/app_contracts.php?action=stats" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 6.2 Testar Cron Jobs Manualmente

```bash
# Testar sincronização
php cron_auto_sync.php

# Testar envio de emails
php cron_send_notification_emails.php
```

### 6.3 Verificar Logs

```bash
# Ver logs de sincronização
tail -f /var/log/sync.log

# Ver logs de emails
tail -f /var/log/emails.log

# Ver logs do PHP
tail -f /var/log/php_errors.log
```

---

## 📊 PASSO 7: Configurações Iniciais

### 7.1 Configurar Notificações

1. Acesse o dashboard
2. Vá em "Configurações" → "Notificações"
3. Configure preferências de email
4. Defina frequência de notificações

### 7.2 Criar Grupos de Usuários

Os grupos padrão já foram criados:
- **Técnico** - Somente leitura
- **Comercial** - Acesso a renovações
- **Gerente** - Acesso completo

Para criar novos grupos:
1. Acesse "Gerenciamento de Usuários"
2. Vá em "Grupos"
3. Clique em "Novo Grupo"
4. Configure permissões

### 7.3 Configurar Sincronização Bitdefender

1. Acesse a aba "Bitdefender"
2. Clique em um cliente
3. Configure API Key (se ainda não configurado)
4. Clique em "Sincronizar Endpoints"
5. Aguarde processamento

---

## 🔍 PASSO 8: Monitoramento

### 8.1 Dashboard de Logs

Acesse: `https://seu-dominio.com/dashboard#/audit`

Visualize:
- Ações de usuários
- Sincronizações
- Erros e avisos

### 8.2 Notificações

Acesse: Ícone de sino no header

Visualize:
- Notificações não lidas
- Histórico de alertas
- Vencimentos próximos

### 8.3 Estatísticas de Contratos

Acesse: `https://seu-dominio.com/dashboard#/contracts`

Visualize:
- MRR (Monthly Recurring Revenue)
- Contratos expirando
- Pipeline de renovações

---

## 🚨 TROUBLESHOOTING

### Erro: "Tabela não encontrada"

```sql
-- Verificar se o upgrade foi executado
SHOW TABLES;

-- Re-executar o upgrade
SOURCE db_complete_upgrade.sql;
```

### Erro: "Permissão negada" nos cron jobs

```bash
# Verificar permissões
ls -la cron_*.php

# Corrigir permissões
chmod 755 cron_*.php
```

### Cron jobs não executam

```bash
# Verificar se o cron está rodando
service cron status

# Ver logs do cron
grep CRON /var/log/syslog

# Testar manualmente
php cron_auto_sync.php
```

### Emails não são enviados

1. Verificar configurações SMTP no `.env`
2. Testar conexão SMTP
3. Verificar logs: `tail -f /var/log/emails.log`
4. Verificar se PHPMailer está instalado (se usando SMTP)

### API retorna erro 500

```bash
# Ver logs do PHP
tail -f /var/log/php_errors.log

# Verificar conexão com banco
php -r "new PDO('mysql:host=localhost;dbname=seu_banco', 'usuario', 'senha');"
```

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] Banco de dados atualizado (`db_complete_upgrade.sql`)
- [ ] Arquivos PHP enviados para o servidor
- [ ] Permissões configuradas (644 para app_*, 755 para cron_*)
- [ ] Cron jobs configurados no Easypanel
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend compilado e deployado
- [ ] APIs testadas (auditoria, notificações, endpoints, contratos)
- [ ] Cron jobs testados manualmente
- [ ] Logs verificados (sem erros)
- [ ] Notificações configuradas
- [ ] Grupos de usuários criados
- [ ] Sincronização Bitdefender testada
- [ ] Dashboard de contratos acessível

---

## 📚 DOCUMENTAÇÃO ADICIONAL

### Arquivos de Referência

- `ANALISE_PONTOS_PENDENTES.md` - Análise completa do projeto
- `PLANO_IMPLEMENTACAO.md` - Plano de implementação
- `db_complete_upgrade.sql` - Script SQL completo
- `app_audit.php` - Documentação inline da API
- `app_notifications.php` - Documentação inline da API
- `app_bitdefender_endpoints.php` - Documentação inline da API
- `app_contracts.php` - Documentação inline da API

### APIs Disponíveis

| Endpoint | Métodos | Descrição |
|----------|---------|-----------|
| `/app_audit.php` | GET, POST | Logs de auditoria |
| `/app_notifications.php` | GET, POST, PUT, DELETE | Notificações |
| `/app_bitdefender_endpoints.php` | GET, POST, PUT, DELETE | Endpoints Bitdefender |
| `/app_contracts.php` | GET, POST, PUT, DELETE | Contratos |

### Próximas Implementações

Fase 2 (Média Prioridade):
- Importação/Exportação CSV
- Integração Mapa + Hardware
- Relatórios avançados

Fase 3 (Baixa Prioridade):
- Cache e otimizações
- Temas personalizados
- PWA

---

## 🎉 CONCLUSÃO

Após seguir todos os passos, você terá:

✅ Sistema de auditoria completo  
✅ Notificações automáticas por email  
✅ Sincronização automática a cada 6 horas  
✅ Inventário de endpoints Bitdefender  
✅ Módulo de contratos e renovações  
✅ Logs detalhados de todas as operações  
✅ Permissões granulares por usuário  

**Tempo estimado de instalação:** 30-45 minutos

---

**Desenvolvido por:** Kiro AI  
**Para:** Macip Tecnologia  
**Data:** 24/04/2026
