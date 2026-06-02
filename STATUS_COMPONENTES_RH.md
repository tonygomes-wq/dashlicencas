# 📊 STATUS: Componentes do Módulo RH

**Última Atualização:** 02/06/2026 - 12:30h

---

## ✅ COMPONENTES CRIADOS

### 1. HRDashboard.tsx ✅
- Dashboard principal do módulo RH
- 4 cards de estatísticas (Total, Férias, Afastados, Aniversariantes)
- Sistema de abas (Funcionários, Férias, Afastamentos, Benefícios)
- Botão "Novo Funcionário"
- Integração com API de estatísticas
- **Status:** Completo e funcional

### 2. EmployeeTable.tsx ✅
- Tabela completa de funcionários
- Busca por nome, CPF, cargo e departamento
- Filtros por status e tipo de contrato
- Ações: Ver, Editar, Deletar
- Confirmação de exclusão
- Avatar com inicial do nome
- Badges de status coloridos
- **Status:** Completo e funcional

---

## ⏳ COMPONENTES PENDENTES

### Funcionários
- [ ] **AddEmployeeModal.tsx** - Modal para cadastrar funcionário
  - Formulário com todos os campos
  - Validação de CPF
  - Abas: Dados Pessoais, Contato, Endereço, Profissional

- [ ] **EditEmployeeModal.tsx** - Modal para editar funcionário
  - Reutilizar estrutura do AddEmployeeModal
  - Carregar dados existentes

- [ ] **EmployeeDetailModal.tsx** - Modal com detalhes do funcionário
  - Visualização completa dos dados
  - Tabs: Dados, Férias, Afastamentos, Benefícios, Documentos
  - Botão para editar

### Férias
- [ ] **VacationTable.tsx** - Tabela de férias
  - Lista todas as férias (com filtros)
  - Status: Solicitada, Aprovada, Rejeitada, Concluída
  - Botão "Solicitar Férias"
  - Ações: Aprovar, Rejeitar, Editar, Deletar

- [ ] **VacationRequestModal.tsx** - Modal para solicitar férias
  - Seleção de funcionário
  - Período aquisitivo
  - Data início/fim
  - Dias solicitados
  - Abono pecuniário

- [ ] **VacationApprovalModal.tsx** - Modal para aprovar/rejeitar
  - Visualização da solicitação
  - Botões Aprovar/Rejeitar
  - Campo para motivo de rejeição

### Afastamentos
- [ ] **LeaveTable.tsx** - Tabela de afastamentos
  - Lista todos os afastamentos
  - Filtro por tipo e status
  - Botão "Registrar Afastamento"

- [ ] **AddLeaveModal.tsx** - Modal para registrar afastamento
  - Seleção de funcionário
  - Tipo de afastamento
  - Datas
  - Motivo
  - Upload de atestado

### Benefícios
- [ ] **BenefitTable.tsx** - Tabela de benefícios
  - Lista todos os benefícios
  - Agrupado por tipo ou funcionário
  - Botão "Adicionar Benefício"

- [ ] **AddBenefitModal.tsx** - Modal para adicionar benefício
  - Seleção de funcionário
  - Tipo de benefício
  - Valor mensal
  - Data início/fim

### Componentes Auxiliares
- [ ] **HRStatsWidget.tsx** - Widget de estatísticas (opcional)
- [ ] **DocumentUploadModal.tsx** - Upload de documentos
- [ ] **EmployeeSelector.tsx** - Componente reutilizável para selecionar funcionário

---

## 📝 ORDEM SUGERIDA DE IMPLEMENTAÇÃO

### Prioridade ALTA (Essenciais para MVP)
1. ✅ HRDashboard.tsx
2. ✅ EmployeeTable.tsx
3. ⏳ **AddEmployeeModal.tsx** ← PRÓXIMO
4. ⏳ EditEmployeeModal.tsx
5. ⏳ EmployeeDetailModal.tsx
6. ⏳ VacationTable.tsx
7. ⏳ VacationRequestModal.tsx

### Prioridade MÉDIA
8. ⏳ LeaveTable.tsx
9. ⏳ AddLeaveModal.tsx
10. ⏳ BenefitTable.tsx
11. ⏳ AddBenefitModal.tsx

### Prioridade BAIXA (Podem ser simplificadas)
12. ⏳ VacationApprovalModal.tsx
13. ⏳ DocumentUploadModal.tsx
14. ⏳ EmployeeSelector.tsx

---

## 🔄 PADRÃO DOS COMPONENTES

### Estrutura de um Modal
```tsx
interface ModalProps {
  onClose: () => void;
  onSuccess: () => void; // Callback após sucesso
}

const Modal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.hr....create(formData);
      toast.success('Sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Conteúdo */}
      </div>
    </div>
  );
};
```

### Estrutura de uma Tabela
```tsx
interface TableProps {
  data: T[];
  isLoading: boolean;
  onUpdated: () => void;
  onDeleted: () => void;
}

const Table: React.FC<TableProps> = ({ data, isLoading, onUpdated, onDeleted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // Filtros, busca, etc.

  return (
    <div>
      {/* Busca e filtros */}
      <table>
        {/* Tabela */}
      </table>
    </div>
  );
};
```

---

## 🎨 PADRÃO VISUAL

### Cores do Módulo RH
- **Principal:** Azul (#3b82f6)
- **Férias:** Verde (#22c55e)
- **Afastamentos:** Laranja (#f97316)
- **Benefícios:** Roxo (#a855f7)

### Ícones Utilizados
- `Users` - Funcionários
- `Calendar` - Férias
- `Heart` - Afastamentos
- `Gift` - Benefícios
- `Cake` - Aniversariantes
- `Briefcase` - Cargo
- `Mail` - Email
- `Phone` - Telefone

---

## 📦 DEPENDÊNCIAS

Todos os componentes utilizam:
- ✅ React 18
- ✅ TypeScript
- ✅ TailwindCSS
- ✅ Lucide Icons
- ✅ React Hot Toast
- ✅ API Client (já configurado)

---

## 🚀 PRÓXIMA AÇÃO

**CRIAR:** `AddEmployeeModal.tsx`

Este é o modal mais importante, pois permite cadastrar novos funcionários. Deve ter:
- Formulário em abas (Pessoal, Contato, Endereço, Profissional)
- Validação de campos obrigatórios
- Máscara para CPF, telefone, CEP
- Seleções (dropdown) para status, contrato, etc.

---

## 📊 PROGRESSO GERAL

```
Componentes Criados:     2 / 15 (13%)
Componentes Pendentes:  13 / 15 (87%)
```

**Tempo Estimado Restante:** 6-8 horas

---

**Última Atualização:** 02/06/2026 - 12:30h  
**Próximo Componente:** AddEmployeeModal.tsx
