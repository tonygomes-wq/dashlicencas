# 📋 ESPECIFICAÇÃO: Módulo de Gestão de RH

**Data de Criação:** 02/06/2026  
**Status:** 📝 Em Planejamento  
**Prioridade:** Alta

---

## 📊 1. ANÁLISE DE VIABILIDADE

### ✅ Pontos Favoráveis
1. **Arquitetura Existente:** Sistema já possui estrutura modular (Bitdefender, FortiGate, Office 365, Gmail)
2. **Stack Tecnológico Consolidado:**
   - Backend: PHP 8.2 + MySQL
   - Frontend: React 18 + TypeScript + Vite
   - Autenticação e Permissões: Sistema já implementado
3. **Padrões Estabelecidos:** Código segue padrões claros de CRUD e gerenciamento
4. **Infraestrutura:** Docker + Easypanel prontos para deploy

### ⚠️ Desafios Identificados
1. **Complexidade Legal:** Gestão de folha de pagamento envolve legislação trabalhista brasileira
2. **Integração Externa:** Pode requerer conexão com eSocial, FGTS, INSS
3. **Segurança de Dados:** Dados sensíveis (CPF, salários, documentos pessoais)
4. **Volume de Funcionalidades:** Sistema RH completo é muito amplo

### 💡 Recomendação Estratégica
**Implementação em Fases (MVP → Completo)**

Começar com módulo **simplificado** focado em:
- Cadastro de funcionários
- Controle de documentos
- Férias e afastamentos
- Histórico básico

**NÃO incluir inicialmente:**
- Folha de pagamento automatizada (complexidade legal)
- Cálculos trabalhistas
- Integração com órgãos governamentais

---

## 🎯 2. FUNCIONALIDADES PROPOSTAS (MVP)

### 📁 Módulo 1: Cadastro de Funcionários
**Prioridade:** ALTA 🔴

#### Informações Básicas
- Nome completo
- CPF
- RG (número, órgão emissor, data de emissão)
- Data de nascimento
- Sexo
- Estado civil
- Nacionalidade

#### Dados de Contato
- Email pessoal
- Email corporativo
- Telefone(s)
- Endereço completo (CEP, Rua, Número, Bairro, Cidade, Estado)

#### Dados Profissionais
- Cargo/Função
- Departamento/Setor
- Data de admissão
- Data de demissão (se aplicável)
- Tipo de contrato (CLT, PJ, Estagiário, Temporário)
- Status (Ativo, Afastado, Demitido, Férias)
- Salário base
- Jornada de trabalho

#### Documentos
- Foto/Avatar
- Anexos (contratos, documentos digitalizados)
- Upload de arquivos

---

### 📅 Módulo 2: Gestão de Férias
**Prioridade:** MÉDIA 🟡

#### Funcionalidades
- **Período Aquisitivo:** Controle automático de 12 meses
- **Saldo de Férias:** Cálculo de dias disponíveis
- **Solicitação de Férias:**
  - Data de início
  - Quantidade de dias (30, 20, 10 + abono pecuniário)
  - Status (Solicitada, Aprovada, Rejeitada, Concluída)
- **Aprovação:** Workflow de aprovação
- **Calendário:** Visualização de férias programadas
- **Histórico:** Registro de todas as férias tiradas

---

### 🏥 Módulo 3: Afastamentos e Licenças
**Prioridade:** MÉDIA 🟡

#### Tipos de Afastamento
- Licença médica
- Licença maternidade/paternidade
- Licença sem vencimento
- Afastamento INSS
- Outros

#### Dados Registrados
- Data de início
- Data prevista de retorno
- Data real de retorno
- Motivo
- Observações
- Documentos comprobatórios (atestados)

---

### 📊 Módulo 4: Benefícios
**Prioridade:** BAIXA 🟢

#### Tipos de Benefícios
- Vale transporte
- Vale refeição/alimentação
- Plano de saúde
- Plano odontológico
- Seguro de vida
- Outros benefícios customizados

