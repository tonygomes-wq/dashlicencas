# Implementação de Permissões por Cliente - Inventário de Hardware

## ✅ CONCLUÍDO

### Resumo
Adicionado o **Inventário de Hardware** ao sistema de permissões de usuários, permitindo que administradores controlem quais clientes cada usuário pode visualizar e editar no módulo de hardware.

---

## 🎯 Funcionalidades Implementadas

### 1. **Permissões de Dashboard**
- Adicionado "Inventário de Hardware" à lista de dashboards no gerenciamento de usuários
- Usuários podem ter acesso habilitado/desabilitado ao módulo de hardware
- Ícone: Monitor (mesmo usado para Fortigate, mas contexto diferente)

### 2. **Controle de Acesso por Cliente**
- **Modo "Tudo"**: Usuário vê todos os clientes de hardware
- **Modo "Restrito"**: Usuário vê apenas os clientes selecionados

### 3. **Seleção de Clientes**
- Lista todos os clientes cadastrados em `hardware_clients`
- Checkboxes para seleção individual de clientes
- Ordenação alfabética por nome do cliente
- Grid responsivo (1 coluna em mobile, 2 em desktop)

---

## 📁 Arquivos Modificados

### Frontend

#### `src/components/EditUserModal.tsx`
**Alterações:**
1. Adicionado `hardware: true` ao `defaultPermissions.dashboards`
2. Adicionado `hardware: true` ao `defaultPermissions.client_access_all`
3. Adicionado `hardware: []` ao `defaultPermissions.client_access`
4. Atualizado `availableItems` state para incluir hardware clients:
   ```typescript
   hardware: Array<{ id: number; client_name: string }>;
   ```
5. Adicionado fetch de hardware clients em `fetchAvailableItems()`:
   ```typescript
   apiClient.hardwareClients.list()
   ```
6. Adicionado hardware à lista de dashboards no UI:
   ```typescript
   { id: 'hardware', label: 'Inventário de Hardware', icon: Monitor, isItemDashboard: true }
   ```
7. Atualizado lógica de renderização para suportar estrutura de dados do hardware:
   - Hardware clients têm `id` (number) e `client_name` (string)
   - Outros dashboards têm estruturas diferentes (strings ou objetos com `clientName`)
8. Atualizado `toggleItemAccess` para aceitar 'hardware' como dashboard válido

#### `src/types.ts`
**Alterações:**
1. Adicionado `hardware: boolean` ao `UserPermissions.dashboards`
2. Adicionado `hardware?: string[]` ao `UserPermissions.client_access`

---

## 🔧 Como Funciona

### Fluxo de Permissões

1. **Admin abre Gerenciamento de Usuários**
   - Clica em "Editar" em um usuário

2. **Modal de Edição carrega dados**
   - Busca todos os clientes de hardware via `apiClient.hardwareClients.list()`
   - Carrega permissões atuais do usuário

3. **Admin configura acesso**
   - Habilita/desabilita acesso ao dashboard de hardware
   - Escolhe entre "Tudo" ou "Restrito"
   - Se "Restrito", seleciona clientes específicos

4. **Salvamento**
   - Permissões são salvas no campo `permissions` (JSON) da tabela `users`
   - Estrutura:
     ```json
     {
       "dashboards": {
         "hardware": true
       },
       "client_access_all": {
         "hardware": false
       },
       "client_access": {
         "hardware": ["1", "5", "12"]
       }
     }
     ```

---

## 🔐 Backend - Verificação de Permissões

### Funções em `app_config.php`

#### `getClientFilter($dashboard)`
Retorna lista de clientes permitidos ou `null` (sem filtro):
```php
$filter = getClientFilter('hardware');
// null = ver tudo
// ['1', '5', '12'] = ver apenas esses IDs
```

#### `isAllowed($itemIdentifier, $dashboard)`
Verifica se usuário pode acessar um cliente específico:
```php
if (!isAllowed($clientId, 'hardware')) {
    // Acesso negado
}
```

### Aplicação no Backend

Os arquivos PHP que gerenciam hardware devem usar essas funções:

**Exemplo em `app_hardware.php`:**
```php
// Listar apenas dispositivos de clientes permitidos
$filter = getClientFilter('hardware');
if ($filter !== null) {
    $placeholders = implode(',', array_fill(0, count($filter), '?'));
    $sql .= " WHERE client_name IN ($placeholders)";
}

// Verificar ao editar/deletar
if (!isAllowed($device['client_name'], 'hardware')) {
    http_response_code(403);
    echo json_encode(['error' => 'Acesso negado']);
    exit;
}
```

**Exemplo em `app_hardware_clients.php`:**
```php
// Listar apenas clientes permitidos
$filter = getClientFilter('hardware');
if ($filter !== null) {
    $placeholders = implode(',', array_fill(0, count($filter), '?'));
    $sql .= " WHERE id IN ($placeholders)";
}
```

