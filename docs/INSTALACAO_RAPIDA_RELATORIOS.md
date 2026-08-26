# 🚀 Instalação Rápida - Sistema de Relatórios Bitdefender

**Tempo estimado:** 10-15 minutos

---

## ✅ Checklist de Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Acesso ao banco de dados MySQL
- [ ] Permissões de escrita na pasta do projeto
- [ ] API Key do Bitdefender GravityZone
- [ ] PHP 7.4+ com extensões: curl, json, zip, pdo_mysql
- [ ] Servidor web (Apache/Nginx)

---

## 📥 Passo 1: Importar Schema do Banco (2 min)

### Opção A: Via Terminal
```bash
cd /caminho/para/projeto
mysql -u usuario -p database_name < docs/db_bitdefender_reports.sql
```

### Opção B: Via phpMyAdmin
1. Acesse phpMyAdmin
2. Selecione o banco de dados
3. Clique em "Importar"
4. Escolha o arquivo `docs/db_bitdefender_reports.sql`
5. Clique em "Executar"

### Verificar Instalação
```sql
-- Deve retornar 3 tabelas
SHOW TABLES LIKE 'bitdefender_report%';

-- Deve retornar 2 views
SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_database_name LIKE '%bitdefender%';

-- Deve retornar 2 procedures
SHOW PROCEDURE STATUS WHERE Db = 'database_name' AND Name LIKE '%report%';
```

✅ **Resultado esperado:** 3 tabelas, 2 views, 2 procedures

---

## 📁 Passo 2: Criar Diretório de Storage (1 min)

```bash
# Criar pasta
mkdir -p storage/reports/bitdefender

# Dar permissões
chmod 755 storage/reports/bitdefender

# Se estiver usando Apache
chown www-data:www-data storage/reports/bitdefender

# Se estiver usando Nginx
chown nginx:nginx storage/reports/bitdefender
```

### Verificar Permissões
```bash
ls -la storage/reports/
```

✅ **Resultado esperado:** `drwxr-xr-x 2 www-data www-data`

---

## 🔧 Passo 3: Verificar Arquivos PHP (1 min)

Certifique-se de que estes arquivos existem:

```bash
ls -l app_bitdefender_reports.php
ls -l app_bitdefender_api.php
ls -l src/components/BitdefenderGenerateReportModal.tsx
ls -l src/components/BitdefenderReportsListModal.tsx
ls -l src/components/BitdefenderScheduleReportModal.tsx
ls -l src/components/DetailSidebar.tsx
```

✅ **Resultado esperado:** Todos os arquivos presentes

---

## 🔑 Passo 4: Configurar API Key (3 min)

### 4.1. Obter API Key do Bitdefender

1. Acesse https://cloud.gravityzone.bitdefender.com
2. Clique no ícone do usuário (canto superior direito)
3. **My Account** → **API keys** → **Add**
4. Configure:
   - **Name**: `Dashboard Integration`
   - **Type**: `API Key`
   - **Permissions**: Marque todas ou pelo menos:
     - ✅ Reports
     - ✅ Network
     - ✅ Scanning
5. Copie a API Key gerada (formato: `xxx...xxx`)

### 4.2. Configurar no Dashboard

1. Acesse seu dashboard
2. Clique em uma licença Bitdefender
3. Na aba **Detalhes**, role até o final
4. Preencha:
   - **API Key do Cliente**: Cole a API Key
   - **Access URL do Cliente**: `https://cloud.gravityzone.bitdefender.com/api`
5. Clique em **Salvar Alterações**

### 4.3. Testar Conexão

No dashboard, clique em **Sincronizar** na mesma janela.

✅ **Resultado esperado:** "Sincronizado com sucesso!"

---

## ⏰ Passo 5: Configurar Cron (Opcional - 3 min)

**Necessário apenas se quiser usar agendamentos automáticos.**

### 5.1. Criar Arquivo de Cron

Crie o arquivo `cron_execute_report_schedules.php` na raiz:

