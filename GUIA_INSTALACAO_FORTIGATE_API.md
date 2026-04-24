# Guia de Instalação - FortiGate API Integration

## 📋 Pré-requisitos

- ✅ Sistema já instalado e funcionando
- ✅ Acesso ao banco de dados MySQL
- ✅ Acesso SSH ao servidor
- ✅ Permissões de administrador no sistema
- ✅ Token de API do FortiGate (gerado no dispositivo)

## 🚀 Instalação Rápida (5 passos)

### Passo 1: Aplicar SQL no Banco de Dados

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-servidor

# Navegar até o diretório do projeto
cd /caminho/para/dashlicencas

# Aplicar SQL
mysql -u root -p dashlicencas < db_init/create_fortigate_api_tables.sql
```

**Verificar se as tabelas foram criadas:**
```sql
USE dashlicencas;
SHOW TABLES LIKE 'fortigate_%';
```

Você deve ver:
- `fortigate_alerts`
- `fortigate_api_config`
- `fortigate_devices_extended`
- `fortigate_sync_history`

### Passo 2: Configurar Variável de Ambiente

**Opção A: Arquivo .env (recomendado)**
```bash
# Criar ou editar arquivo .env
nano .env

# Adicionar linha (gerar chave aleatória de 32+ caracteres)
ENCRYPTION_KEY=sua_chave_secreta_aqui_minimo_32_caracteres_aleatorios
```

**Opção B: Variável de ambiente do sistema**
```bash
# Adicionar ao ~/.bashrc ou /etc/environment
export ENCRYPTION_KEY="sua_chave_secreta_aqui_minimo_32_caracteres_aleatorios"
```

**Gerar chave aleatória segura:**
```bash
# Linux/Mac
openssl rand -base64 32

# Ou usar PHP
php -r "echo bin2hex(random_bytes(32));"
```

### Passo 3: Fazer Build e Deploy

```bash
# Build do frontend
npm run build

# Commit das alterações
git add .
git commit -m "feat: Adiciona integração FortiGate API"

# Push para o repositório
git push origin main

# No Easypanel, o deploy será automático
# Aguardar conclusão do deploy (verificar logs no Easypanel)
```

### Passo 4: Configurar Cron Job (Opcional)

Para sincronização automática periódica:

```bash
# Tornar o script executável
chmod +x cron_fortigate_sync.php

# Editar crontab
crontab -e

# Adicionar linha para sincronizar a cada hora
0 * * * * php /caminho/completo/para/cron_fortigate_sync.php >> /var/log/fortigate_sync.log 2>&1

# Ou a cada 30 minutos
*/30 * * * * php /caminho/completo/para/cron_fortigate_sync.php >> /var/log/fortigate_sync.log 2>&1
```

**Criar diretório de logs:**
```bash
sudo mkdir -p /var/log
sudo touch /var/log/fortigate_sync.log
sudo chmod 666 /var/log/fortigate_sync.log
```

### Passo 5: Configurar Primeiro Dispositivo

1. **Acessar o sistema** (limpar cache: Ctrl+Shift+R)
2. **Ir para página "Fortigate"**
3. **Clicar no ícone de engrenagem** (Settings) na coluna "API"
4. **Preencher formulário:**
   - **IP do FortiGate:** 192.168.1.99 (exemplo)
   - **Token de API:** (copiar do FortiGate)
   - **Porta:** 443
   - **Verificar SSL:** ❌ Desmarcar (para testes internos)
   - **Intervalo:** 60 minutos
5. **Clicar em "Testar Conexão"**
6. **Se OK, clicar em "Salvar"**
7. **Clicar em "Sincronizar Agora"**

## 🔑 Como Gerar Token no FortiGate

### Via Interface Web (GUI)

1. Acessar FortiGate via HTTPS: `https://IP-DO-FORTIGATE`
2. Login com credenciais de administrador
3. Navegar: **System → Administrators**
4. Clicar em **Create New → REST API Admin**
5. Preencher:
   - **Username:** `api_user`
   - **Administrator Profile:** `super_admin` (ou perfil customizado)
   - **Trusted Hosts:** Adicionar IP do servidor (ou 0.0.0.0/0 para qualquer)
6. Clicar em **OK**
7. **COPIAR O TOKEN** (será exibido apenas uma vez!)
8. Salvar o token em local seguro

### Via CLI (SSH)

```bash
# Conectar via SSH ao FortiGate
ssh admin@IP-DO-FORTIGATE

# Criar API admin
config system api-user
    edit "api_user"
        set api-key ENC [token-gerado-automaticamente]
        set accprofile "super_admin"
        set vdom "root"
        config trusthost
            edit 1
                set ipv4-trusthost 0.0.0.0/0
            next
        end
    next
end
```

## ✅ Verificação da Instalação

### 1. Verificar Tabelas no Banco
```sql
USE dashlicencas;

-- Verificar se tabelas existem
SHOW TABLES LIKE 'fortigate_%';

-- Verificar estrutura
DESCRIBE fortigate_api_config;
DESCRIBE fortigate_devices_extended;
DESCRIBE fortigate_sync_history;
DESCRIBE fortigate_alerts;
```

