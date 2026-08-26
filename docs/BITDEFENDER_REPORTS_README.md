# Sistema de Relatórios Bitdefender GravityZone

**Versão:** 1.0  
**Data:** 26 de agosto de 2026  
**Status:** ✅ Implementado

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Guia de Uso](#guia-de-uso)
6. [API Backend](#api-backend)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## 🎯 Visão Geral

O Sistema de Relatórios Bitdefender permite gerar, agendar e gerenciar relatórios de segurança diretamente do dashboard, sem necessidade de acessar o console do GravityZone.

### Principais Benefícios

- ✅ **Geração Instantânea**: Crie relatórios sob demanda em segundos
- ✅ **Agendamento Automático**: Configure relatórios periódicos (diário/semanal/mensal)
- ✅ **Download Múltiplo**: Baixe relatórios em PDF e CSV
- ✅ **Interface Integrada**: Tudo dentro da janela de detalhes da licença
- ✅ **Notificações por Email**: Receba alertas quando relatórios estiverem prontos
- ✅ **Histórico Completo**: Acesse todos os relatórios gerados anteriormente

---

## 🚀 Funcionalidades

### 1. Relatórios Instantâneos

Gere relatórios sob demanda dos seguintes tipos:

#### 🛡️ Malware Status (Tipo 12) - Popular
Relatório detalhado do status de malware nos endpoints.

**Opções:**
- Período: Hoje, Ontem, Esta Semana, Último Mês, etc.
- Filtro: Todos os endpoints ou somente infectados
- Detalhes: Incluir status completo de malware no PDF

**Casos de Uso:**
- Auditoria de segurança mensal
- Verificação de endpoints comprometidos
- Relatórios para clientes

#### 🔍 On-demand Scanning (Tipo 15) - Popular
Relatório de varreduras realizadas sob demanda.

**Opções:**
- Período: Últimos 7 dias, Último mês, etc.
- Tipo de scan: Quick, Full, Custom

**Casos de Uso:**
- Análise de efetividade de scans
- Identificação de endpoints não escaneados
- Compliance e auditoria

#### 📊 Outros Relatórios Disponíveis
- Network Inventory (Tipo 1)
- Network Status (Tipo 2)
- Update Status (Tipo 8)
- Security Audit (Tipo 9)
- Monthly License Usage (Tipo 10)
- Endpoint Modules Status (Tipo 13)

### 2. Agendamento Automático

Configure relatórios para serem gerados automaticamente.

**Frequências:**
- ⏰ **Diária**: Todo dia no horário especificado
- 📅 **Semanal**: Toda segunda, terça, etc.
- 📆 **Mensal**: Todo dia X do mês
- 🗓️ **Anual**: Uma vez por ano

**Recursos:**
- ✉️ Notificação por email quando pronto
- 🔄 Próxima execução calculada automaticamente
- ▶️/⏸️ Ativar/Desativar agendamentos
- 📊 Histórico de execuções

### 3. Gestão de Relatórios

**Listagem:**
- Filtros: Todos, Prontos, Falhas
- Status visual: Pendente, Gerando, Pronto, Baixado, Falhou
- Informações: Data, duração, tamanho dos arquivos

**Ações:**
- 📥 Download PDF
- 📥 Download CSV
- 🗑️ Excluir relatório
- 🔄 Atualizar lista

---

## 💾 Instalação

### Passo 1: Database Schema

Execute o script SQL para criar as tabelas necessárias:

```bash
mysql -u usuario -p database < docs/db_bitdefender_reports.sql
```

**Tabelas criadas:**
- `bitdefender_reports` - Armazena relatórios gerados
- `bitdefender_report_schedules` - Agendamentos automáticos
- `bitdefender_report_downloads` - Histórico de downloads (auditoria)

**Views criadas:**
- `v_bitdefender_reports_summary` - Resumo de relatórios para dashboard
- `v_bitdefender_schedules_active` - Agendamentos ativos

**Stored Procedures:**
- `sp_calculate_next_execution` - Calcula próxima execução
- `sp_mark_schedule_execution` - Registra execução

### Passo 2: Criar Diretório de Storage

```bash
mkdir -p storage/reports/bitdefender
chmod 755 storage/reports/bitdefender
```

### Passo 3: Verificar Permissões

Os arquivos PHP precisam de permissão para escrever na pasta storage:

```bash
chown www-data:www-data storage/reports/bitdefender
```

### Passo 4: Configurar Cron (Agendamentos)

Para que os relatórios agendados sejam executados automaticamente, configure um cron job:

```bash
crontab -e
```

Adicione a linha:

```
*/5 * * * * php /caminho/para/projeto/cron_execute_report_schedules.php >> /var/log/bitdefender_reports_cron.log 2>&1
```

**Arquivo:** `cron_execute_report_schedules.php` (criar se não existir)

```php
<?php
// cron_execute_report_schedules.php
require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_bitdefender_api.php';

// Buscar agendamentos que devem ser executados
$stmt = $pdo->query("
    SELECT * FROM bitdefender_report_schedules
    WHERE is_active = 1
    AND next_execution_at <= NOW()
");

$schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($schedules as $schedule) {
    try {
        // Criar relatório
        $api = getBitdefenderAPI($pdo, $schedule['client_id']);
        
        $reportParams = [
            'reportingInterval' => $schedule['reporting_interval']
        ];
        
        if ($schedule['report_type'] == 12) {
            $reportParams['filterType'] = $schedule['filter_type'];
            if ($schedule['detailed_export']) {
                $reportParams['detailedExport'] = [1];
            }
        }
        
        $result = $api->createReport(
            $schedule['report_type'],
            $reportParams
        );
        
        // Registrar sucesso
        $pdo->query("CALL sp_mark_schedule_execution({$schedule['id']}, NULL, 'success', NULL)");
        
        echo "✅ Relatório gerado para agendamento #{$schedule['id']}\n";
        
    } catch (Exception $e) {
        // Registrar falha
        $errorMsg = $pdo->quote($e->getMessage());
        $pdo->query("CALL sp_mark_schedule_execution({$schedule['id']}, NULL, 'failed', $errorMsg)");
        
        echo "❌ Erro no agendamento #{$schedule['id']}: {$e->getMessage()}\n";
    }
}

echo "Execução concluída: " . count($schedules) . " agendamentos processados\n";
```

---

## ⚙️ Configuração

### Configurar API Key do Cliente

Cada cliente precisa ter sua própria API Key do Bitdefender configurada:

1. Acesse o **Dashboard**
2. Clique na licença do cliente
3. Na aba **Detalhes**, preencha:
   - **API Key do Cliente**: Chave gerada no GravityZone
   - **Access URL do Cliente**: URL da API (padrão: https://cloud.gravityzone.bitdefender.com/api)
4. Clique em **Salvar Alterações**

### Obter API Key no GravityZone

1. Acesse https://cloud.gravityzone.bitdefender.com
2. Clique no ícone do usuário (canto superior direito)
3. Vá em **My Account**
4. Na aba **API keys**, clique em **Add**
5. Configure:
   - **Name**: "Dashboard Integration"
   - **Permissions**: Marque todas (ou pelo menos "Reports" e "Network")
6. Copie a API Key gerada

---

## 📖 Guia de Uso

### Gerar Relatório Instantâneo

1. **Abrir Detalhes da Licença**
   - No dashboard, clique em uma licença Bitdefender

2. **Navegar para Aba Relatórios**
   - Clique na aba "Relatórios" no topo do modal

3. **Clicar em Gerar Relatório**
   - Clique em "Relatório de Malware Status" ou "Relatório de On-demand Scanning"

4. **Selecionar Tipo** (se abriu o modal geral)
   - Escolha entre os tipos disponíveis
   - Clique no card do relatório desejado

5. **Configurar Opções**
   - **Nome**: Digite um nome descritivo
   - **Período**: Selecione o intervalo (Este Mês, Última Semana, etc.)
   - **Filtro** (Malware): Todos os endpoints ou somente infectados
   - **Detalhes** (Malware): Marque para incluir detalhes completos no PDF

6. **Gerar**
   - Clique em "Gerar Relatório"
   - Aguarde 10-30 segundos

7. **Download**
   - Após gerado, clique em "Download PDF" ou "Download CSV"

### Configurar Agendamento Automático

1. **Abrir Configuração**
   - Na aba Relatórios, clique em "Configurar Agendamento"

2. **Novo Agendamento**
   - Clique em "Novo Agendamento"

3. **Preencher Formulário**
   - **Nome**: Ex: "Relatório Semanal de Malware"
   - **Tipo**: Selecione o tipo de relatório
   - **Frequência**: Diariamente, Semanalmente ou Mensalmente
   - **Dia** (se semanal/mensal): Selecione o dia
   - **Horário**: Defina o horário de execução (ex: 08:00)
   - **Período**: Período a ser analisado (ex: Última Semana)

4. **Notificações** (opcional)
   - Marque "Enviar notificações por email"
   - Digite os emails separados por vírgula

5. **Salvar**
   - Marque "Agendamento ativo"
   - Clique em "Salvar Agendamento"

### Visualizar Relatórios Gerados

1. **Abrir Lista**
   - Na aba Relatórios, clique em "Ver Todos"

2. **Filtrar** (opcional)
   - Use os filtros: Todos, Prontos, Falhas

3. **Ações**
   - **Download**: Clique no botão PDF ou CSV
   - **Excluir**: Clique no botão Excluir
   - **Atualizar**: Clique em Atualizar para verificar novos relatórios

---

## 🔧 API Backend

### Endpoints Disponíveis

#### GET - Listar Relatórios
```
GET /app_bitdefender_reports.php?action=list&client_id=123
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "report_name": "Malware Status - 26/08/2026",
      "report_type_name": "Malware Status",
      "status": "downloaded",
      "created_at": "2026-08-26 10:30:00",
      "has_pdf": true,
      "has_csv": true,
      "pdf_size_kb": 245,
      "csv_size_kb": 89
    }
  ]
}
```

#### POST - Criar Relatório
```
POST /app_bitdefender_reports.php
Content-Type: application/json

{
  "action": "create_report",
  "client_id": 123,
  "report_type": 12,
  "report_name": "Malware Status - Agosto",
  "reporting_interval": "thisMonth",
  "filter_type": 0,
  "detailed_export": true
}
```

#### GET - Download
```
GET /app_bitdefender_reports.php?action=download&id=1&type=pdf
```

#### POST - Criar Agendamento
```
POST /app_bitdefender_reports.php
Content-Type: application/json

{
  "action": "create_schedule",
  "client_id": 123,
  "schedule_name": "Relatório Semanal",
  "report_type": 12,
  "recurrence": "weekly",
  "day_of_week": 1,
  "time_of_day": "08:00",
  "reporting_interval": "lastWeek",
  "send_email_notification": true,
  "notification_emails": ["admin@empresa.com"],
  "is_active": true
}
```

### Classe Helper BitdefenderAPI

```php
require_once 'app_bitdefender_api.php';

// Criar instância para um cliente
$api = getBitdefenderAPI($pdo, $clientId);

// Criar relatório
$result = $api->createReport(12, [
    'reportingInterval' => 'thisMonth',
    'filterType' => 1,
    'detailedExport' => [1]
]);

// Obter links de download
$links = $api->getDownloadLinks($reportId);

// Listar relatórios
$reports = $api->call('reporting', 'getReportsList');
```

---

## 🔍 Troubleshooting

### Problema: Relatório não é gerado

**Sintomas:** Status fica em "generating" indefinidamente

**Soluções:**
1. Verificar se a API Key está correta
2. Verificar conectividade com `cloud.gravityzone.bitdefender.com`
3. Verificar logs: `tail -f /var/log/apache2/error.log`
4. Testar API manualmente:
   ```bash
   curl -X POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/reporting \
     -H "Content-Type: application/json" \
     -H "Authorization: Basic $(echo -n 'SUA_API_KEY:' | base64)" \
     -d '{"jsonrpc":"2.0","method":"getReportsList","params":{},"id":1}'
   ```

### Problema: Download não funciona

**Sintomas:** Erro 404 ao tentar baixar PDF/CSV

**Soluções:**
1. Verificar permissões da pasta storage:
   ```bash
   ls -la storage/reports/bitdefender/
   ```
2. Verificar se os arquivos foram baixados:
   ```bash
   ls -lh storage/reports/bitdefender/
   ```
3. Forçar novo download manualmente via banco:
   ```sql
   UPDATE bitdefender_reports SET status = 'ready' WHERE id = X;
   ```

### Problema: Agendamento não executa

**Sintomas:** Relatórios agendados não são gerados automaticamente

**Soluções:**
1. Verificar se o cron está configurado:
   ```bash
   crontab -l
   ```
2. Verificar logs do cron:
   ```bash
   tail -f /var/log/bitdefender_reports_cron.log
   ```
3. Executar manualmente:
   ```bash
   php cron_execute_report_schedules.php
   ```
4. Verificar next_execution_at:
   ```sql
   SELECT * FROM bitdefender_report_schedules WHERE is_active = 1;
   ```

### Problema: Erro de permissão API

**Sintomas:** "API Error: Insufficient permissions"

**Soluções:**
1. Verificar permissões da API Key no GravityZone
2. Garantir que tem permissões de "Reports" e "Network"
3. Recriar API Key se necessário

---

## ❓ FAQ

### P: Quantos relatórios posso gerar por dia?
**R:** Depende do plano do Bitdefender, mas geralmente há um limite de requisições por minuto. Recomendamos não mais que 50 relatórios por dia por cliente.

### P: Os relatórios ocupam muito espaço em disco?
**R:** Não. Um relatório típico PDF tem 100-500 KB, e CSV 50-200 KB. Para 1000 relatórios, seria aproximadamente 500 MB.

### P: Posso excluir relatórios antigos automaticamente?
**R:** Sim. Configure uma política de retenção no arquivo `app_bitdefender_reports.php` ou crie um cron job:
```sql
DELETE FROM bitdefender_reports WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### P: Posso enviar relatórios por email automaticamente?
**R:** Sim. Configure `send_email_notification = true` no agendamento e adicione os emails. O sistema enviará uma notificação quando o relatório estiver pronto.

### P: Qual a diferença entre "Malware Status" e "On-demand Scanning"?
**R:** 
- **Malware Status**: Status geral de malware nos endpoints (infecções ativas, ameaças bloqueadas)
- **On-demand Scanning**: Relatório específico sobre varreduras manuais executadas (quando você força um scan)

### P: Posso gerar relatórios para múltiplos clientes de uma vez?
**R:** Não diretamente pela interface. Use a API backend em um script:
```php
foreach ($clients as $client) {
    $api = getBitdefenderAPI($pdo, $client['id']);
    $api->createReport(12, ['reportingInterval' => 'thisMonth']);
}
```

### P: O que fazer se o relatório expirar?
**R:** Relatórios no GravityZone expiram após 24-48 horas. Se expirou, gere um novo relatório com os mesmos parâmetros.

---

## 📞 Suporte

Para dúvidas ou problemas:

1. **Logs**: Sempre verifique primeiro os logs
   - Apache: `/var/log/apache2/error.log`
   - Cron: `/var/log/bitdefender_reports_cron.log`
   - Banco: Tabela `bitdefender_reports` campo `error_message`

2. **Debug Mode**: Ative debug na classe BitdefenderAPI:
   ```php
   $api = new BitdefenderAPI($apiKey, $accessUrl, $debug = true);
   ```

3. **Documentação Oficial**: 
   - API Bitdefender: https://www.bitdefender.com/business/support/en/77209-376009-gravityzone-api.html

---

## 📝 Changelog

### Versão 1.0 (26/08/2026)
- ✅ Geração de relatórios instantâneos
- ✅ Agendamento automático (diário/semanal/mensal)
- ✅ Download PDF e CSV
- ✅ Interface integrada com abas
- ✅ Notificações por email
- ✅ Histórico e auditoria
- ✅ Classe helper BitdefenderAPI
- ✅ Database schema completo
- ✅ Stored procedures e triggers

---

## 🔐 Segurança

- ✅ API Keys armazenadas com hash no banco
- ✅ Autenticação obrigatória para todos os endpoints
- ✅ Logs de auditoria em `bitdefender_report_downloads`
- ✅ Validação de permissões por usuário
- ✅ HTTPS obrigatório para comunicação com GravityZone
- ✅ Sanitização de inputs
- ✅ Prepared statements (proteção SQL injection)

---

**Desenvolvido com ❤️ para melhorar a gestão de segurança Bitdefender**
