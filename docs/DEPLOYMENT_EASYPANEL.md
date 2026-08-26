# 🚀 Deployment no EasyPanel - Sistema de Relatórios Bitdefender

**Versão:** 2.0  
**Data:** 26 de agosto de 2026  
**Tempo Estimado:** 15-20 minutos

---

## 📋 Pré-requisitos

Antes de fazer o deploy:

- [ ] ✅ Conta no EasyPanel
- [ ] ✅ Repositório Git atualizado
- [ ] ✅ Dockerfile atualizado (versão 2.0)
- [ ] ✅ Script SQL de relatórios (`docs/db_bitdefender_reports.sql`)
- [ ] ✅ API Keys do Bitdefender GravityZone

---

## 🔧 Passo 1: Atualizar Repositório Git

```bash
# Adicionar todos os novos arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: Sistema de Relatórios Bitdefender v2.0 - Geração instantânea, agendamentos automáticos, download PDF/CSV"

# Push para o repositório
git push origin main
```

### Arquivos Novos Incluídos:
- ✅ `app_bitdefender_reports.php` - API de relatórios
- ✅ `app_bitdefender_api.php` - Classe helper
- ✅ `cron_execute_report_schedules.php` - Cron de agendamentos
- ✅ `src/components/BitdefenderGenerateReportModal.tsx`
- ✅ `src/components/BitdefenderReportsListModal.tsx`
- ✅ `src/components/BitdefenderScheduleReportModal.tsx`
- ✅ `src/components/DetailSidebar.tsx` (atualizado)
- ✅ `docs/db_bitdefender_reports.sql`
- ✅ `docs/BITDEFENDER_REPORTS_README.md`
- ✅ `docs/INSTALACAO_RAPIDA_RELATORIOS.md`
- ✅ `Dockerfile` (versão 2.0)

---

## 🐳 Passo 2: Configurar EasyPanel

### 2.1. Acessar o Projeto

1. Acesse o EasyPanel: https://app.easypanel.io
2. Selecione seu projeto
3. Vá em **Services** ou **Apps**

### 2.2. Atualizar Configurações do Container

#### **Opção A: Via Interface Web**

1. Clique em **Settings** ou **Configure**
2. Vá em **Build Settings**
3. Verifique:
   - **Build Method**: `Dockerfile`
   - **Dockerfile Path**: `./Dockerfile`
   - **Context**: `.` (raiz do projeto)
4. Clique em **Save**

#### **Opção B: Via easypanel.yml**

Crie/atualize o arquivo `easypanel.yml` na raiz:

```yaml
services:
  - name: dashboard-licencas
    image:
      build:
        context: .
        dockerfile: Dockerfile
    ports:
      - target: 80
        published: 80
    environment:
      - DB_HOST=${DB_HOST}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASS=${DB_PASS}
      - TZ=America/Sao_Paulo
    volumes:
      - storage:/var/www/html/storage
    restart: always
    healthCheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 3s
      retries: 3

volumes:
  storage:
    driver: local
```

### 2.3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis:

```env
# Banco de Dados (já existentes)
DB_HOST=seu_host_mysql
DB_NAME=nome_do_banco
DB_USER=usuario
DB_PASS=senha

# Timezone
TZ=America/Sao_Paulo

# Configurações de Relatórios (opcional)
BITDEFENDER_REPORTS_RETENTION_DAYS=90
BITDEFENDER_REPORTS_AUTO_DOWNLOAD=1
```

### 2.4. Configurar Volume Persistente

**IMPORTANTE:** Configure um volume para preservar os relatórios entre deploys.

1. Vá em **Volumes** ou **Storage**
2. Crie um volume chamado `storage`
3. Monte em: `/var/www/html/storage`

Ou via linha de comando:
```bash
# No EasyPanel CLI
easypanel volume create storage
easypanel volume attach storage /var/www/html/storage
```

---

## 🗄️ Passo 3: Atualizar Banco de Dados

### 3.1. Conectar ao Banco via phpMyAdmin ou MySQL

Se você tem acesso SSH ao container:

```bash
# Entrar no container
easypanel exec dashboard-licencas bash

# Executar SQL
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < /var/www/html/docs/db_bitdefender_reports.sql
```

### 3.2. Via phpMyAdmin (Recomendado)

1. Acesse o phpMyAdmin do seu banco
2. Selecione o banco de dados
3. Vá em **SQL**
4. Copie todo o conteúdo de `docs/db_bitdefender_reports.sql`
5. Cole e clique em **Executar**

