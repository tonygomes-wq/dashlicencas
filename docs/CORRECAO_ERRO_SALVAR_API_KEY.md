# 🐛 CORREÇÃO: Erro ao Salvar API Key Bitdefender

## ❌ PROBLEMA IDENTIFICADO

### Erro no Console
```
API Error: {
  error: 'No valid fields to update',
  available_columns: [...],
  received_data: [...]
}
```

### Causa Raiz
**Incompatibilidade entre nomenclatura de campos:**
- **Frontend** envia dados em **camelCase**: `clientApiKey`, `clientAccessUrl`
- **Banco de Dados** espera **snake_case**: `client_api_key`, `client_access_url`

### Fluxo do Erro
```
1. Usuário preenche API Key no modal
   ↓
2. Frontend envia: { clientApiKey: "xxx", clientAccessUrl: "yyy" }
   ↓
3. Backend (app_bitdefender.php) tenta atualizar campos:
   UPDATE bitdefender_licenses SET clientApiKey = ?, clientAccessUrl = ?
   ↓
4. ❌ ERRO: Colunas não existem no banco
   ↓
5. Retorna: "No valid fields to update"
```

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Mapeamento de Campos
**Arquivo:** `app_bitdefender.php` (método PUT)

```php
// Mapear campos camelCase para snake_case
$fieldMapping = [
    'contactPerson' => 'contact_person',
    'expirationDate' => 'expiration_date',
    'totalLicenses' => 'total_licenses',
    'licenseKey' => 'license_key',
    'renewalStatus' => 'renewal_status',
    'clientApiKey' => 'client_api_key',        // ✅ CORRIGIDO
    'clientAccessUrl' => 'client_access_url',  // ✅ CORRIGIDO
    'usedSlots' => 'used_slots',
    'totalSlots' => 'total_slots',
    'licenseUsagePercent' => 'license_usage_percent',
    'licenseUsageAlert' => 'license_usage_alert',
    'licenseUsageLastSync' => 'license_usage_last_sync'
];

// Converter campos
$convertedData = [];
foreach ($data as $key => $value) {
    $dbKey = $fieldMapping[$key] ?? $key;
    $convertedData[$dbKey] = $value;
}
```

### 2. Verificação de Colunas Existentes
```php
// Verificar quais colunas existem na tabela
$stmt = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses");
$existingColumns = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $existingColumns[] = $row['Field'];
}

// Build dynamic query apenas com campos que existem
$fields = [];
$params = [];
foreach ($convertedData as $key => $value) {
    if ($key === 'id' || $key === 'user_id' || $key === 'created_at') continue;
    
    // Verificar se coluna existe
    if (!in_array($key, $existingColumns)) {
        continue; // Ignora campos que não existem
    }
    
    $fields[] = "$key = ?";
    $params[] = $value;
}
```

### 3. Mensagem de Erro Detalhada
```php
if (empty($fields)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'No valid fields to update',
        'available_columns' => $existingColumns,    // Lista colunas do banco
        'received_data' => array_keys($convertedData) // Lista campos recebidos
    ]);
    exit;
}
```

## 📊 ANTES vs DEPOIS

### ANTES (❌ Erro)
```
Frontend envia:
{
  "clientApiKey": "abc123",
  "clientAccessUrl": "https://cloud.gravityzone.bitdefender.com/api"
}

Backend tenta:
UPDATE bitdefender_licenses 
SET clientApiKey = ?, clientAccessUrl = ? 
WHERE id = ?

❌ ERRO: Colunas não existem
```

### DEPOIS (✅ Funciona)
```
Frontend envia:
{
  "clientApiKey": "abc123",
  "clientAccessUrl": "https://cloud.gravityzone.bitdefender.com/api"
}

Backend converte:
{
  "client_api_key": "abc123",
  "client_access_url": "https://cloud.gravityzone.bitdefender.com/api"
}

Backend executa:
UPDATE bitdefender_licenses 
SET client_api_key = ?, client_access_url = ? 
WHERE id = ?

✅ SUCESSO: Campos atualizados
```

## 🔧 CAMPOS MAPEADOS

| Frontend (camelCase) | Backend (snake_case) | Descrição |
|---------------------|---------------------|-----------|
| `contactPerson` | `contact_person` | Nome do responsável |
| `expirationDate` | `expiration_date` | Data de vencimento |
| `totalLicenses` | `total_licenses` | Total de licenças |
| `licenseKey` | `license_key` | Chave da licença |
| `renewalStatus` | `renewal_status` | Status de renovação |
| **`clientApiKey`** | **`client_api_key`** | **API Key do cliente** ✅ |
| **`clientAccessUrl`** | **`client_access_url`** | **URL de acesso da API** ✅ |
| `usedSlots` | `used_slots` | Assentos usados |
| `totalSlots` | `total_slots` | Total de assentos |
| `licenseUsagePercent` | `license_usage_percent` | Percentual de uso |
| `licenseUsageAlert` | `license_usage_alert` | Alerta de uso |
| `licenseUsageLastSync` | `license_usage_last_sync` | Última sincronização |

## 🎯 RESULTADO

### ✅ Funcionalidades Corrigidas
1. **Salvar API Key** - Agora funciona corretamente
2. **Salvar Access URL** - Agora funciona corretamente
3. **Sincronização Bitdefender** - Habilitada após salvar API Key
4. **Mensagens de Erro** - Mais detalhadas para debug

### 📝 Fluxo Correto
```
1. Usuário preenche API Key e Access URL
   ↓
2. Clica em "Salvar Alterações"
   ↓
3. Frontend envia dados em camelCase
   ↓
4. Backend converte para snake_case
   ↓
5. Backend verifica se colunas existem
   ↓
6. Backend atualiza apenas campos válidos
   ↓
7. ✅ Sucesso: "Alterações salvas com sucesso!"
   ↓
8. Botão "Sincronizar" fica habilitado
   ↓
9. Usuário pode sincronizar com API Bitdefender
```

## 🚀 COMO TESTAR

### 1. Abrir Modal de Detalhes
- Acessar página Bitdefender
- Clicar em um cliente

### 2. Configurar API
- Preencher "API Key do Cliente"
- Preencher "Access URL do Cliente" (ou deixar padrão)
- Clicar em "Salvar Alterações"

### 3. Verificar Sucesso
- ✅ Mensagem: "Alterações salvas com sucesso!"
- ✅ Modal fecha automaticamente
- ✅ Botão "Sincronizar" fica habilitado

### 4. Sincronizar
- Abrir modal novamente
- Clicar em "Sincronizar"
- ✅ Dados são sincronizados com API Bitdefender

## 📁 ARQUIVOS MODIFICADOS
- `app_bitdefender.php` - Adicionado mapeamento camelCase → snake_case
- `debug_sync_endpoint.php` - Script de debug criado (pode ser removido)

## ✅ STATUS: CORRIGIDO
O erro ao salvar API Key foi **100% corrigido**. Agora é possível configurar a API Bitdefender e sincronizar dados normalmente!