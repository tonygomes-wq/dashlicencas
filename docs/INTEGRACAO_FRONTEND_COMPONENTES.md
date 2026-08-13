# 🎨 Integração dos Componentes React no Frontend

**Data:** 24/04/2026  
**Status:** Componentes criados, aguardando integração

---

## 📋 COMPONENTES CRIADOS

### ✅ Componentes Prontos (8 arquivos)

```
src/components/BitdefenderStatusWidget.tsx    - Widget de status no dashboard
src/components/BitdefenderConfigPanel.tsx     - Painel de configuração da API ⭐ NOVO
src/components/BitdefenderSyncSettings.tsx    - Painel completo com abas ⭐ NOVO
src/components/NotificationCenter.tsx         - Centro de notificações (painel lateral)
src/components/NotificationBadge.tsx          - Badge de notificações no header
src/components/BitdefenderEndpointsTable.tsx  - Tabela de endpoints
src/lib/apiClient.ts                          - Métodos de API atualizados
```

### ✅ Backend Adicional (1 arquivo)

```
app_bitdefender_config.php                    - API de configuração Bitdefender ⭐ NOVO
```

---

## 🚀 PASSO 1: Integrar Badge de Notificações no Header

### Arquivo: `src/components/Header.tsx`

Adicione o badge de notificações ao lado do botão de tema:

```tsx
import NotificationBadge from './NotificationBadge';
import NotificationCenter from './NotificationCenter';
import { useState } from 'react';

// ... dentro do componente Header

const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

// ... no JSX, adicione antes do ThemeToggle:

<NotificationBadge onClick={() => setIsNotificationCenterOpen(true)} />
<ThemeToggle theme={theme} toggleTheme={toggleTheme} />

// ... no final do componente, antes do </header>:

<NotificationCenter 
  isOpen={isNotificationCenterOpen} 
  onClose={() => setIsNotificationCenterOpen(false)} 
/>
```

**Resultado:** Badge com contador de notificações não lidas aparecerá no header.

---

## 🚀 PASSO 2: Adicionar Widget de Status no Dashboard

### Arquivo: `src/pages/Dashboard.tsx`

Adicione o widget de status do Bitdefender no topo do dashboard:

```tsx
import BitdefenderStatusWidget from '../components/BitdefenderStatusWidget';

// ... dentro do componente Dashboard, após o Header:

<div className="p-6">
  {/* Widgets de Status */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
    <BitdefenderStatusWidget 
      onViewDetails={() => setActiveView('bitdefender')} 
    />
    
    {/* Adicione mais widgets aqui no futuro */}
  </div>

  {/* Resto do conteúdo do dashboard */}
  ...
</div>
```

**Resultado:** Widget mostrando status das licenças e endpoints Bitdefender.

---

## 🚀 PASSO 3: Adicionar Aba de Endpoints

### Arquivo: `src/pages/Dashboard.tsx`

Adicione uma nova aba para visualizar endpoints:

```tsx
import BitdefenderEndpointsTable from '../components/BitdefenderEndpointsTable';

// ... no switch de activeView, adicione um novo case:

case 'bitdefender':
  return (
    <div className="space-y-6">
      <BitdefenderTable
        data={filteredBitdefender}
        onRowClick={handleBitdefenderRowClick}
        onDelete={handleDeleteBitdefender}
        selectedItems={selectedItems}
        onSelectItem={handleSelectItem}
        canEdit={canEdit}
        canDelete={canDelete}
      />
      
      {/* Nova seção de endpoints */}
      <BitdefenderEndpointsTable />
    </div>
  );
```

**Resultado:** Tabela de endpoints aparecerá abaixo da tabela de licenças Bitdefender.

---

## 🚀 PASSO 4: Adicionar Painel de Configuração (NOVO)

### Arquivo: `src/pages/Dashboard.tsx`

Adicione uma nova aba para configurações do Bitdefender:

```tsx
import BitdefenderSyncSettings from '../components/BitdefenderSyncSettings';

// ... no switch de activeView, adicione um novo case:

case 'bitdefender-settings':
  return <BitdefenderSyncSettings />;
```

### Adicionar Botão de Configurações

No header ou na aba Bitdefender, adicione um botão para acessar as configurações:

```tsx
{isAdmin && (
  <button
    onClick={() => setActiveView('bitdefender-settings')}
    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
  >
    <Settings className="w-4 h-4" />
    <span>Configurar API</span>
  </button>
)}
```