### 3.3. Verificar Instalação

Execute estas queries para confirmar:

```sql
-- Verificar tabelas
SHOW TABLES LIKE 'bitdefender_report%';
-- Deve retornar: 3 tabelas

-- Verificar views
SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_dashlicencas LIKE '%bitdefender%';
-- Deve retornar: 2 views

-- Verificar stored procedures
SHOW PROCEDURE STATUS WHERE Db = 'seu_banco' AND Name LIKE '%report%';
-- Deve retornar: 2 procedures
```

✅ **Se tudo retornou corretamente, o banco está pronto!**

---

## 🔄 Passo 4: Fazer o Deploy

### 4.1. Rebuild e Deploy

No EasyPanel:

1. Vá em **Deployments** ou **Builds**
2. Clique em **Deploy** ou **Rebuild**
3. Aguarde o build (5-10 minutos)
4. Acompanhe os logs

Ou via CLI:

```bash
easypanel deploy dashboard-licencas --wait
```

### 4.2. Acompanhar Logs

```bash
# Logs em tempo real
easypanel logs dashboard-licencas --follow

# Logs do cron (agendamentos)
easypanel exec dashboard-licencas tail -f /var/log/bitdefender/cron.log
```

### 4.3. Verificar Health Check

```bash
# Verificar status
easypanel status dashboard-licencas

# Health check manual
curl http://seu-dominio.com
```

---

## 🔍 Passo 5: Verificar Funcionamento

### 5.1. Verificar Storage

```bash
# Entrar no container
easypanel exec dashboard-licencas bash

# Verificar diretórios
ls -la /var/www/html/storage/reports/bitdefender
ls -la /var/log/bitdefender

# Verificar permissões
stat /var/www/html/storage/reports/bitdefender
```

**Resultado esperado:**
```
drwxr-xr-x 2 www-data www-data 4096 Aug 26 10:00 bitdefender
```

### 5.2. Verificar Cron

```bash
# Ver status do cron
easypanel exec dashboard-licencas service cron status

# Ver configuração do cron
easypanel exec dashboard-licencas crontab -l

# Testar execução manual
easypanel exec dashboard-licencas php /var/www/html/cron_execute_report_schedules.php
```

### 5.3. Teste Completo via Interface

1. Acesse o dashboard: `https://seu-dominio.com`
2. Faça login
3. Clique em uma licença Bitdefender
4. Configure a **API Key** na aba **Detalhes**
5. Vá na aba **Relatórios**
6. Clique em **Gerar Relatório**
7. Escolha **Malware Status**
8. Configure e clique em **Gerar**
9. Aguarde 15-30 segundos
10. Faça download do PDF

✅ **Se o download funcionou, está tudo OK!**

---

## 🐛 Troubleshooting

### Problema: Build Falha

**Sintoma:** Erro durante o build da imagem Docker

**Soluções:**
```bash
# Limpar cache do Docker
easypanel prune

# Rebuild forçado
easypanel deploy dashboard-licencas --no-cache

# Verificar logs de build
easypanel logs dashboard-licencas --build
```

### Problema: Storage Não Persiste

**Sintoma:** Relatórios desaparecem após redeploy

**Solução:**
```bash
# Verificar volume
easypanel volume list

# Recriar volume
easypanel volume create storage
easypanel volume attach storage /var/www/html/storage
```

### Problema: Cron Não Executa

**Sintoma:** Agendamentos não são executados

**Soluções:**
```bash
# Verificar se cron está rodando
easypanel exec dashboard-licencas ps aux | grep cron

# Reiniciar cron
easypanel exec dashboard-licencas service cron restart

# Ver logs
easypanel exec dashboard-licencas tail -f /var/log/bitdefender/cron.log

# Executar manualmente para testar
easypanel exec dashboard-licencas php /var/www/html/cron_execute_report_schedules.php
```

### Problema: Erro de Permissão

**Sintoma:** "Permission denied" ao gerar relatório

**Soluções:**
```bash
# Ajustar permissões do storage
easypanel exec dashboard-licencas chown -R www-data:www-data /var/www/html/storage
easypanel exec dashboard-licencas chmod -R 755 /var/www/html/storage

# Recriar diretórios
easypanel exec dashboard-licencas mkdir -p /var/www/html/storage/reports/bitdefender
easypanel exec dashboard-licencas chown www-data:www-data /var/www/html/storage/reports/bitdefender
```