```php
<?php
/**
 * Cron Job: Executar Agendamentos de Relatórios
 * Executa a cada 5 minutos
 */

require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_bitdefender_api.php';

echo "[" . date('Y-m-d H:i:s') . "] Iniciando execução de agendamentos...\n";

try {
    // Buscar agendamentos prontos para executar
    $stmt = $pdo->query("
        SELECT * FROM bitdefender_report_schedules
        WHERE is_active = 1
        AND next_execution_at <= NOW()
        ORDER BY next_execution_at ASC
    ");
    
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Encontrados " . count($schedules) . " agendamento(s) para executar\n";
    
    foreach ($schedules as $schedule) {
        echo "\n--- Processando agendamento #{$schedule['id']} ---\n";
        
        try {
            // Buscar cliente
            $client = getClient($pdo, $schedule['client_id']);
            if (!$client || !$client['client_api_key']) {
                throw new Exception("Cliente sem API Key configurada");
            }
            
            echo "Cliente: {$client['company']}\n";
            echo "Tipo: {$schedule['report_type_name']}\n";
            
            // Criar API
            $api = new BitdefenderAPI(
                $client['client_api_key'],
                $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api'
            );
            
            // Preparar parâmetros
            $reportParams = json_decode($schedule['custom_params'], true) ?: [];
            $reportParams['reportingInterval'] = $schedule['reporting_interval'];
            
            if ($schedule['report_type'] == 12) {
                $reportParams['filterType'] = $schedule['filter_type'];
                if ($schedule['detailed_export']) {
                    $reportParams['detailedExport'] = [1];
                }
            }
            
            // Criar relatório
            echo "Criando relatório...\n";
            $result = $api->createReport($schedule['report_type'], $reportParams);
            
            if (!isset($result['reportId'])) {
                throw new Exception("Resposta inválida da API");
            }
            
            // Salvar no banco
            $reportStmt = $pdo->prepare("
                INSERT INTO bitdefender_reports (
                    client_id, user_id, report_name, report_type, report_type_name,
                    status, generation_mode, reporting_interval, bitdefender_report_id,
                    generation_started_at, generation_completed_at
                ) VALUES (?, 1, ?, ?, ?, 'ready', 'scheduled', ?, ?, NOW(), NOW())
            ");
            
            $reportStmt->execute([
                $schedule['client_id'],
                $schedule['schedule_name'] . ' - ' . date('d/m/Y'),
                $schedule['report_type'],
                $schedule['report_type_name'],
                $schedule['reporting_interval'],
                $result['reportId']
            ]);
            
            $reportId = $pdo->lastInsertId();
            
            // Marcar execução como sucesso
            $pdo->query("CALL sp_mark_schedule_execution({$schedule['id']}, $reportId, 'success', NULL)");
            
            echo "✅ Sucesso! Relatório ID: $reportId\n";
            
        } catch (Exception $e) {
            // Registrar falha
            $errorMsg = $pdo->quote($e->getMessage());
            $pdo->query("CALL sp_mark_schedule_execution({$schedule['id']}, NULL, 'failed', $errorMsg)");
            
            echo "❌ Erro: {$e->getMessage()}\n";
        }
    }
    
    echo "\n[" . date('Y-m-d H:i:s') . "] Execução concluída!\n";
    echo "Total processado: " . count($schedules) . " agendamento(s)\n";
    
} catch (Exception $e) {
    echo "ERRO FATAL: {$e->getMessage()}\n";
    exit(1);
}

function getClient($pdo, $clientId) {
    $stmt = $pdo->prepare("SELECT * FROM bitdefender_licenses WHERE id = ?");
    $stmt->execute([$clientId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
```

### 5.2. Dar Permissões

```bash
chmod +x cron_execute_report_schedules.php
```

### 5.3. Configurar Crontab

```bash
crontab -e
```

Adicione:

```bash
# Executar agendamentos de relatórios Bitdefender a cada 5 minutos
*/5 * * * * /usr/bin/php /caminho/completo/para/projeto/cron_execute_report_schedules.php >> /var/log/bitdefender_reports_cron.log 2>&1
```

### 5.4. Testar Manualmente

```bash
php cron_execute_report_schedules.php
```

✅ **Resultado esperado:** "Execução concluída!"

---

## 🧪 Passo 6: Testar Funcionamento (5 min)

### Teste 1: Gerar Relatório Instantâneo

1. Acesse o dashboard
2. Clique em uma licença Bitdefender (que tem API Key configurada)
3. Vá na aba **Relatórios**
4. Clique em **Relatório de Malware Status**
5. Configure:
   - Nome: "Teste de Relatório"
   - Período: "Este Mês"
   - Filtro: "Todos os endpoints"
