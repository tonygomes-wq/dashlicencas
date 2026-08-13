# 🔐 Integração com Bitdefender GravityZone API

## 📊 Análise da API Pública do Bitdefender

### O que a API oferece:

A API do Bitdefender GravityZone permite automação completa através de JSON-RPC 2.0:

**APIs Disponíveis:**
- ✅ **Licensing** - Gerenciamento de licenças
- ✅ **Network** - Inventário de dispositivos
- ✅ **Companies** - Gerenciamento de empresas
- ✅ **Policies** - Políticas de segurança
- ✅ **Reports** - Relatórios e estatísticas
- ✅ **Quarantine** - Gerenciamento de quarentena
- ✅ **Incidents** - Incidentes de segurança
- ✅ **Packages** - Pacotes de instalação

---

## 🎯 Benefícios da Integração

### Para o Sistema Atual:

1. **Sincronização Automática**
   - Importar licenças diretamente do GravityZone
   - Atualizar status automaticamente
   - Eliminar entrada manual de dados

2. **Inventário de Dispositivos**
   - Listar todos os endpoints protegidos
   - Ver status de proteção em tempo real
   - Integrar com o novo módulo de Hardware

3. **Alertas Inteligentes**
   - Notificações de licenças expirando
   - Alertas de dispositivos desprotegidos
   - Relatórios de ameaças detectadas

4. **Relatórios Avançados**
   - Estatísticas de uso
   - Histórico de ameaças
   - Compliance e auditoria

---

## 🏗️ Proposta de Implementação

### Fase 1: Configuração e Autenticação (1-2 dias)

**Criar módulo de configuração:**

```php
// app_bitdefender_api_config.php
<?php
class BitdefenderAPI {
    private $apiKey;
    private $accessUrl;
    private $baseUrl;
    
    public function __construct() {
        // Carregar configurações do banco
        $this->loadConfig();
    }
    
    private function loadConfig() {
        // Buscar API Key e Access URL do banco
        $stmt = $pdo->prepare("SELECT * FROM bitdefender_api_config WHERE id = 1");
        $stmt->execute();
        $config = $stmt->fetch();
        
        $this->apiKey = $config['api_key'];
        $this->accessUrl = $config['access_url'];
        $this->baseUrl = $this->accessUrl . '/v1.0/jsonrpc/';
    }
    
    private function makeRequest($api, $method, $params = []) {
        $url = $this->baseUrl . $api;
        
        $payload = [
            'id' => uniqid(),
            'jsonrpc' => '2.0',
            'method' => $method,
            'params' => $params
        ];
        
        $auth = base64_encode($this->apiKey . ':');
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . $auth
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("API Error: HTTP $httpCode");
        }
        
        return json_decode($response, true);
    }
}
```

**Tabela de configuração:**

```sql
CREATE TABLE bitdefender_api_config (
    id INT PRIMARY KEY DEFAULT 1,
    api_key VARCHAR(255) NOT NULL,
    access_url VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    last_sync TIMESTAMP NULL,
    sync_interval INT DEFAULT 3600 COMMENT 'Segundos entre sincronizações',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Fase 2: Sincronização de Licenças (2-3 dias)

**Funcionalidades:**

1. **Importar Licenças**
   ```php
   public function syncLicenses() {
       $response = $this->makeRequest('licensing', 'getLicenseInfo');
       
       if ($response['result']) {
           $licenses = $response['result'];
           
           foreach ($licenses as $license) {
               // Atualizar ou criar no banco local
               $this->upsertLicense($license);
           }
       }
   }
   ```

2. **Atualização Automática**
   - Cron job para sincronizar periodicamente
   - Webhook para atualizações em tempo real
   - Botão manual de sincronização

3. **Mapeamento de Dados**
   ```
   API Bitdefender → Sistema Local
   ─────────────────────────────────
   companyName     → company
   expirationDate  → expiration_date
   totalSeats      → total_licenses
   licenseKey      → license_key
   ```

---

### Fase 3: Inventário de Endpoints (3-4 dias)

**Integração com módulo de Hardware:**

1. **Listar Dispositivos Protegidos**
   ```php
   public function getEndpoints() {
       $response = $this->makeRequest('network', 'getEndpointsList', [
           'filters' => [
               'type' => ['computer', 'server']
           ]
       ]);
       
       return $response['result']['items'];
   }
   ```

2. **Sincronizar com Hardware Inventory**
   - Criar/atualizar dispositivos automaticamente
   - Adicionar campo "bitdefender_endpoint_id"
   - Mostrar status de proteção na tabela

3. **Informações Adicionais**
   - Status de proteção (protegido/desprotegido)
   - Última atualização de definições
   - Ameaças detectadas
   - Versão do agente

---

### Fase 4: Dashboard e Relatórios (2-3 dias)

**Widgets no Dashboard:**

1. **Status Geral**
   - Total de licenças ativas
   - Licenças expirando
   - Dispositivos protegidos/desprotegidos
   - Ameaças detectadas (últimas 24h)

2. **Gráficos**
   - Uso de licenças ao longo do tempo
   - Distribuição por cliente
   - Histórico de ameaças

3. **Alertas**
   - Dispositivos sem proteção
   - Definições desatualizadas
   - Licenças críticas

---

## 📋 Estrutura de Arquivos

```
Backend:
├── app_bitdefender_api.php          - API principal
├── app_bitdefender_api_config.php   - Configuração
├── app_bitdefender_sync.php         - Sincronização
└── cron_bitdefender_sync.php        - Cron job