### Problema: Erro 500 ao Gerar Relatório

**Sintoma:** Erro interno do servidor

**Soluções:**
1. Ver logs do Apache:
   ```bash
   easypanel logs dashboard-licencas --tail 100
   ```

2. Ver logs do PHP:
   ```bash
   easypanel exec dashboard-licencas tail -f /var/log/apache2/error.log
   ```

3. Verificar tabelas do banco:
   ```sql
   SELECT * FROM bitdefender_reports ORDER BY id DESC LIMIT 5;
   ```

---

## 📊 Monitoramento

### Logs Importantes

```bash
# Logs gerais do Apache
easypanel logs dashboard-licencas

# Logs de cron (agendamentos)
easypanel exec dashboard-licencas tail -f /var/log/bitdefender/cron.log

# Logs de erro do PHP
easypanel exec dashboard-licencas tail -f /var/log/apache2/error.log
```

### Métricas

```bash
# Uso de disco (relatórios)
easypanel exec dashboard-licencas du -sh /var/www/html/storage/reports/bitdefender

# Número de relatórios gerados
easypanel exec dashboard-licencas bash -c "ls -1 /var/www/html/storage/reports/bitdefender | wc -l"

# Ver processos ativos
easypanel exec dashboard-licencas ps aux
```

---

## 🔒 Segurança

### Checklist de Segurança Pós-Deploy

- [ ] ✅ HTTPS configurado (Let's Encrypt)
- [ ] ✅ Firewall configurado (apenas porta 80/443)
- [ ] ✅ Variáveis sensíveis em ENV (não hardcoded)
- [ ] ✅ API Keys armazenadas de forma segura no banco
- [ ] ✅ Backup automático do banco configurado
- [ ] ✅ Backup do volume storage configurado
- [ ] ✅ Monitoramento de logs ativo

---

## 📈 Performance

### Otimizações Recomendadas

1. **Aumentar Recursos (se necessário)**
   - CPU: 2 vCPUs recomendados
   - RAM: 2GB mínimo, 4GB recomendado
   - Disco: 20GB para relatórios

2. **Configurar Limpeza Automática**
   
   Crie um cron adicional para limpar relatórios antigos:
   
   ```bash
   # Limpar relatórios com mais de 90 dias
   0 2 * * * /usr/local/bin/php /var/www/html/cleanup_old_reports.php
   ```

3. **Configurar Cache**
   
   Adicione cache no Apache (já configurado no Dockerfile)

---

## ✅ Checklist Final

Após o deploy, verifique:

- [ ] ✅ Site acessível via HTTPS
- [ ] ✅ Login funciona
- [ ] ✅ Licenças Bitdefender listadas
- [ ] ✅ API Key configurada em pelo menos 1 cliente
- [ ] ✅ Aba "Relatórios" aparece no modal de detalhes
- [ ] ✅ Gerar relatório instantâneo funciona
- [ ] ✅ Download de PDF funciona
- [ ] ✅ Download de CSV funciona
- [ ] ✅ Lista de relatórios mostra relatórios gerados
- [ ] ✅ Criar agendamento funciona
- [ ] ✅ Cron está rodando (verificar logs)
- [ ] ✅ Storage persiste entre deploys

---

## 🎉 Deploy Concluído!

O sistema está rodando com:

- ✅ **Frontend React** compilado e otimizado
- ✅ **Backend PHP** com todas as APIs
- ✅ **Sistema de Relatórios** completo
- ✅ **Agendamentos Automáticos** via cron
- ✅ **Storage Persistente** para PDFs/CSVs
- ✅ **Health Checks** configurados
- ✅ **Logs** estruturados

### Próximos Passos

1. Configure API Keys para todos os clientes
2. Crie agendamentos semanais/mensais
3. Configure notificações por email (opcional)
4. Monitore logs de cron regularmente
5. Configure backup automático do storage

---

## 📞 Suporte

**Logs importantes:**
- Aplicação: `easypanel logs dashboard-licencas`
- Cron: `tail -f /var/log/bitdefender/cron.log`
- Apache: `tail -f /var/log/apache2/error.log`

**Documentação:**
- [README Completo](BITDEFENDER_REPORTS_README.md)
- [Instalação Rápida](INSTALACAO_RAPIDA_RELATORIOS.md)

---

**Tempo total de deploy:** ~15-20 minutos  
**Versão do Sistema:** 2.0  
**Data:** 26 de agosto de 2026

**🚀 Sistema pronto para produção!**