#### Dados por Benefício
- Funcionário
- Tipo de benefício
- Valor
- Data de início
- Data de término (se aplicável)
- Status (Ativo, Inativo)

---

### 📈 Módulo 5: Dashboard e Relatórios
**Prioridade:** MÉDIA 🟡

#### Estatísticas
- Total de funcionários ativos
- Funcionários por departamento
- Funcionários por tipo de contrato
- Aniversariantes do mês
- Férias programadas
- Afastamentos ativos

#### Relatórios
- Lista completa de funcionários
- Funcionários por setor
- Histórico de férias
- Histórico de afastamentos
- Exportação para Excel/PDF

---

## 🗄️ 3. ESTRUTURA DO BANCO DE DADOS

### Tabela: `hr_employees` (Funcionários)
```sql
CREATE TABLE hr_employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    
    -- Dados Pessoais
    full_name VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    rg_issuer VARCHAR(50),
    rg_issue_date DATE,
    birth_date DATE NOT NULL,
    gender ENUM('M', 'F', 'Outro', 'Não informar'),
    marital_status ENUM('Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável'),
    nationality VARCHAR(50) DEFAULT 'Brasileira',
    
    -- Contato
    personal_email VARCHAR(150),
    corporate_email VARCHAR(150),
    phone VARCHAR(20),
    mobile_phone VARCHAR(20),
    
    -- Endereço
    zip_code VARCHAR(10),
    street VARCHAR(200),
    number VARCHAR(10),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(2),
    
    -- Dados Profissionais
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    hire_date DATE NOT NULL,
    termination_date DATE,
    contract_type ENUM('CLT', 'PJ', 'Estagiário', 'Temporário', 'Aprendiz') NOT NULL,
    status ENUM('Ativo', 'Afastado', 'Férias', 'Demitido') DEFAULT 'Ativo',
    salary DECIMAL(10,2),
    work_hours VARCHAR(50),
    
    -- Observações
    notes TEXT,
    
    -- Anexos
    photo_url VARCHAR(255),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_department (department),
    INDEX idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: `hr_vacations` (Férias)
```sql
CREATE TABLE hr_vacations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    
    -- Período Aquisitivo
    acquisition_start DATE NOT NULL,
    acquisition_end DATE NOT NULL,
    
    -- Férias Solicitadas
    vacation_start DATE NOT NULL,
    vacation_end DATE NOT NULL,
    days_requested INT NOT NULL,
    cash_bonus_days INT DEFAULT 0, -- Abono pecuniário
    
    -- Status e Aprovação
    status ENUM('Solicitada', 'Aprovada', 'Rejeitada', 'Concluída', 'Cancelada') DEFAULT 'Solicitada',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT,
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    
    -- Observações
    notes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_employee (employee_id),
    INDEX idx_dates (vacation_start, vacation_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: `hr_leaves` (Afastamentos)
```sql
CREATE TABLE hr_leaves (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    
    -- Dados do Afastamento
    leave_type ENUM('Licença Médica', 'Licença Maternidade', 'Licença Paternidade', 
                    'Licença Sem Vencimento', 'Afastamento INSS', 'Outro') NOT NULL,
    start_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_date DATE,
    
    -- Detalhes
    reason TEXT,
    notes TEXT,
    document_url VARCHAR(255), -- Atestado/Documento
    
    -- Status
    status ENUM('Ativo', 'Concluído', 'Cancelado') DEFAULT 'Ativo',
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, expected_return_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: `hr_benefits` (Benefícios)
```sql
CREATE TABLE hr_benefits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    
    -- Tipo de Benefício
    benefit_type VARCHAR(100) NOT NULL, -- Vale Transporte, Plano Saúde, etc.
    description TEXT,
    
    -- Valores
    monthly_value DECIMAL(10,2),
    
    -- Vigência
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('Ativo', 'Inativo', 'Cancelado') DEFAULT 'Ativo',
    
    -- Observações
    notes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_type (benefit_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabela: `hr_documents` (Documentos)
```sql
CREATE TABLE hr_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    
    -- Dados do Documento
    document_type VARCHAR(100) NOT NULL, -- Contrato, RG, CPF, Atestado, etc.
    document_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_size INT, -- em bytes
    mime_type VARCHAR(100),
    
    -- Observações
    description TEXT,
    
    -- Auditoria
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES hr_employees(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_employee (employee_id),
    INDEX idx_type (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔐 4. PERMISSÕES E SEGURANÇA

### Sistema de Permissões
Seguir o mesmo padrão dos outros módulos:

```json
{
  "dashboards": {
    "hr": true
  },
  "actions": {
    "edit": true,
    "delete": true
  },
  "client_access_all": {
    "hr": true
  },
  "client_access": {
    "hr": []
  }
}
```

### Níveis de Acesso
1. **Administrador RH:** Acesso completo a todos os funcionários e dados
2. **Gestor:** Acesso apenas aos funcionários do seu departamento
3. **Funcionário:** Acesso apenas aos próprios dados (futuro portal do colaborador)

### Segurança de Dados Sensíveis
- ✅ CPF: Armazenado com formatação, indexado para busca
- ✅ Salário: Campo sensível, acesso restrito
- ✅ Documentos: Upload em diretório protegido
- ✅ LGPD: Campos de dados pessoais claramente identificados

---

## 🛠️ 5. ARQUITETURA TÉCNICA

### Backend (PHP)
**Arquivo:** `app_hr.php`

**Endpoints:**
```
GET    /app_hr.php?type=employees          → Listar funcionários
GET    /app_hr.php?type=employees&id=X     → Detalhes de um funcionário
POST   /app_hr.php?type=employees          → Criar funcionário
PUT    /app_hr.php?type=employees&id=X     → Atualizar funcionário
DELETE /app_hr.php?type=employees&id=X     → Deletar funcionário

GET    /app_hr.php?type=vacations          → Listar férias
POST   /app_hr.php?type=vacations          → Solicitar férias
PUT    /app_hr.php?type=vacations&id=X     → Aprovar/Rejeitar férias

GET    /app_hr.php?type=leaves             → Listar afastamentos
POST   /app_hr.php?type=leaves             → Registrar afastamento
PUT    /app_hr.php?type=leaves&id=X        → Atualizar afastamento

GET    /app_hr.php?type=benefits           → Listar benefícios
POST   /app_hr.php?type=benefits           → Adicionar benefício
PUT    /app_hr.php?type=benefits&id=X      → Atualizar benefício

GET    /app_hr.php?type=documents&employee_id=X → Documentos do funcionário
POST   /app_hr.php?type=documents          → Upload de documento
DELETE /app_hr.php?type=documents&id=X     → Deletar documento

GET    /app_hr.php?type=stats               → Estatísticas do dashboard
```

### Frontend (React + TypeScript)

**Componentes Principais:**
```
src/components/
  ├── hr/
  │   ├── EmployeeTable.tsx           → Tabela de funcionários
  │   ├── EmployeeDetailModal.tsx     → Detalhes do funcionário
  │   ├── AddEmployeeModal.tsx        → Cadastrar funcionário
  │   ├── EditEmployeeModal.tsx       → Editar funcionário
  │   ├── VacationTable.tsx           → Tabela de férias
  │   ├── VacationRequestModal.tsx    → Solicitar férias
  │   ├── VacationApprovalModal.tsx   → Aprovar/Rejeitar férias
  │   ├── LeaveTable.tsx              → Tabela de afastamentos
  │   ├── AddLeaveModal.tsx           → Registrar afastamento
  │   ├── BenefitTable.tsx            → Tabela de benefícios
  │   ├── DocumentUploadModal.tsx     → Upload de documentos
  │   └── HRDashboard.tsx             → Dashboard com estatísticas
```

**Types (TypeScript):**
```typescript
// src/types.ts (adicionar)

export interface Employee {
  id: number;
  full_name: string;
  cpf: string;
  rg?: string;
  birth_date: string;
  gender?: 'M' | 'F' | 'Outro' | 'Não informar';
  marital_status?: string;
  nationality?: string;
  personal_email?: string;
  corporate_email?: string;
  phone?: string;
  mobile_phone?: string;
  zip_code?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  position: string;
  department?: string;
  hire_date: string;
  termination_date?: string;
  contract_type: 'CLT' | 'PJ' | 'Estagiário' | 'Temporário' | 'Aprendiz';
  status: 'Ativo' | 'Afastado' | 'Férias' | 'Demitido';
  salary?: number;
  work_hours?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Vacation {
  id: number;
  employee_id: number;
  employee_name?: string;
  acquisition_start: string;
  acquisition_end: string;
  vacation_start: string;
  vacation_end: string;
  days_requested: number;
  cash_bonus_days: number;
  status: 'Solicitada' | 'Aprovada' | 'Rejeitada' | 'Concluída' | 'Cancelada';
  requested_at: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface Leave {
  id: number;
  employee_id: number;
  employee_name?: string;
  leave_type: string;
  start_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  reason?: string;
  notes?: string;
  document_url?: string;
  status: 'Ativo' | 'Concluído' | 'Cancelado';
}

export interface Benefit {
  id: number;
  employee_id: number;
  employee_name?: string;
  benefit_type: string;
  description?: string;
  monthly_value?: number;
  start_date: string;
  end_date?: string;
  status: 'Ativo' | 'Inativo' | 'Cancelado';
  notes?: string;
}

export interface HRDocument {
  id: number;
  employee_id: number;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
  uploaded_by: number;
  created_at: string;
}

export interface HRStats {
  total_employees: number;
  active_employees: number;
  on_vacation: number;
  on_leave: number;
  terminated: number;
  employees_by_department: Array<{
    department: string;
    count: number;
  }>;
  employees_by_contract: Array<{
    contract_type: string;
    count: number;
  }>;
  birthdays_this_month: Array<{
    id: number;
    full_name: string;
    birth_date: string;
  }>;
  upcoming_vacations: Array<{
    id: number;
    employee_name: string;
    vacation_start: string;
    vacation_end: string;
  }>;
}
```

### API Client
**Arquivo:** `src/lib/apiClient.ts` (adicionar)

```typescript
// Adicionar ao apiClient existente

hr: {
  employees: {
    list: () => api.get('/app_hr.php?type=employees'),
    get: (id: number) => api.get(`/app_hr.php?type=employees&id=${id}`),
    create: (data: Partial<Employee>) => api.post('/app_hr.php?type=employees', data),
    update: (id: number, data: Partial<Employee>) => 
      api.put(`/app_hr.php?type=employees&id=${id}`, data),
    remove: (id: number) => api.delete(`/app_hr.php?type=employees&id=${id}`),
  },
  vacations: {
    list: () => api.get('/app_hr.php?type=vacations'),
    create: (data: Partial<Vacation>) => api.post('/app_hr.php?type=vacations', data),
    update: (id: number, data: Partial<Vacation>) => 
      api.put(`/app_hr.php?type=vacations&id=${id}`, data),
    approve: (id: number) => 
      api.put(`/app_hr.php?type=vacations&id=${id}`, { status: 'Aprovada' }),
    reject: (id: number, reason: string) => 
      api.put(`/app_hr.php?type=vacations&id=${id}`, { 
        status: 'Rejeitada', 
        rejection_reason: reason 
      }),
  },
  leaves: {
    list: () => api.get('/app_hr.php?type=leaves'),
    create: (data: Partial<Leave>) => api.post('/app_hr.php?type=leaves', data),
    update: (id: number, data: Partial<Leave>) => 
      api.put(`/app_hr.php?type=leaves&id=${id}`, data),
  },
  benefits: {
    list: () => api.get('/app_hr.php?type=benefits'),
    create: (data: Partial<Benefit>) => api.post('/app_hr.php?type=benefits', data),
    update: (id: number, data: Partial<Benefit>) => 
      api.put(`/app_hr.php?type=benefits&id=${id}`, data),
  },
  documents: {
    list: (employeeId: number) => 
      api.get(`/app_hr.php?type=documents&employee_id=${employeeId}`),
    upload: (formData: FormData) => api.post('/app_hr.php?type=documents', formData),
    remove: (id: number) => api.delete(`/app_hr.php?type=documents&id=${id}`),
  },
  stats: () => api.get('/app_hr.php?type=stats'),
}
```

---

## 📅 6. CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Preparação** (1-2 dias)
- [ ] Criar tabelas do banco de dados
- [ ] Adicionar permissões ao sistema
- [ ] Configurar menu "Recursos Humanos"

### **Fase 2: Backend (MVP)** (3-4 dias)
- [ ] Criar `app_hr.php` com endpoints básicos
- [ ] Implementar CRUD de funcionários
- [ ] Implementar CRUD de férias
- [ ] Implementar CRUD de afastamentos
- [ ] Endpoint de estatísticas

### **Fase 3: Frontend (MVP)** (4-5 dias)
- [ ] Criar tipos TypeScript
- [ ] Atualizar API Client
- [ ] Componente: EmployeeTable
- [ ] Componente: AddEmployeeModal
- [ ] Componente: EmployeeDetailModal
- [ ] Componente: VacationTable
- [ ] Componente: LeaveTable
- [ ] Dashboard com estatísticas

### **Fase 4: Testes e Refinamento** (2-3 dias)
- [ ] Testes de CRUD
- [ ] Testes de permissões
- [ ] Validação de formulários
- [ ] Responsividade
- [ ] Correção de bugs

### **Fase 5: Deploy** (1 dia)
- [ ] Deploy no ambiente de homologação
- [ ] Testes em produção
- [ ] Deploy final

**TEMPO TOTAL ESTIMADO:** 11-15 dias

---

## 💰 7. ESTIMATIVA DE ESFORÇO

| Módulo | Complexidade | Tempo Estimado |
|--------|-------------|----------------|
| Banco de Dados | Baixa | 4h |
| Backend - CRUD Funcionários | Média | 8h |
| Backend - Férias e Afastamentos | Média | 6h |
| Backend - Estatísticas | Baixa | 4h |
| Frontend - Tabelas e Listagens | Média | 12h |
| Frontend - Modais e Formulários | Alta | 16h |
| Frontend - Dashboard | Média | 6h |
| Testes e Ajustes | Média | 10h |
| Documentação | Baixa | 4h |
| **TOTAL** | - | **70 horas** |

---

## 🚀 8. PRÓXIMOS PASSOS

### Imediato (Começar Agora)
1. ✅ **Validar proposta com stakeholders**
2. ⏳ Criar tabelas do banco de dados
3. ⏳ Adicionar permissão "hr" no sistema

### Expansões Futuras (Pós-MVP)
- Portal do Colaborador (self-service)
- Controle de ponto eletrônico
- Avaliação de desempenho
- Banco de horas
- Integração com eSocial (complexo)
- Folha de pagamento automatizada (requer especialista)
- Recrutamento e seleção
- Treinamento e desenvolvimento

---

## ✅ 9. DECISÃO

### Viabilidade: **ALTA ✅**

**Justificativa:**
- ✅ Arquitetura modular permite integração fácil
- ✅ Stack tecnológico consolidado
- ✅ Padrões de código estabelecidos
- ✅ MVP bem definido e escalável
- ✅ Não requer integrações externas complexas (inicialmente)
- ✅ Atende necessidade real do cliente

### Recomendação Final
**APROVADO para implementação em fases, começando pelo MVP.**

O módulo RH proposto é viável, útil e se integra perfeitamente ao sistema existente. A abordagem MVP permite entregar valor rapidamente sem comprometer qualidade ou segurança.

---

## 📞 CONTATO E DÚVIDAS

Para esclarecimentos ou aprovação para iniciar a implementação, favor confirmar:

1. ✅ Aprovação das funcionalidades do MVP
2. ✅ Prioridade entre os módulos (qual implementar primeiro)
3. ✅ Necessidade de campos adicionais específicos da empresa
4. ✅ Cronograma desejado

---

**Documento preparado por:** Kiro AI Assistant  
**Última atualização:** 02/06/2026
