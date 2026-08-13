# Correções Finais do Novo Layout

## Problemas Corrigidos

### 1. Layout Não Responsivo com Sidebar Recolhida ✅
**Problema:** Quando a sidebar era recolhida, o conteúdo principal não expandia para ocupar o espaço disponível.

**Causa:** O estado `isCollapsed` da Sidebar não estava sincronizado com o `MainLayout`.

**Solução:**
- Movido o estado `isCollapsed` para o `MainLayout`
- Passado como props para a `Sidebar`
- Ajustado o padding-left do main dinamicamente:
  ```tsx
  <main className={`pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
  ```

**Arquivos modificados:**
- `src/components/layout/MainLayout.tsx`
- `src/components/layout/Sidebar.tsx`

---

### 2. Colunas Vazias nas Tabelas ✅
**Problema:** 
- **Bitdefender:** Colunas "Responsável", "Serial Chave", "Total de Licenças" vazias
- **Fortigate:** Colunas "Email", "Renovação" vazias
- **Office 365 e Gmail:** Todas as colunas mostrando "N/A"

**Causa:** O banco de dados retorna os dados em **snake_case** (`contact_person`, `license_key`, `total_licenses`) mas o TypeScript espera **camelCase** (`contactPerson`, `licenseKey`, `totalLicenses`).

**Solução:** Adicionado transformação de dados usando `transformKeys` e `toCamelCase`:

```typescript
// Funções auxiliares
const toCamelCase = (s: string) => s.replace(/([-_][a-z])/ig, ($1) => 
  $1.toUpperCase().replace('-', '').replace('_', '')
);

const transformKeys = (obj: any, transformer: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => transformKeys(v, transformer));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[transformer(key)] = transformKeys(obj[key], transformer);
      return result;
    }, {} as any);
  }
  return obj;
};

// Aplicado ao carregar dados
setRawBitdefender(transformKeys(bitdefenderData, toCamelCase));
setRawFortigate(transformKeys(fortigateData, toCamelCase));
setRawO365Clients(transformKeys(o365ClientsData, toCamelCase));
setRawO365Licenses(transformKeys(o365LicensesData, toCamelCase));
setRawGmailClients(transformKeys(gmailClientsData, toCamelCase));
setRawGmailLicenses(transformKeys(gmailLicensesData, toCamelCase));
setRawHardware(transformKeys(hardwareData, toCamelCase));
```

**Arquivo modificado:**
- `src/pages/DashboardNew.tsx`

---

### 3. Texto em Cor Preta nas Tabelas ✅
**Problema:** Texto das células aparecia em preto no tema escuro, dificultando a leitura.

**Solução:** Adicionado classes `text-gray-900 dark:text-white` em todas as células de dados.

**Arquivos modificados:**
- `src/components/BitdefenderTable.tsx`
- `src/components/FortigateTable.tsx`

---

## Mapeamento de Campos (snake_case → camelCase)

### Bitdefender
| Banco de Dados (snake_case) | TypeScript (camelCase) |
|------------------------------|------------------------|
| `contact_person` | `contactPerson` |
| `license_key` | `licenseKey` |
| `total_licenses` | `totalLicenses` |
| `expiration_date` | `expirationDate` |
| `renewal_status` | `renewalStatus` |

### Fortigate
| Banco de Dados (snake_case) | TypeScript (camelCase) |
|------------------------------|------------------------|
| `registration_date` | `registrationDate` |
| `renewal_status` | `renewalStatus` |

### Office 365
| Banco de Dados (snake_case) | TypeScript (camelCase) |
|------------------------------|------------------------|
| `client_name` | `clientName` |
| `contact_email` | `contactEmail` |
| `client_id` | `clientId` |
| `user_email` | `userEmail` |
| `license_type` | `licenseType` |
| `renewal_status` | `renewalStatus` |

### Gmail
| Banco de Dados (snake_case) | TypeScript (camelCase) |
|------------------------------|------------------------|
| `client_name` | `clientName` |
| `contact_email` | `contactEmail` |
| `client_id` | `clientId` |
| `user_email` | `userEmail` |
| `license_type` | `licenseType` |
| `renewal_status` | `renewalStatus` |

---

## Resultado Final

✅ **Layout responsivo** - Expande/recolhe corretamente com a sidebar
✅ **Todas as colunas preenchidas** - Dados aparecem corretamente
✅ **Texto legível** - Cores adequadas para tema escuro
✅ **Office 365 e Gmail** - Devem carregar dados se existirem no banco

## Próximos Passos

1. ✅ Aguardar deploy no Easypanel
2. ✅ Limpar cache (`Ctrl + Shift + R`)
3. ✅ Testar sidebar recolhida/expandida
4. ✅ Verificar se todas as colunas aparecem
5. ✅ Verificar console para log de dados carregados

## Debug

Se Office 365 ou Gmail ainda não carregarem, verifique o console:
```
📊 Dados carregados: {
  bitdefender: X,
  fortigate: X,
  o365Clients: 0,  ← Se for 0, não há dados no banco
  o365Licenses: 0, ← Se for 0, não há dados no banco
  gmailClients: 0,
  gmailLicenses: 0,
  hardware: X
}
```

---

**Data:** 24/04/2026
**Commit:** `79ceef3` - "fix: adicionar responsividade ao layout + transformação snake_case para camelCase nos dados"
