# 🔗 INSTRUÇÕES: Integração do Módulo RH ao Dashboard

**Data:** 02/06/2026  
**Status:** ⏳ Pendente

---

## ✅ PROGRESSO ATUAL

### Componentes Criados:
1. ✅ **HRDashboard.tsx** - Dashboard completo do RH
2. ✅ **EmployeeTable.tsx** - Tabela de funcionários com busca e filtros
3. ✅ **AddEmployeeModal.tsx** - Modal de cadastro (formulário completo em abas)
4. ✅ **EditEmployeeModal.tsx** - Stub (a implementar)
5. ✅ **EmployeeDetailModal.tsx** - Stub (a implementar)
6. ✅ **VacationTable.tsx** - Stub (a implementar)
7. ✅ **LeaveTable.tsx** - Stub (a implementar)
8. ✅ **BenefitTable.tsx** - Stub (a implementar)

### Backend:
- ✅ API completa (`app_hr.php`)
- ✅ Tipos TypeScript (`types.ts`)
- ✅ API Client (`apiClient.ts`)

---

## 📝 PRÓXIMOS PASSOS PARA INTEGRAÇÃO

### PASSO 1: Adicionar Import no Dashboard.tsx

No arquivo `src/pages/Dashboard.tsx`, adicione após as outras importações:

```typescript
import HRDashboard from '../components/hr/HRDashboard';
import { Users } from 'lucide-react'; // Adicionar Users ao import de ícones
```

### PASSO 2: Atualizar Tipo `activeView`

Encontre a linha que define o tipo `activeView` e adicione `'hr'`:

```typescript
const [activeView, setActiveView] = useState<'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'network' | 'hardware' | 'hr'>(() => {
  if (user.role === 'admin') return 'bitdefender';
  if (user.permissions?.dashboards.bitdefender) return 'bitdefender';
  if (user.permissions?.dashboards.fortigate) return 'fortigate';
  if (user.permissions?.dashboards.o365) return 'o365';
  if (user.permissions?.dashboards.gmail) return 'gmail';
  if (user.permissions?.dashboards.network) return 'network';
  if (user.permissions?.dashboards.hr) return 'hr'; // 🆕 ADICIONAR
  if (user.permissions?.dashboards.hardware) return 'hardware';
  return 'bitdefender';
});
```

### PASSO 3: Adicionar Botão no Header

No componente `Header.tsx` (`src/components/Header.tsx`), encontre onde os botões dos dashboards são renderizados e adicione:

```typescript
{/* RH Dashboard */}
{(user.role === 'admin' || user.permissions?.dashboards.hr) && (
  <button
    onClick={() => onViewChange('hr')}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      activeView === 'hr'
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    <Users className="w-5 h-5" />
    <span>Recursos Humanos</span>
  </button>
)}
```

### PASSO 4: Adicionar Renderização Condicional no Dashboard

No `Dashboard.tsx`, encontre onde os outros dashboards são renderizados (Bitdefender, FortiGate, etc.) e adicione:

```typescript
{/* HR Dashboard */}
{activeView === 'hr' && (
  <HRDashboard />
)}
```

### PASSO 5: Atualizar Interface do Header

No arquivo `src/components/Header.tsx`, atualize a interface `HeaderProps`:

```typescript
interface HeaderProps {
  user: User;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onViewChange: (view: 'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'network' | 'hardware' | 'hr') => void; // Adicionar 'hr'
  activeView: 'bitdefender' | 'fortigate' | 'o365' | 'gmail' | 'network' | 'hardware' | 'hr'; // Adicionar 'hr'
  onLogout: () => void;
}
```

---

## 🗄️ BANCO DE DADOS

### ⚠️ OBRIGATÓRIO: Executar Scripts SQL

Antes de testar, você DEVE executar:

```sql
-- 1. Criar tabelas
source db_hr_schema.sql;

-- 2. Adicionar permissões
source add_hr_permissions.sql;

-- 3. Verificar
SHOW TABLES LIKE 'hr_%';
SELECT * FROM users WHERE role = 'admin';
```

---

## 🧪 TESTANDO A INTEGRAÇÃO

### Passo a Passo:

1. ✅ Executar scripts SQL
2. ✅ Fazer upload do `app_hr.php`
3. ✅ Compilar frontend: `npm run build`
4. ✅ Fazer login no sistema
5. ✅ Verificar se aparece botão "Recursos Humanos"
6. ✅ Clicar e testar:
   - Dashboard carrega?
   - Estatísticas aparecem?
   - Botão "Novo Funcionário" funciona?
   - Formulário de cadastro funciona?

---

## 🎨 ESTRUTURA DE PASTAS ATUAL

```
src/
├── components/
│   ├── hr/                          🆕 NOVA PASTA
│   │   ├── HRDashboard.tsx          ✅ Completo
│   │   ├── EmployeeTable.tsx        ✅ Completo
│   │   ├── AddEmployeeModal.tsx     ✅ Completo
│   │   ├── EditEmployeeModal.tsx    ⏳ Stub
│   │   ├── EmployeeDetailModal.tsx  ⏳ Stub
│   │   ├── VacationTable.tsx        ⏳ Stub
│   │   ├── LeaveTable.tsx           ⏳ Stub
│   │   └── BenefitTable.tsx         ⏳ Stub
│   ├── Header.tsx                   ⏳ Atualizar
│   └── ... (outros componentes)
├── pages/
│   ├── Dashboard.tsx                ⏳ Atualizar
│   └── ...
├── lib/
│   └── apiClient.ts                 ✅ Atualizado
└── types.ts                         ✅ Atualizado
```

---

## 📋 CHECKLIST DE INTEGRAÇÃO

### Backend
- [x] API criada (`app_hr.php`)
- [ ] SQL executado (tabelas criadas)
- [ ] SQL de permissões executado
- [ ] Arquivo PHP no servidor

### Frontend - Código
- [x] Componentes RH criados
- [x] Tipos TypeScript
- [x] API Client
- [ ] Dashboard.tsx atualizado
- [ ] Header.tsx atualizado

### Frontend - Build
- [ ] `npm install` (se necessário)
- [ ] `npm run build`
- [ ] Arquivos copiados para servidor

### Testes
- [ ] Login funciona
- [ ] Menu RH aparece
- [ ] Dashboard RH carrega
- [ ] Estatísticas aparecem
- [ ] Criar funcionário funciona
- [ ] Listar funcionários funciona
- [ ] Busca funciona
- [ ] Filtros funcionam

---

## 🐛 POSSÍVEIS ERROS E SOLUÇÕES

### Erro 1: "Cannot find module 'HRDashboard'"
**Solução:** Verificar se o import está correto:
```typescript
import HRDashboard from '../components/hr/HRDashboard';
```

### Erro 2: "hr is not assignable to type..."
**Solução:** Adicionar `'hr'` em todos os tipos `activeView`

### Erro 3: "403 Forbidden" na API
**Solução:** Executar `add_hr_permissions.sql`

### Erro 4: Botão RH não aparece
**Solução:** Verificar permissões do usuário no banco

### Erro 5: "Table 'hr_employees' doesn't exist"
**Solução:** Executar `db_hr_schema.sql`

---

## 💡 DICAS

1. **Compile incrementalmente:** Faça uma mudança por vez e compile
2. **Use console.log:** Para debugar fluxo de dados
3. **Verifique permissões:** Usuário precisa ter `hr: true`
4. **Cache do navegador:** Limpe com Ctrl+F5
5. **DevTools:** Use para ver erros de console

---

## 📞 PRÓXIMA SESSÃO

Para continuar na próxima sessão, diga:

```
"Continuar integração do módulo RH - implementar o restante dos componentes"
```

Ou especifique qual componente quer implementar:

```
"Implementar EditEmployeeModal completo"
"Implementar VacationTable com todas as funcionalidades"
```

---

## 📊 PROGRESSO GERAL

```
✅ Backend:        100% (Completo)
✅ Tipos TS:       100% (Completo)
✅ API Client:     100% (Completo)
🟡 Componentes:     37% (3/8 completos)
⏳ Integração:       0% (Pendente)
⏳ Testes:           0% (Pendente)

TOTAL: ~60% completo
```

---

**Criado em:** 02/06/2026 - 12:45h  
**Próxima ação:** Integrar ao Dashboard principal