Frontend:
├── src/components/
│   ├── BitdefenderAPIConfig.tsx     - Configuração da API
│   ├── BitdefenderSyncButton.tsx    - Botão de sincronização
│   ├── BitdefenderStatusWidget.tsx  - Widget de status
│   └── BitdefenderEndpointsList.tsx - Lista de endpoints
└── src/lib/
    └── bitdefenderApi.ts            - Cliente TypeScript

Database:
├── bitdefender_api_config           - Configuração
├── bitdefender_endpoints            - Endpoints sincronizados
└── bitdefender_sync_log             - Log de sincronizações
```

---

## 🔧 Funcionalidades Detalhadas

### 1. Configuração da API

**Interface de Configuração:**
- Campo para API Key
- Campo para Access URL
- Teste de conexão
- Ativar/desativar sincronização automática
- Intervalo de sincronização

### 2. Sincronização Manual

**Botão no Dashboard:**
- "Sincronizar com Bitdefender"
- Mostra progresso em tempo real
- Exibe resultado (sucesso/erro)
- Log de alterações

### 3. Sincronização Automática

**Cron Job:**
```php
// cron_bitdefender_sync.php
// Executar a cada hora
<?php
require_once 'app_bitdefender_api.php';

$api = new BitdefenderAPI();

if ($api->isEnabled()) {
    try {
        $result = $api->syncAll();
        $api->logSync('success', $result);
    } catch (Exception $e) {
        $api->logSync('error', $e->getMessage());
    }
}
```

### 4. Endpoints no Hardware Inventory

**Campos Adicionais:**
```sql
ALTER TABLE hardware_devices ADD COLUMN bitdefender_endpoint_id VARCHAR(255);
ALTER TABLE hardware_devices ADD COLUMN bitdefender_status ENUM('protected', 'unprotected', 'unknown') DEFAULT 'unknown';
ALTER TABLE hardware_devices ADD COLUMN bitdefender_last_seen TIMESTAMP NULL;
ALTER TABLE hardware_devices ADD COLUMN bitdefender_agent_version VARCHAR(50);
ALTER TABLE hardware_devices ADD COLUMN bitdefender_threats_detected INT DEFAULT 0;
```

**Visualização:**
- Ícone de status (✅ protegido, ⚠️ desprotegido)
- Badge com versão do agente
- Link para detalhes no GravityZone

---

## 📊 Exemplos de Uso da API

### Obter Informações de Licença

```javascript
POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/licensing

{
  "id": "unique-id",
  "jsonrpc": "2.0",
  "method": "getLicenseInfo",
  "params": {}
}

// Resposta
{
  "id": "unique-id",
  "jsonrpc": "2.0",
  "result": {
    "companyName": "Empresa Exemplo",
    "expirationDate": "2026-12-31",
    "totalSeats": 50,
    "usedSeats": 45,
    "licenseKey": "XXXX-XXXX-XXXX-XXXX"
  }
}
```

### Listar Endpoints

```javascript
POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/network