**Resultado:** Painel completo com 3 abas:
1. **Configuração** - API Key, Access URL, Auto-sync
2. **Sincronização** - Painel de sincronização manual
3. **Histórico** - Logs de sincronizações

---

Se preferir uma aba separada para endpoints:

```tsx
// Adicione 'endpoints' ao tipo de activeView
type ActiveView = 'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'network' | 'hardware' | 'endpoints';

// Adicione botão na navegação:
<button
  onClick={() => setActiveView('endpoints')}
  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
    activeView === 'endpoints'
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
  }`}
>
  <Shield className="w-5 h-5" />
  <span>Endpoints</span>
</button>

// Adicione case no switch:
case 'endpoints':
  return <BitdefenderEndpointsTable />;
```

**Resultado:** Aba dedicada para gerenciar endpoints.

---

## 🎨 EXEMPLO COMPLETO: Header Atualizado

```tsx
import React, { useState } from 'react';
import { LogOut, Users, RefreshCw } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBadge from './NotificationBadge';
import NotificationCenter from './NotificationCenter';
import UserManagementModal from './UserManagementModal';
import MfaEnrollment from './MfaEnrollment';
import { User } from '../types';

interface HeaderProps {
  user: User;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  onSync: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, theme, toggleTheme, onLogout, onSync }) => {
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const isAdmin = user.role === 'admin';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <img src="/assets/logo.png" alt="Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard de Licenças
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Macip Tecnologia
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {/* Badge de Notificações */}
            <NotificationBadge onClick={() => setIsNotificationCenterOpen(true)} />

            {/* Botão de Sincronizar */}
            <button
              onClick={onSync}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Sincronizar dados"
            >
              <RefreshCw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Gerenciamento de Usuários (Admin) */}
            {isAdmin && (
              <button
                onClick={() => setIsUserManagementOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Gerenciar usuários"
              >
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}

            {/* Toggle de Tema */}
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modais */}
      {isUserManagementOpen && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
        />
      )}

      {isMfaModalOpen && (
        <MfaEnrollment
          isOpen={isMfaModalOpen}
          onClose={() => setIsMfaModalOpen(false)}
        />
      )}

      {/* Centro de Notificações */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
      />
    </header>
  );
};

export default Header;
```

---

## 🎨 EXEMPLO COMPLETO: Dashboard com Widget

```tsx
// No início do componente Dashboard:

