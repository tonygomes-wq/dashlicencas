# Correção de Props das Tabelas no DashboardNew

## Problema Identificado
Após implementar o novo layout com sidebar, os menus (exceto Dashboard) não abriam - as páginas ficavam em branco.

### Causa Raiz
O arquivo `src/pages/DashboardNew.tsx` estava passando **props incorretas** para os componentes de tabela:

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

## Resultado

✅ **Build executado com sucesso** (`npm run build` - 11.01s)
✅ **Sem erros TypeScript**
✅ **Commit e push realizados**
✅ **Todas as páginas agora devem funcionar corretamente**

## Próximos Passos

1. Aguardar deploy automático no Easypanel
2. Limpar cache do browser (`Ctrl + Shift + R`)
3. Testar todos os menus:
   - ✅ Dashboard
   - ✅ Bitdefender
   - ✅ Fortigate
   - ✅ Office 365
   - ✅ Gmail
   - ✅ Mapa de Rede
   - ✅ Inventário

## Lições Aprendidas

1. **Sempre verificar as props esperadas pelos componentes** antes de usá-los
2. **Usar dados processados** (com status calculado) ao invés de dados brutos
3. **Consultar o código de referência** (`Dashboard.tsx`) para ver como as props são passadas corretamente
4. **Testar build localmente** antes de fazer deploy

---

**Data:** 24/04/2026
**Commit:** `5fee5e4` - "fix: corrigir props das tabelas no DashboardNew para exibir páginas corretamente"
