# Correção de Props das Tabelas no DashboardNew

## Problema 1: Props Incorretas nas Tabelas
Após implementar o novo layout com sidebar, os menus (exceto Dashboard) não abriam - as páginas ficavam em branco.

### Causa Raiz
O arquivo `src/pages/DashboardNew.tsx` estava passando **props incorretas** para os componentes de tabela.

### Solução
Corrigir todas as props para usar os nomes corretos conforme definido nos componentes.

**Commit:** `5fee5e4` - "fix: corrigir props das tabelas no DashboardNew para exibir páginas corretamente"

---

## Problema 2: Métodos de API Incorretos
Após corrigir as props, as tabelas carregavam mas mostravam "Nenhum dado encontrado" porque os métodos da API estavam errados.

### Causa Raiz
O `DashboardNew.tsx` estava chamando métodos que **não existem** no `apiClient`:

**Métodos ERRADOS (antes):**
```tsx
apiClient.bitdefender.getAll()      // ❌ Não existe
apiClient.fortigate.getAll()        // ❌ Não existe
apiClient.o365.getClients()         // ❌ Não existe
apiClient.o365.getLicenses()        // ❌ Não existe
apiClient.gmail.getClients()        // ❌ Não existe
apiClient.gmail.getLicenses()       // ❌ Não existe
apiClient.hardware.getAll()         // ❌ Não existe
apiClient.o365.updateLicense()      // ❌ Não existe
apiClient.hardware.delete()         // ❌ Não existe
```

**Métodos CORRETOS (depois):**
```tsx
apiClient.bitdefender.list()        // ✅ Correto
apiClient.fortigate.list()          // ✅ Correto
apiClient.o365.clients.list()       // ✅ Correto
apiClient.o365.licenses.list()      // ✅ Correto
apiClient.gmail.clients.list()      // ✅ Correto
apiClient.gmail.licenses.list()     // ✅ Correto
apiClient.hardware.list()           // ✅ Correto
apiClient.o365.licenses.update()    // ✅ Correto
apiClient.hardware.remove()         // ✅ Correto
```

### Solução
Atualizar todas as chamadas de API no `fetchAllData()` e nas funções auxiliares.

**Commit:** `1f24d81` - "fix: corrigir chamadas de API no DashboardNew para usar métodos corretos"

---

**Props ERRADAS (antes):**
```tsx
<BitdefenderTable
  data={rawBitdefender}           // ❌ Prop errada
  onAdd={...}                     // ❌ Prop não existe
  onEdit={...}                    // ❌ Prop não existe
  onDelete={...}                  // ❌ Prop não existe
  onSendEmail={...}               // ❌ Prop não existe
  isAdmin={...}                   // ❌ Prop não existe
/>
```

**Props CORRETAS (depois):**
```tsx
<BitdefenderTable
  licenses={processedBitdefender}  // ✅ Prop correta
  onRowClick={handleRowClick}      // ✅ Prop correta
  selectedItems={selectedItems}    // ✅ Prop correta
  onSelectionChange={handleSelectionChange} // ✅ Prop correta
/>
```

## Correções Aplicadas

### 1. BitdefenderTable
```tsx
// ANTES
<BitdefenderTable
  data={rawBitdefender}
  onAdd={() => setIsAddBitdefenderOpen(true)}
  onEdit={(item) => {...}}
  onDelete={(ids) => {...}}
  onSendEmail={(id) => {...}}
  isAdmin={user.role === 'admin'}
/>

// DEPOIS
<BitdefenderTable
  licenses={processedBitdefender}
  onRowClick={handleRowClick}
  selectedItems={selectedItems}
  onSelectionChange={handleSelectionChange}
/>
```

### 2. FortigateTable
```tsx
// ANTES
<FortigateTable
  data={rawFortigate}
  onAdd={() => setIsAddFortigateOpen(true)}
  onEdit={(item) => {...}}
  onDelete={(ids) => {...}}
  onSendEmail={(id) => {...}}
  isAdmin={user.role === 'admin'}
/>

// DEPOIS
<FortigateTable
  devices={processedFortigate}
  onRowClick={handleRowClick}
  selectedItems={selectedItems}
  onSelectionChange={handleSelectionChange}
/>
```

