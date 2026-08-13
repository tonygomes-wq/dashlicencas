# 📊 Dados Sincronizados pela API FortiGate

## 🎯 O Que a API FortiGate Sincroniza

Quando você clica em **"Sincronizar"** no modal de detalhes de um dispositivo FortiGate, a API busca informações atualizadas diretamente do dispositivo e atualiza as seguintes colunas na tabela:

---

## 📋 Colunas Atualizadas na Tabela Principal

### ✅ Informações Básicas (Tabela `fortigate_devices`):

| Coluna | Descrição | Exemplo | Atualizado? |
|--------|-----------|---------|-------------|
| **cliente** | Nome do cliente | PEGORARO | ❌ Não (manual) |
| **email** | Email do cliente | - | ❌ Não (manual) |
| **serial** | Número de série | FGT40FTK21005916 | ✅ Sim (da API) |
| **modelo** | Modelo do dispositivo | FortiGate 40F | ✅ Sim (da API) |
| **data_registro** | Data de registro | 03/10/2021 | ❌ Não (manual) |
| **vencimento** | Data de vencimento da licença | 20/09/2026 | ✅ Sim (da API) |
| **status** | Status da licença | OK / VENCIDO | ✅ Sim (calculado) |

---

## 📊 Dados Estendidos (Tabela `fortigate_devices_extended`)

Além da tabela principal, a API também salva dados detalhados em uma tabela separada:

### ✅ Informações do Sistema:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **hostname** | Nome do dispositivo | FGT-PEGORARO |
| **firmware_version** | Versão do firmware | v7.0.12 |
| **serial_number** | Número de série | FGT40FTK21005916 |
| **model** | Modelo | FortiGate-40F |
| **operation_mode** | Modo de operação | NAT |

### ✅ Status Operacional:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **cpu_usage** | Uso de CPU | 15% |
| **memory_usage** | Uso de memória | 45% |
| **disk_usage** | Uso de disco | 12% |
| **session_count** | Sessões ativas | 1250 |
| **uptime** | Tempo ligado | 45 dias |

### ✅ Licenças:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **license_status** | Status geral | Valid |
| **antivirus_expiry** | Vencimento Antivírus | 2026-09-20 |
| **ips_expiry** | Vencimento IPS | 2026-09-20 |
| **web_filtering_expiry** | Vencimento Web Filter | 2026-09-20 |
| **forticare_expiry** | Vencimento FortiCare | 2026-09-20 |

### ✅ Informações de Rede:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **wan_ip** | IP WAN | 200.150.10.50 |
| **lan_ip** | IP LAN | 192.168.1.1 |
| **vpn_tunnels** | Túneis VPN ativos | 3 |

---

## 🔄 Fluxo de Sincronização

### 1️⃣ **Antes da Sincronização:**
```
Tabela mostra dados antigos ou incompletos:
- Serial: FGT40FTK21005916
- Modelo: FortiGate 40F
- Vencimento: 20/09/2026 (pode estar desatualizado)
- Status: OK (pode estar incorreto)
```

### 2️⃣ **Durante a Sincronização:**
```
1. Frontend envia: POST /app_fortigate_api.php?action=sync_device
2. Backend conecta no FortiGate via API REST
3. Busca informações atualizadas:
   - GET /api/v2/monitor/system/status
   - GET /api/v2/monitor/license/status
   - GET /api/v2/monitor/system/resource/usage
4. Atualiza banco de dados
5. Retorna sucesso
```

### 3️⃣ **Após a Sincronização:**
```
Tabela mostra dados atualizados:
- Serial: FGT40FTK21005916 ✅
- Modelo: FortiGate-40F ✅
- Vencimento: 20/09/2026 ✅ (confirmado)
- Status: OK ✅ (calculado corretamente)
- CPU: 15% ✅ (novo)
- Memória: 45% ✅ (novo)
- Firmware: v7.0.12 ✅ (novo)
```

---

## 🎨 Indicadores Visuais na Tabela

### Coluna "API":
- 🔧 **Ícone de Engrenagem** - Abre configuração da API
- 🔄 **Ícone de Sincronização** - Sincroniza manualmente

### Coluna "Status":
- 🟢 **OK** - Licença válida (mais de 30 dias)
- 🟡 **EXPIRANDO** - Licença expira em menos de 30 dias
- 🔴 **VENCIDO** - Licença expirada

---

## 📈 Dados Que NÃO São Atualizados

Alguns dados permanecem manuais e **não são alterados** pela sincronização:

| Campo | Por Que Não Atualiza |
|-------|---------------------|
| **Cliente** | Nome do cliente é definido manualmente |
| **Email** | Email de contato é manual |
| **Data de Registro** | Data de quando foi cadastrado no sistema |
| **Observações** | Notas manuais do usuário |

---

## 🔍 Como Ver os Dados Sincronizados

### Opção 1: Modal de Detalhes
1. Clique em um dispositivo na tabela
2. Modal abre com informações básicas
3. Clique em "Sincronizar"
4. Dados são atualizados

### Opção 2: Dados Estendidos (Futuro)
Você pode adicionar uma aba "Detalhes Técnicos" no modal que mostra:
- CPU, Memória, Disco
- Firmware, Uptime
- IPs, VPNs
- Licenças detalhadas

---

## 🚨 Alertas Automáticos

A sincronização também cria **alertas automáticos** quando detecta:

### ⚠️ Alertas de Licença:
- Licença expirando em 30 dias
- Licença expirando em 7 dias
- Licença expirada

### ⚠️ Alertas de Sistema:
- CPU acima de 80%
- Memória acima de 90%
- Disco acima de 85%

### ⚠️ Alertas de Conectividade:
- Dispositivo offline
- Túnel VPN down
- Interface WAN down

---

## 📊 Exemplo de Sincronização Completa

### Antes:
```
Cliente: PEGORARO
Serial: FGT40FTK21005916
Modelo: FortiGate 40F
Vencimento: 20/09/2026
Status: OK
```

### Depois (com API configurada):
```
Cliente: PEGORARO
Serial: FGT40FTK21005916
Modelo: FortiGate-40F ✅ (atualizado)
Vencimento: 20/09/2026 ✅ (confirmado)
Status: OK ✅ (calculado)

Dados Estendidos:
- Hostname: FGT-PEGORARO
- Firmware: v7.0.12
- CPU: 15%
- Memória: 45%
- Uptime: 45 dias
- WAN IP: 200.150.10.50
- Licenças:
  ✅ Antivírus: 20/09/2026
  ✅ IPS: 20/09/2026
  ✅ Web Filter: 20/09/2026
  ✅ FortiCare: 20/09/2026
```

---

## 🔧 Configuração Necessária

Para que a sincronização funcione, você precisa:

1. ✅ **API Token** - Gerado no FortiGate
2. ✅ **API IP/Hostname** - Endereço do FortiGate
3. ✅ **Porta** - Padrão: 443 (HTTPS)
4. ✅ **Permissões** - Token com acesso de leitura

---

## 📁 Tabelas do Banco de Dados

### `fortigate_devices` (Principal):
```sql
- id
- cliente (manual)
- email (manual)
- serial (API)
- modelo (API)
- data_registro (manual)
- vencimento (API)
- status (calculado)
- api_token (configuração)
- api_ip (configuração)
```

### `fortigate_devices_extended` (Detalhes):
```sql
- device_id (FK)
- hostname (API)
- firmware_version (API)
- cpu_usage (API)
- memory_usage (API)
- disk_usage (API)
- session_count (API)
- uptime (API)
- license_status (API)
- antivirus_expiry (API)
- ips_expiry (API)
- web_filtering_expiry (API)
- forticare_expiry (API)
- wan_ip (API)
- lan_ip (API)
- vpn_tunnels (API)
- last_sync_at (timestamp)
```

### `fortigate_sync_history` (Histórico):
```sql
- id
- device_id
- sync_status (success/failed)
- sync_message
- synced_at
```

### `fortigate_alerts` (Alertas):
```sql
- id
- device_id
- alert_type
- severity (critical/warning/info)
- message
- is_resolved
- created_at
```

---

## ✅ Resumo

**Dados Atualizados pela API:**
- ✅ Serial
- ✅ Modelo
- ✅ Vencimento
- ✅ Status (calculado)
- ✅ Firmware
- ✅ CPU/Memória/Disco
- ✅ Licenças detalhadas
- ✅ IPs e VPNs

**Dados Manuais (não atualizados):**
- ❌ Cliente
- ❌ Email
- ❌ Data de Registro
- ❌ Observações

**Benefícios:**
- 🎯 Dados sempre atualizados
- ⚠️ Alertas automáticos
- 📊 Monitoramento em tempo real
- 📈 Histórico de sincronizações

---

**Configure a API FortiGate e mantenha seus dados sempre atualizados!** 🚀
