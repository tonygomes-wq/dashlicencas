# Integração FortiGate REST API - Análise e Implementação

## Visão Geral da API FortiGate

A API REST do FortiOS permite administração completa do FortiGate através de endpoints HTTP. A API é dividida em três categorias principais:

1. **Configuration API** - Configuração de settings
2. **Log API** - Acesso a logs
3. **Monitor API** - Monitoramento e estatísticas

## Endpoints Relevantes Identificados

### 1. Status do Sistema
**Endpoint:** `/api/v2/monitor/system/status`
- Informações gerais do dispositivo
- Serial number
- Versão do FortiOS
- Hostname
- Status da licença

### 2. Status de Licenças
**Endpoint:** `/api/v2/monitor/license/status`
- Lista todas as licenças FortiGuard
- Status de cada serviço (Antivirus, IPS, Web Filtering, etc.)
- Data de expiração (em formato epoch)
- Tipo de licença

**Exemplo de resposta:**
```json
{
  "results": {
    "forticare": {
      "status": "registered",
      "expiration": 1797552000
    },
    "antivirus": {
      "status": "valid",
      "expiration": 1797552000
    },
    "ips": {
      "status": "valid",
      "expiration": 1797552000
    }
  }
}
```

### 3. Informações de VPN
**Endpoint:** `/api/v2/monitor/vpn/ssl`
- Status de conexões VPN
- Usuários conectados
- Túneis ativos

### 4. Performance SLA
**Endpoint:** `/api/v2/monitor/system/sla`
- Monitoramento de performance
- Latência
- Jitter
- Perda de pacotes

### 5. Registro de Licença
**Endpoint:** `/api/v2/monitor/registration/forticare/add-license`
- Adicionar nova licença via API
- Ativar serviços

## Funcionalidades Implementáveis no Dashboard

### 1. Sincronização Automática de Licenças ✅ PRIORITÁRIO
**Benefício:** Atualização automática dos dados de licenças sem entrada manual

**Implementação:**
```php
// app_fortigate_sync.php
class FortigateSync {
    private $apiUrl;
    private $apiToken;
    
    public function syncLicenses($clientId, $fortigateIp, $apiToken) {
        // 1. Buscar status do sistema
        $systemStatus = $this->getSystemStatus($fortigateIp, $apiToken);
        
        // 2. Buscar status de licenças
        $licenseStatus = $this->getLicenseStatus($fortigateIp, $apiToken);
        
        // 3. Atualizar banco de dados
        $this->updateDatabase($clientId, $systemStatus, $licenseStatus);
    }
    
    private function getSystemStatus($ip, $token) {
        $url = "https://{$ip}/api/v2/monitor/system/status";
        // Fazer requisição com token
        return $this->makeRequest($url, $token);
    }
    
    private function getLicenseStatus($ip, $token) {
        $url = "https://{$ip}/api/v2/monitor/license/status";
        return $this->makeRequest($url, $token);
    }
}
```

### 2. Dashboard com Estatísticas em Tempo Real ✅ PRIORITÁRIO
**Benefício:** Visualização instantânea do status de todos os FortiGates

**Dados a exibir:**
- Total de dispositivos
- Dispositivos online/offline
- Licenças vencidas/expirando
- Versão do FortiOS
- Uptime
- CPU/Memória (se disponível)

### 3. Alertas Automáticos 🔔
**Benefício:** Notificação proativa de problemas

**Alertas:**
- Licença expirando em X dias
- Dispositivo offline
- Versão do FortiOS desatualizada
- Falha na sincronização

### 4. Histórico de Sincronizações 📊
**Benefício:** Rastreabilidade e auditoria

**Dados:**
- Data/hora da última sincronização
- Status (sucesso/falha)
- Mudanças detectadas
- Logs de erro

### 5. Gestão de Credenciais API 🔐
**Benefício:** Armazenamento seguro de tokens

**Implementação:**
- Tabela `fortigate_api_credentials`
- Criptografia de tokens
- Teste de conectividade
- Rotação de tokens

## Estrutura de Banco de Dados Proposta