return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Header
      user={user}
      theme={theme}
      toggleTheme={toggleTheme}
      onLogout={handleLogout}
      onSync={handleSync}
    />

    <main className="p-6">
      {/* Widgets de Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <BitdefenderStatusWidget 
          onViewDetails={() => setActiveView('bitdefender')} 
        />
        
        {/* Adicione mais widgets aqui:
        <FortigateStatusWidget />
        <O365StatusWidget />
        <HardwareStatusWidget />
        */}
      </div>

      {/* Navegação de Abas */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {/* ... botões de navegação ... */}
      </div>

      {/* Conteúdo das Abas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {renderContent()}
      </div>
    </main>
  </div>
);
```

---

## 📊 ESTRUTURA FINAL DE ARQUIVOS

```
src/
├── components/
│   ├── Header.tsx                          ✅ Atualizar (adicionar NotificationBadge)
│   ├── BitdefenderTable.tsx                ✅ Existente
│   ├── BitdefenderStatusWidget.tsx         ✅ NOVO
│   ├── NotificationCenter.tsx              ✅ NOVO
│   ├── NotificationBadge.tsx               ✅ NOVO
│   ├── BitdefenderEndpointsTable.tsx       ✅ NOVO
│   └── ... (outros componentes)
├── pages/
│   └── Dashboard.tsx                       ✅ Atualizar (adicionar widgets)
├── lib/
│   └── apiClient.ts                        ✅ Atualizado
└── types.ts                                ✅ Existente
```

---

## ✅ CHECKLIST DE INTEGRAÇÃO

### Passo 1: Preparação
- [ ] Todos os arquivos backend instalados
- [ ] Banco de dados atualizado
- [ ] APIs testadas e funcionando

### Passo 2: Componentes
- [ ] `BitdefenderStatusWidget.tsx` criado
- [ ] `NotificationCenter.tsx` criado
- [ ] `NotificationBadge.tsx` criado
- [ ] `BitdefenderEndpointsTable.tsx` criado
- [ ] `apiClient.ts` atualizado

### Passo 3: Integração
- [ ] Badge adicionado ao `Header.tsx`
- [ ] Widget adicionado ao `Dashboard.tsx`
- [ ] Tabela de endpoints integrada
- [ ] Imports adicionados

### Passo 4: Build e Deploy
- [ ] `npm install` executado
- [ ] `npm run build` executado sem erros
- [ ] Arquivos de `dist/` copiados para produção
- [ ] Cache do browser limpo (Ctrl+F5)

### Passo 5: Testes
- [ ] Badge de notificações aparece no header
- [ ] Contador de não lidas funciona
- [ ] Centro de notificações abre ao clicar
- [ ] Widget de status carrega dados
- [ ] Botão de sincronizar funciona
- [ ] Tabela de endpoints carrega dados

---

## 🧪 TESTAR FUNCIONALIDADES

### 1. Notificações
```
1. Faça login
2. Verifique badge no header (deve mostrar contador)
3. Clique no badge
4. Centro de notificações deve abrir
5. Marque uma como lida
6. Contador deve diminuir
```

### 2. Widget de Status
```
1. Acesse o dashboard
2. Widget deve aparecer no topo
3. Deve mostrar:
   - Licenças em uso
   - Dias até expiração
   - Dispositivos protegidos
   - Alertas (se houver)
4. Clique em "Sincronizar"
5. Dados devem atualizar
```

### 3. Endpoints
```
1. Vá para aba Bitdefender
2. Role para baixo
3. Tabela de endpoints deve aparecer
4. Clique em "Sincronizar"
5. Endpoints devem ser listados
6. Filtros devem funcionar
```

---

## 🎨 CUSTOMIZAÇÃO

### Cores do Widget
Edite `BitdefenderStatusWidget.tsx`:

```tsx
// Mudar cor primária
className="bg-blue-600" // Altere para sua cor

// Mudar cor de alerta
className="text-red-600" // Altere para sua cor
```

### Posição do Widget
Edite `Dashboard.tsx`:

```tsx
// Widget no topo (atual)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

// Widget na lateral
<div className="grid grid-cols-4 gap-6">
  <div className="col-span-1">
    <BitdefenderStatusWidget />
  </div>
  <div className="col-span-3">
    {/* Conteúdo principal */}
  </div>
</div>
```

### Intervalo de Atualização
Edite `NotificationBadge.tsx`:

```tsx
// Atualizar a cada 30 segundos (atual)
const interval = setInterval(loadUnreadCount, 30000);

// Atualizar a cada 1 minuto
const interval = setInterval(loadUnreadCount, 60000);
```

---

## 🚨 TROUBLESHOOTING

### Badge não aparece
- Verifique se `NotificationBadge` foi importado
- Verifique se API `/app_notifications.php` está acessível
- Veja console do browser (F12) para erros

### Widget não carrega dados
- Verifique se backend está instalado
- Teste API manualmente: `GET /app_bitdefender_endpoints.php?action=stats`
- Veja console do browser para erros

### Tabela de endpoints vazia
- Execute sincronização manual
- Verifique se clientes têm API Key configurada
- Veja logs: `tail -f /var/log/sync.log`

### Erro ao compilar
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 PRÓXIMOS COMPONENTES (Futuro)

Componentes que podem ser criados:

- `ContractsTable.tsx` - Tabela de contratos
- `ContractDetailModal.tsx` - Modal de detalhes do contrato
- `RenewalPipeline.tsx` - Pipeline de renovações
- `AuditLogTable.tsx` - Tabela de logs de auditoria
- `FortigateStatusWidget.tsx` - Widget de status Fortigate
- `O365StatusWidget.tsx` - Widget de status Office 365
- `HardwareStatusWidget.tsx` - Widget de status Hardware

---

## ✅ CONCLUSÃO

Após seguir este guia, você terá:

✅ Badge de notificações no header  
✅ Centro de notificações funcional  
✅ Widget de status Bitdefender  
✅ Tabela de endpoints  
✅ APIs integradas  

**Tempo estimado:** 30-45 minutos

---

**Desenvolvido por:** Kiro AI  
**Para:** Macip Tecnologia  
**Data:** 24/04/2026