### 2. Verificar Variável de Ambiente
```bash
# Testar se a variável está configurada
php -r "echo getenv('ENCRYPTION_KEY') ? 'OK' : 'NÃO CONFIGURADA';"
```

### 3. Verificar Frontend
1. Acessar o sistema
2. Limpar cache: **Ctrl + Shift + R**
3. Ir para **Dashboard**
4. Verificar se o card **"FortiGate API"** aparece
5. Ir para **Fortigate**
6. Verificar se a coluna **"API"** aparece com botões

### 4. Testar Sincronização Manual
1. Configurar um dispositivo (seguir Passo 5)
2. Clicar em "Sincronizar Agora"
3. Verificar se aparece mensagem de sucesso
4. Verificar no banco:
```sql
-- Ver última sincronização
SELECT * FROM fortigate_api_config WHERE device_id = 1;

-- Ver histórico
SELECT * FROM fortigate_sync_history ORDER BY sync_started_at DESC LIMIT 5;

-- Ver dados estendidos
SELECT * FROM fortigate_devices_extended WHERE device_id = 1;

-- Ver alertas
SELECT * FROM fortigate_alerts WHERE device_id = 1 AND is_resolved = FALSE;
```

### 5. Testar Cron Job (se configurado)
```bash
# Executar manualmente
php cron_fortigate_sync.php

# Verificar logs
tail -f /var/log/fortigate_sync.log

# Verificar se cron está rodando
crontab -l
```

## 🐛 Troubleshooting

### Erro: "Erro ao conectar ao banco de dados"
**Solução:**
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Verificar credenciais em srv/Database.php
nano srv/Database.php
```

### Erro: "ENCRYPTION_KEY não configurada"
**Solução:**
```bash
# Adicionar ao .env
echo 'ENCRYPTION_KEY=sua_chave_aqui' >> .env

# Ou exportar temporariamente
export ENCRYPTION_KEY="sua_chave_aqui"

# Reiniciar servidor web
sudo systemctl restart apache2  # ou nginx
```

### Erro: "Falha na conexão com FortiGate"
**Possíveis causas:**
1. **IP incorreto:** Verificar se o IP está correto
2. **Token inválido:** Gerar novo token no FortiGate
3. **Firewall bloqueando:** Liberar porta 443 no firewall
4. **SSL verificação:** Desmarcar "Verificar SSL" para testes
5. **Trusted Hosts:** Adicionar IP do servidor no FortiGate

**Testar conectividade:**
```bash
# Testar ping
ping IP-DO-FORTIGATE

# Testar porta HTTPS
curl -k https://IP-DO-FORTIGATE/api/v2/monitor/system/status?access_token=SEU_TOKEN
```

### Erro: "Tabelas não encontradas"
**Solução:**
```bash
# Reaplicar SQL
mysql -u root -p dashlicencas < db_init/create_fortigate_api_tables.sql

# Verificar
mysql -u root -p -e "USE dashlicencas; SHOW TABLES LIKE 'fortigate_%';"
```

### Frontend não atualiza após deploy
**Solução:**
```bash
# Limpar cache do navegador
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# Verificar se build foi feito
ls -la dist/

# Verificar se Easypanel fez deploy
# (verificar logs no painel do Easypanel)
```

### Cron job não executa
**Solução:**
```bash
# Verificar se cron está rodando
sudo systemctl status cron

# Verificar logs do cron
sudo tail -f /var/log/syslog | grep CRON

# Testar script manualmente
php cron_fortigate_sync.php

# Verificar permissões
chmod +x cron_fortigate_sync.php
```

## 📊 Monitoramento

### Verificar Estatísticas
```sql
-- Dispositivos configurados
SELECT COUNT(*) FROM fortigate_api_config WHERE api_enabled = TRUE;

-- Sincronizações bem-sucedidas (última hora)
SELECT COUNT(*) FROM fortigate_api_config 
WHERE last_sync_status = 'success' 
AND last_sync_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Alertas não resolvidos
SELECT COUNT(*) FROM fortigate_alerts WHERE is_resolved = FALSE;

-- Alertas críticos
SELECT COUNT(*) FROM fortigate_alerts 
WHERE is_resolved = FALSE AND severity = 'critical';
```

### Logs de Sincronização
```bash
# Ver últimas sincronizações
tail -n 50 /var/log/fortigate_sync.log

# Filtrar apenas erros
grep ERROR /var/log/fortigate_sync.log

# Filtrar apenas sucessos
grep SUCCESS /var/log/fortigate_sync.log

# Monitorar em tempo real
tail -f /var/log/fortigate_sync.log
```

## 🎯 Próximos Passos

Após instalação bem-sucedida:

1. ✅ Configurar todos os dispositivos FortiGate
2. ✅ Configurar cron job para sincronização automática
3. ✅ Monitorar alertas no Dashboard
4. ✅ Configurar notificações por email (futuro)
5. ✅ Criar relatórios personalizados (futuro)

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verificar logs: `/var/log/fortigate_sync.log`
2. Verificar banco de dados: tabelas `fortigate_*`
3. Verificar documentação: `IMPLEMENTACAO_FORTIGATE_API_COMPLETA.md`
4. Contatar suporte técnico

---

**Versão:** 1.0  
**Data:** 24/04/2026  
**Status:** ✅ Pronto para Produção