### Tabela: `fortigate_devices_extended`
```sql
CREATE TABLE fortigate_devices_extended (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    api_enabled BOOLEAN DEFAULT FALSE,
    api_ip VARCHAR(255),
    api_token_encrypted TEXT,
    last_sync_at DATETIME,
    last_sync_status ENUM('success', 'failed', 'pending'),
    last_sync_error TEXT,
    fortios_version VARCHAR(50),
    hostname VARCHAR(255),
    uptime_seconds BIGINT,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    forticare_status VARCHAR(50),
    forticare_expiration DATETIME,
    antivirus_status VARCHAR(50),
    antivirus_expiration DATETIME,
    ips_status VARCHAR(50),
    ips_expiration DATETIME,
    web_filtering_status VARCHAR(50),
    web_filtering_expiration DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE
);
```

### Tabela: `fortigate_sync_history`
```sql
CREATE TABLE fortigate_sync_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    sync_started_at DATETIME,
    sync_completed_at DATETIME,
    status ENUM('success', 'failed', 'timeout'),
    error_message TEXT,
    changes_detected JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE
);
```

## Fluxo de Sincronização Proposto

```
1. Usuário configura credenciais API para um FortiGate
   ↓
2. Sistema testa conectividade
   ↓
3. Sincronização manual ou agendada (cron)
   ↓
4. API busca dados do FortiGate
   ↓
5. Sistema compara com dados atuais
   ↓
6. Atualiza banco de dados
   ↓
7. Gera alertas se necessário
   ↓
8. Registra histórico
```

## Interface do Usuário Proposta

### 1. Página de Configuração de API
- Formulário para adicionar IP e Token
- Botão "Testar Conexão"
- Lista de dispositivos configurados
- Status da última sincronização

### 2. Card no Dashboard
```
┌─────────────────────────────────┐
│ 🔥 FortiGate - Status API       │
├─────────────────────────────────┤
│ Dispositivos Sincronizados: 15  │
│ Última Sincronização: 5 min     │
│ Licenças Expirando: 3           │
│ Dispositivos Offline: 1         │
│                                 │
│ [Sincronizar Agora] [Detalhes] │
└─────────────────────────────────┘
```

### 3. Tabela Fortigate com Indicadores
- Ícone de status API (verde/vermelho/cinza)
- Tooltip com última sincronização
- Botão "Sincronizar" por dispositivo
- Coluna "Versão FortiOS"
- Coluna "Uptime"

## Segurança

### Armazenamento de Tokens
- Usar criptografia AES-256
- Chave de criptografia em variável de ambiente
- Nunca expor tokens no frontend

### Validação de IP
- Whitelist de IPs permitidos
- Validação de formato IPv4/IPv6
- Timeout de conexão configurável

### Rate Limiting
- Limitar requisições por minuto
- Evitar sobrecarga do FortiGate
- Implementar retry com backoff exponencial

## Cronograma de Implementação

### Fase 1: Infraestrutura (1-2 dias)
- [ ] Criar tabelas no banco
- [ ] Implementar criptografia de tokens
- [ ] Criar classe PHP para API FortiGate

### Fase 2: Backend (2-3 dias)
- [ ] Endpoint para configurar API
- [ ] Endpoint para testar conexão
- [ ] Endpoint para sincronizar manualmente
- [ ] Cron job para sincronização automática

### Fase 3: Frontend (2-3 dias)
- [ ] Página de configuração de API
- [ ] Card de estatísticas no dashboard
- [ ] Indicadores na tabela FortiGate
- [ ] Modal de histórico de sincronização

### Fase 4: Alertas (1-2 dias)
- [ ] Sistema de notificações
- [ ] Email de alertas
- [ ] Badge de notificações no header

## Referências

- [FortiOS REST API Documentation](https://docs.fortinet.com/document/fortigate/7.2.0/secgw-for-mobile-networks-deployment/238243/fortios-rest-api)
- [FortiGate License Status API](https://community.fortinet.com/t5/Support-Forum/FortiGate-FortiManager-Rest-API-call-for-license-expiration-date/td-p/392553)
- [FortiGate System Status](https://docs.fortinet.com/document/fortigate/7.0.0/administration-guide/308474/status-dashboard)

---

**Nota:** A implementação completa requer acesso aos dispositivos FortiGate para testes. Recomenda-se começar com um ambiente de teste antes de implementar em produção.