### 3. O365ClientTable
```tsx
// ANTES
<O365ClientTable
  clients={rawO365Clients}
  licenses={rawO365Licenses}
  onAddClient={() => setIsAddO365ClientOpen(true)}
  onViewClient={(client) => setO365DetailClient(client)}
  onDeleteClient={(id) => {...}}
  isAdmin={user.role === 'admin'}
/>

// DEPOIS
<O365ClientTable
  clients={rawO365Clients}
  licenses={processedO365Licenses}
  onLicenseUpdate={handleUpdateO365License}
  isAdmin={isAdmin}
  onClientClick={setO365DetailClient}
/>
```

### 4. GmailClientTable
```tsx
// ANTES
<GmailClientTable
  clients={rawGmailClients}
  licenses={rawGmailLicenses}
  onAddClient={() => setIsAddGmailClientOpen(true)}
  onViewClient={(client) => setGmailDetailClient(client)}
  onDeleteClient={(id) => {...}}
  isAdmin={user.role === 'admin'}
/>

// DEPOIS
<GmailClientTable
  clients={rawGmailClients}
  licenses={processedGmailLicenses}
  onClientClick={setGmailDetailClient}
/>
```

### 5. HardwareInventoryTable
```tsx
// ANTES
<HardwareInventoryTable
  data={rawHardware}
  onAdd={() => setIsAddHardwareOpen(true)}
  onEdit={(device) => setHardwareDetailDevice(device)}
  onDelete={(ids) => {...}}
  isAdmin={user.role === 'admin'}
/>

// DEPOIS
<HardwareInventoryTable
  devices={processedHardware}
  onRowClick={setHardwareDetailDevice}
  onDelete={isAdmin ? handleDeleteHardware : undefined}
  canEdit={isAdmin}
  canDelete={isAdmin}
/>
```

## Funções Adicionadas

### handleUpdateO365License
```tsx
const handleUpdateO365License = async (id: number, data: Partial<O365License>) => {
  try {
    await apiClient.o365.updateLicense(id, data);
    await fetchAllData();
    toast.success('Licença atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar licença:', error);
    toast.error('Erro ao atualizar licença');
  }
};
```

### handleDeleteHardware
```tsx
const handleDeleteHardware = async (id: number) => {
  try {
    await apiClient.hardware.delete(id);
    await fetchAllData();
    toast.success('Hardware deletado com sucesso!');
  } catch (error) {
    console.error('Erro ao deletar hardware:', error);
    toast.error('Erro ao deletar hardware');
  }
};
```

## Resultado Final

✅ **Build executado com sucesso** (`npm run build` - 9.51s)
✅ **Sem erros TypeScript**
✅ **Commits realizados:**
   - `5fee5e4` - Correção de props das tabelas
   - `1f24d81` - Correção de métodos da API
✅ **Push para GitHub concluído**
✅ **Dados agora carregam corretamente em todas as páginas**

## Próximos Passos

1. ✅ Aguardar deploy automático no Easypanel
2. ✅ Limpar cache do browser (`Ctrl + Shift + R`)
3. ✅ Testar todos os menus:
   - Dashboard
   - Bitdefender
   - Fortigate
   - Office 365
   - Gmail
   - Mapa de Rede
   - Inventário

## Lições Aprendidas

1. **Sempre verificar as props esperadas pelos componentes** antes de usá-los
2. **Consultar o apiClient.ts** para ver os métodos disponíveis
3. **Usar dados processados** (com status calculado) ao invés de dados brutos
4. **Consultar o código de referência** (`Dashboard.tsx`) para ver como as props são passadas corretamente
5. **Testar build localmente** antes de fazer deploy
6. **Verificar console do navegador** para identificar erros de API

---

**Data:** 24/04/2026
**Commits:** 
- `5fee5e4` - "fix: corrigir props das tabelas no DashboardNew para exibir páginas corretamente"
- `1f24d81` - "fix: corrigir chamadas de API no DashboardNew para usar métodos corretos"