{
  "id": "unique-id",
  "jsonrpc": "2.0",
  "method": "getEndpointsList",
  "params": {
    "filters": {
      "type": ["computer", "server"]
    },
    "page": 1,
    "perPage": 100
  }
}
```

### Obter Relatório de Ameaças

```javascript
POST https://cloud.gravityzone.bitdefender.com/api/v1.0/jsonrpc/reports

{
  "id": "unique-id",
  "jsonrpc": "2.0",
  "method": "getThreatsReport",
  "params": {
    "startDate": "2026-03-01",
    "endDate": "2026-03-16"
  }
}
```

---

## 🎨 Interface Proposta

### Página de Configuração

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Configuração da API Bitdefender                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ API Key: [********************************]            │
│                                                         │
│ Access URL: [https://cloud.gravityzone...]            │
│                                                         │
│ ☑ Ativar sincronização automática                     │
│                                                         │
│ Intervalo: [1 hora ▼]                                 │
│                                                         │
│ [Testar Conexão] [Salvar Configuração]                │
│                                                         │
│ Status: ✅ Conectado                                   │
│ Última sincronização: 16/03/2026 11:30                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Widget no Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ 🛡️ Bitdefender Status                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Licenças: 45/50 em uso (90%)                          │
│ Expira em: 289 dias                                    │
│                                                         │
│ Dispositivos Protegidos: 43/45 (95%)                  │
│ ⚠️ 2 dispositivos desprotegidos                        │
│                                                         │
│ Ameaças (24h): 3 detectadas e bloqueadas              │
│                                                         │
│ [Sincronizar Agora] [Ver Detalhes]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Estimativa de Tempo

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Configuração e Autenticação | 1-2 dias |
| 2 | Sincronização de Licenças | 2-3 dias |
| 3 | Inventário de Endpoints | 3-4 dias |
| 4 | Dashboard e Relatórios | 2-3 dias |
| 5 | Testes e Ajustes | 2 dias |
| **Total** | **Implementação Completa** | **10-14 dias** |

---

## 🚀 Implementação Incremental

### MVP (Mínimo Viável) - 3-4 dias

1. ✅ Configuração da API Key
2. ✅ Sincronização manual de licenças
3. ✅ Botão "Sincronizar com Bitdefender"
4. ✅ Log de sincronizações

### Versão 2 - +3-4 dias

1. ✅ Sincronização automática (cron)
2. ✅ Listagem de endpoints
3. ✅ Integração com Hardware Inventory
4. ✅ Status de proteção

### Versão 3 - +3-4 dias

1. ✅ Dashboard com widgets
2. ✅ Relatórios de ameaças
3. ✅ Alertas inteligentes
4. ✅ Gráficos e estatísticas

---

## 🔐 Segurança

### Armazenamento da API Key

```php
// Criptografar API Key no banco
function encryptApiKey($key) {
    $cipher = "aes-256-gcm";
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($ivlen);
    $tag = "";
    
    $ciphertext = openssl_encrypt(
        $key, 
        $cipher, 
        ENCRYPTION_KEY, 
        0, 
        $iv, 
        $tag
    );
    
    return base64_encode($iv . $tag . $ciphertext);
}
```

### Validação SSL/TLS

```php
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
```

### Rate Limiting

- Máximo 10 requisições por segundo
- Implementar retry com backoff exponencial
- Cache de respostas quando apropriado

---

## 📝 Próximos Passos

### Para Começar:

1. **Obter API Key do Bitdefender**
   - Acessar GravityZone
   - Ir em My Account → API Keys
   - Gerar nova chave com permissões necessárias

2. **Criar Tabelas no Banco**
   - Executar script SQL de configuração
   - Criar tabelas de log e endpoints

3. **Implementar MVP**
   - Começar com configuração básica
   - Testar sincronização manual
   - Validar dados importados

### Quer que eu implemente?

Posso criar:
- ✅ Scripts PHP completos
- ✅ Componentes React
- ✅ Scripts SQL
- ✅ Documentação detalhada
- ✅ Testes e exemplos

---

**Desenvolvido para Dashboard de Licenças - Macip Tecnologia**  
**Análise baseada em:** https://www.bitdefender.com/business/support/en/77209-125277-public-api.html