---

## 📊 Estrutura de Dados

### Hardware Clients
```typescript
{
  id: number,              // ID único do cliente
  client_name: string,     // Nome do cliente
  contact_person?: string,
  email?: string,
  phone?: string,
  address?: string,
  notes?: string
}
```

### Permissões Salvas
```json
{
  "dashboards": {
    "bitdefender": true,
    "fortigate": true,
    "o365": true,
    "gmail": true,
    "network": true,
    "hardware": true
  },
  "actions": {
    "edit": true,
    "delete": true
  },
  "client_access_all": {
    "bitdefender": true,
    "fortigate": true,
    "o365": true,
    "gmail": true,
    "network": true,
    "hardware": false
  },
  "client_access": {
    "bitdefender": [],
    "fortigate": [],
    "o365": [],
    "gmail": [],
    "hardware": ["1", "5", "12"]
  }
}
```

---

## 🧪 Como Testar

### 1. Criar Usuário Restrito
1. Login como admin
2. Abrir "Gerenciamento de Usuários"
3. Criar novo usuário ou editar existente
4. Habilitar "Inventário de Hardware"
5. Selecionar "Restrito"
6. Marcar apenas 2-3 clientes específicos
7. Salvar

### 2. Testar Acesso
1. Fazer logout
2. Login com usuário restrito
3. Acessar "Inventário de Hardware"
4. **Verificar**: Deve ver apenas os clientes selecionados
5. **Verificar**: Não deve conseguir ver/editar outros clientes

### 3. Testar Modo "Tudo"
1. Login como admin
2. Editar mesmo usuário
3. Mudar para "Tudo"
4. Salvar
5. Fazer logout e login novamente com usuário
6. **Verificar**: Agora deve ver todos os clientes

---

## ⚠️ PRÓXIMOS PASSOS (Backend)

### Arquivos que precisam implementar verificação de permissões:

#### `app_hardware.php`
- [ ] Aplicar `getClientFilter('hardware')` no método LIST
- [ ] Aplicar `isAllowed()` nos métodos UPDATE e DELETE
- [ ] Filtrar por `client_name` (campo que liga dispositivo ao cliente)

#### `app_hardware_clients.php`
- [ ] Aplicar `getClientFilter('hardware')` no método LIST
- [ ] Aplicar `isAllowed()` nos métodos GET, UPDATE e DELETE
- [ ] Filtrar por `id` do cliente

### Exemplo de Implementação

```php
// app_hardware_clients.php - LIST
$filter = getClientFilter('hardware');
$sql = "SELECT * FROM hardware_clients WHERE 1=1";
$params = [];

if ($filter !== null) {
    if (empty($filter)) {
        // Usuário não tem acesso a nenhum cliente
        echo json_encode([]);
        exit;
    }
    $placeholders = implode(',', array_fill(0, count($filter), '?'));
    $sql .= " AND id IN ($placeholders)";
    $params = $filter;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
```

---

## 🎨 Interface do Usuário

### Visual
- Card com fundo cinza claro/escuro
- Toggle "Tudo" (azul) / "Restrito" (laranja)
- Lista de checkboxes em grid 2 colunas
- Scroll vertical se muitos clientes
- Ícone de usuários (Users) no canto

### Comportamento
- Ao habilitar dashboard, mostra toggle
- Ao selecionar "Restrito", expande lista de clientes
- Checkboxes com animação suave
- Clientes selecionados ficam com fundo azul claro

---

## 📝 Notas Importantes

1. **IDs como Strings**: Os IDs dos clientes são armazenados como strings no array de permissões para consistência com outros dashboards (O365 e Gmail usam UUIDs)

2. **Migração Automática**: O código migra automaticamente permissões antigas (boolean global) para o novo formato (objeto por dashboard)

3. **Compatibilidade**: Mantém compatibilidade com estruturas antigas de permissões

4. **Admin Sempre Tem Acesso**: Usuários com `role = 'admin'` sempre veem tudo, independente das permissões configuradas

5. **Cache do Navegador**: Após deploy, usuários devem limpar cache com `Ctrl + Shift + R`

---

## ✅ Status Final

- ✅ Frontend implementado
- ✅ Types atualizados
- ✅ Build concluído com sucesso
- ⏳ Backend precisa implementar verificações (próximo passo)

---

## 🚀 Deploy

1. Fazer upload dos arquivos da pasta `dist/` para o servidor
2. Instruir usuários a limpar cache: `Ctrl + Shift + R`
3. Testar com usuário admin primeiro
4. Criar usuário de teste com permissões restritas
5. Validar que filtros funcionam corretamente

---

**Data de Implementação**: 21/05/2026  
**Build**: `index-941fa2d9.js`  
**Status**: ✅ Pronto para Deploy (Frontend)