6. Clique em **Gerar Relatório**
7. Aguarde 15-30 segundos

✅ **Resultado esperado:** 
- Tela de sucesso
- Botões de download PDF e CSV disponíveis

### Teste 2: Download

1. Clique em **Download PDF**
2. Arquivo deve ser baixado automaticamente

✅ **Resultado esperado:** PDF baixado com dados do Bitdefender

### Teste 3: Listar Relatórios

1. Na aba Relatórios, clique em **Ver Todos**
2. Deve aparecer o relatório que você acabou de criar

✅ **Resultado esperado:** Lista com 1 relatório

### Teste 4: Criar Agendamento (Opcional)

1. Na aba Relatórios, clique em **Configurar Agendamento**
2. Clique em **Novo Agendamento**
3. Preencha:
   - Nome: "Teste Semanal"
   - Tipo: Malware Status
   - Frequência: Semanalmente
   - Dia: Segunda-feira
   - Horário: 08:00
4. Clique em **Salvar Agendamento**

✅ **Resultado esperado:** Agendamento criado na lista

---

## ❗ Troubleshooting Rápido

### Erro: "Cliente não possui API Key configurada"
**Solução:** Configure a API Key na aba Detalhes da licença

### Erro: "Erro HTTP 401"
**Solução:** API Key inválida. Gere uma nova no GravityZone

### Erro: "Failed to open stream: Permission denied"
**Solução:** 
```bash
chmod 755 storage/reports/bitdefender
chown www-data:www-data storage/reports/bitdefender
```

### Erro: "Table 'bitdefender_reports' doesn't exist"
**Solução:** Executar novamente o schema SQL:
```bash
mysql -u usuario -p database < docs/db_bitdefender_reports.sql
```

### Relatório fica em "Gerando" indefinidamente
**Soluções:**
1. Verificar logs: `tail -f /var/log/apache2/error.log`
2. Testar API manualmente:
   ```bash
   curl -X POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/reporting \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic $(echo -n 'SUA_API_KEY:' | base64)" \
     -d '{"jsonrpc":"2.0","method":"getReportsList","params":{},"id":1}'
   ```

---

## 📊 Verificação Final

Execute estas queries para confirmar que tudo está OK:

```sql
-- 1. Verificar tabelas criadas
SELECT COUNT(*) as total FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name LIKE 'bitdefender_report%';
-- Deve retornar: 3

-- 2. Verificar views criadas
SELECT COUNT(*) as total FROM information_schema.views 
WHERE table_schema = DATABASE() 
AND table_name LIKE '%bitdefender%report%';
-- Deve retornar: 2

-- 3. Verificar stored procedures
SELECT COUNT(*) as total FROM information_schema.routines 
WHERE routine_schema = DATABASE() 
AND routine_name LIKE '%report%';
-- Deve retornar: 2

-- 4. Testar permissões de escrita
SELECT @@global.secure_file_priv;
-- Deve retornar vazio ou NULL (permissão total)
```

### Checklist Final

- [ ] ✅ 3 tabelas criadas
- [ ] ✅ 2 views criadas
- [ ] ✅ 2 stored procedures criadas
- [ ] ✅ Pasta storage com permissões corretas
- [ ] ✅ API Key configurada
- [ ] ✅ Teste de relatório funcionou
- [ ] ✅ Download de PDF funcionou
- [ ] ✅ (Opcional) Cron configurado

---

## 🎉 Pronto!

O sistema de relatórios está instalado e funcional!

### Próximos Passos

1. Configure API Keys para todos os clientes
2. Crie agendamentos automáticos para relatórios recorrentes
3. Configure notificações por email
4. Explore outros tipos de relatórios disponíveis

### Documentação Completa

Para informações detalhadas, consulte:
- [README Completo](BITDEFENDER_REPORTS_README.md)
- [Documentação da API Bitdefender](https://www.bitdefender.com/business/support/en/77209-376009-gravityzone-api.html)

---

## 📞 Suporte

Em caso de problemas:

1. Verifique os logs: `/var/log/apache2/error.log`
2. Ative debug mode na classe `BitdefenderAPI`
3. Consulte a tabela `bitdefender_reports` campo `error_message`

**Tempo total de instalação:** ~10-15 minutos ✅

**Desenvolvido com ❤️ pela equipe de desenvolvimento**
