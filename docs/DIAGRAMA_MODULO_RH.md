# 🎨 DIAGRAMA VISUAL: Módulo de Gestão de RH

## 📊 VISÃO GERAL DA ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────┐
│                         SISTEMA RH                              │
│                    Dashboard de Licenças                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Bitdefender │    │  FortiGate   │    │  Office 365  │
│              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  🆕 MÓDULO RH    │ ← NOVO!
                    │                  │
                    │  • Funcionários  │
                    │  • Férias        │
                    │  • Afastamentos  │
                    │  • Benefícios    │
                    └──────────────────┘
```

---

## 🗂️ ESTRUTURA DO MÓDULO RH

```
┌─────────────────────────────────────────────────────────────────┐
│                      📋 MÓDULO RH                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ 👥 PESSOAS    │    │ 📅 TEMPO      │    │ 💰 BENEFÍCIOS │
│               │    │               │    │               │
│ • Cadastro    │    │ • Férias      │    │ • Vale Trans. │
│ • Documentos  │    │ • Afastamento │    │ • Vale Ref.   │
│ • Cargos      │    │ • Licenças    │    │ • Plano Saúde │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 🗄️ MODELO DE DADOS

```
┌─────────────────────┐
│   hr_employees      │ ◄─────────┐
├─────────────────────┤           │
│ id (PK)             │           │
│ full_name           │           │
│ cpf (UNIQUE)        │           │
│ position            │           │
│ department          │           │
│ hire_date           │           │
│ status              │           │
│ salary              │           │
└─────────────────────┘           │
         │                        │
         │ 1                      │ N
         │                        │
    ┌────┴─────────────┐          │
    │                  │          │
    ▼ N                ▼ N        │
┌─────────────┐  ┌──────────────┐│
│hr_vacations │  │  hr_leaves   ││
├─────────────┤  ├──────────────┤│
│ id (PK)     │  │ id (PK)      ││
│ employee_id │  │ employee_id  ││
│ start_date  │  │ leave_type   ││
│ end_date    │  │ start_date   ││
│ status      │  │ return_date  ││
└─────────────┘  └──────────────┘│
                                 │
         │                       │
         ▼ N                     │
    ┌─────────────┐              │
    │ hr_benefits │              │
    ├─────────────┤              │
    │ id (PK)     │──────────────┘
    │ employee_id │
    │ benefit_type│
    │ monthly_val │
    │ status      │
    └─────────────┘
         │
         ▼ N
    ┌──────────────┐
    │ hr_documents │
    ├──────────────┤
    │ id (PK)      │
    │ employee_id  │
    │ doc_type     │
    │ file_url     │
    └──────────────┘
```

---

## 🎯 FLUXO DE NAVEGAÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│                    PÁGINA INICIAL (Dashboard)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ Bitdefender│  │ FortiGate  │  │ Office 365 │  │    RH    │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│                                                         │        │
└─────────────────────────────────────────────────────────┼────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        PÁGINA RH                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 DASHBOARD                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 👥 150       │  │ 📅 5         │  │ 🏥 2         │         │
│  │ Funcionários │  │ Em Férias    │  │ Afastados    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ─────────────────────────────────────────────────────         │
│                                                                  │
│  📑 ABAS                                                         │
│  [ Funcionários ] [ Férias ] [ Afastamentos ] [ Benefícios ]    │
│                                                                  │
│  ─────────────────────────────────────────────────────         │
│                                                                  │
│  🔍 [Buscar...] [➕ Adicionar] [📥 Exportar] [⚙️]              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Nome          │ CPF         │ Cargo      │ Status  │ ⋯ │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ João Silva    │ 111.111... │ Analista   │ ✅ Ativo │   │    │
│  │ Maria Santos  │ 222.222... │ Gerente    │ 🏖️ Férias│   │    │
│  │ Pedro Costa   │ 333.333... │ Assistente │ ✅ Ativo │   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Clique em linha
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MODAL: DETALHES DO FUNCIONÁRIO               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  👤 João Silva                                    [✏️] [🗑️]     │
│                                                                  │
│  📋 Dados Pessoais          │  💼 Dados Profissionais           │
│  ─────────────────          │  ─────────────────────           │
│  CPF: 111.111.111-11        │  Cargo: Analista de Sistemas     │
│  RG: 12.345.678-9           │  Depto: TI                       │
│  Nasc: 15/03/1990           │  Admissão: 01/01/2020            │
│  Email: joao@empresa.com    │  Contrato: CLT                   │
│  Tel: (43) 99999-9999       │  Status: ✅ Ativo                │
│                             │  Salário: R$ 5.000,00            │
│                                                                  │
│  📅 Férias                  │  🏥 Afastamentos                  │
│  ─────────────────          │  ─────────────────               │
│  • 30 dias disponíveis      │  • Nenhum afastamento            │
│  • Última: Jan/2025         │                                  │
│                                                                  │
│  💰 Benefícios              │  📎 Documentos                    │
│  ─────────────────          │  ─────────────────               │
│  ✅ Vale Transporte         │  📄 Contrato.pdf                 │
│  ✅ Vale Refeição           │  📄 RG_Frente.jpg                │
│  ✅ Plano Saúde             │  📄 Comprovante_Res.pdf          │
│                                                                  │
│                         [Fechar] [Salvar Alterações]            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE SOLICITAÇÃO DE FÉRIAS

```
┌──────────────┐
│ FUNCIONÁRIO  │
│ Solicita     │
│ Férias       │
└──────┬───────┘
       │
       │ Preenche formulário
       │ • Data início
       │ • Quantidade dias
       │ • Observações
       │
       ▼
┌──────────────┐
│   SISTEMA    │
│ Valida       │
│ • Dias disp. │
│ • Período    │
└──────┬───────┘
       │
       │ Status: SOLICITADA
       │
       ▼
┌──────────────┐
│   GESTOR     │
│ Analisa      │
│ Pedido       │
└──────┬───────┘
       │
       ├─── APROVAR ──────────┐
       │                      │
       │                      ▼
       │              ┌───────────────┐
       │              │ Status:       │
       │              │ ✅ APROVADA   │
       │              └───────────────┘
       │                      │
       │                      │ No período
       │                      ▼
       │              ┌───────────────┐
       │              │ Status:       │
       │              │ 🏖️ EM FÉRIAS  │
       │              └───────────────┘
       │                      │
       │                      │ Após retorno
       │                      ▼
       │              ┌───────────────┐
       │              │ Status:       │
       │              │ ✅ CONCLUÍDA  │
       │              └───────────────┘
       │
       └─── REJEITAR ────────┐
                             │
                             ▼
                     ┌───────────────┐
                     │ Status:       │
                     │ ❌ REJEITADA  │
                     │ + Motivo      │
                     └───────────────┘
```

---

## 📱 LAYOUT RESPONSIVO

### Desktop (1920x1080)
```
┌───────────────────────────────────────────────────────────────┐
│ HEADER [Logo] [Menu Lateral ☰] [👤 Usuário] [🌙] [🔔]        │
├────────┬──────────────────────────────────────────────────────┤
│ MENU   │                    CONTEÚDO                          │
│        │                                                      │
│ 🏠 Home│  📊 DASHBOARD RH                                    │
│ 🛡️ Bit │  ┌────────┐ ┌────────┐ ┌────────┐                  │
│ 🔒 Fort│  │  150   │ │   5    │ │   2    │                  │
│ 📧 O365│  │ Funcio.│ │ Férias │ │ Afasta.│                  │
│ 📨 Gmail│  └────────┘ └────────┘ └────────┘                  │
│ 💻 Hard│                                                      │
│ 👥 RH ◄├─ [Funcionários] [Férias] [Afastamentos]             │
│        │                                                      │
│        │  ┌──────────────────────────────────────────────┐   │
│        │  │ Tabela de Funcionários                       │   │
│        │  │ [Nome] [CPF] [Cargo] [Depto] [Status]        │   │
│        │  │ ... ... ... ... ...                          │   │
│        │  └──────────────────────────────────────────────┘   │
└────────┴──────────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌─────────────────────────────────────┐
│ [☰] Dashboard RH  [👤] [🌙] [🔔]    │
├─────────────────────────────────────┤
│ 📊 Estatísticas                     │
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │  150  │ │   5   │ │   2   │      │
│ │ Func. │ │ Féria │ │ Afas. │      │
│ └───────┘ └───────┘ └───────┘      │
│                                     │
│ [Funcionários] [Férias] [Afasta]    │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ João Silva                  │    │
│ │ Analista | ✅ Ativo         │    │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │ Maria Santos                │    │
│ │ Gerente | 🏖️ Férias         │    │
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Mobile (375px)
```
┌──────────────────────┐
│ [☰]  RH     [👤] [🔔]│
├──────────────────────┤
│ 📊 Dashboard         │
│ ┌──────────────────┐ │
│ │ 150 Funcionários │ │
│ │ 5 Em Férias      │ │
│ │ 2 Afastados      │ │
│ └──────────────────┘ │
│                      │
│ [🔍 Buscar...]       │
│                      │
│ ┌────────────────┐   │
│ │ João Silva     │   │
│ │ Analista       │   │
│ │ ✅ Ativo       │   │
│ └────────────────┘   │
│                      │
│ ┌────────────────┐   │
│ │ Maria Santos   │   │
│ │ Gerente        │   │
│ │ 🏖️ Férias      │   │
│ └────────────────┘   │
│                      │
│ [➕ Adicionar]       │
└──────────────────────┘
```

---

## 🎨 PALETA DE CORES E ÍCONES

### Status do Funcionário
```
✅ Ativo          → Verde (#22c55e)
🏖️ Férias         → Azul (#3b82f6)
🏥 Afastado       → Amarelo (#eab308)
❌ Demitido       → Vermelho (#ef4444)
⏸️ Suspenso       → Cinza (#6b7280)
```

### Status de Férias
```
⏳ Solicitada     → Amarelo (#eab308)
✅ Aprovada       → Verde (#22c55e)
❌ Rejeitada      → Vermelho (#ef4444)
🏖️ Em andamento  → Azul (#3b82f6)
✔️ Concluída      → Cinza (#6b7280)
```

### Departamentos (Exemplos)
```
💻 TI / Tecnologia
💰 Financeiro
📊 Comercial
👥 RH / Pessoas
🏭 Operações
📣 Marketing
🎯 Vendas
⚙️ Suporte
```

---

## 🔐 FLUXO DE PERMISSÕES

```
┌─────────────────────────────────────────────────────────┐
│                  USUÁRIO FAZ LOGIN                      │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ SISTEMA VERIFICA      │
            │ PERMISSÕES            │
            └───────┬───────────────┘
                    │
        ┌───────────┼───────────────┐
        │           │               │
        ▼           ▼               ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ ADMIN RH │  │ GESTOR   │  │ FUNCIONÁRIO  │
└────┬─────┘  └────┬─────┘  └──────┬───────┘
     │             │                │
     │             │                │
     ▼             ▼                ▼
┌──────────┐  ┌──────────┐  ┌──────────────┐
│ Acesso   │  │ Acesso   │  │ Acesso       │
│ TOTAL    │  │ SEU DEPT │  │ PRÓPRIOS     │
│          │  │          │  │ DADOS        │
│ • Ver    │  │ • Ver    │  │              │
│ • Editar │  │ • Editar │  │ • Ver        │
│ • Deletar│  │ • Aprovar│  │ • Solicitar  │
│ • Aprovar│  │   Férias │  │   Férias     │
└──────────┘  └──────────┘  └──────────────┘
```

---

## 📈 ROADMAP DE EVOLUÇÃO

```
FASE 1: MVP (Atual)          FASE 2: Expansão        FASE 3: Avançado
─────────────────────        ────────────────        ────────────────
📋 Cadastro Básico           🕒 Controle Ponto       🤖 IA/Analytics
├─ Funcionários              ├─ Entrada/Saída        ├─ Previsões
├─ Férias                    ├─ Banco de Horas       ├─ Insights
├─ Afastamentos              ├─ Horas Extras         └─ Dashboards
└─ Benefícios                ├─ Justificativas            Avançados
                             │
                             📊 Avaliação Desempenho 🔗 Integrações
                             ├─ Metas                ├─ eSocial
                             ├─ Feedback             ├─ FGTS
                             └─ 360°                 ├─ INSS
                                                     └─ Contador
                             💼 Recrutamento
                             ├─ Vagas                💵 Folha de Pag.
                             ├─ Candidatos           ├─ Cálculos
                             ├─ Entrevistas          ├─ Impostos
                             └─ Onboarding           └─ Holerites
```

---

## 🏗️ ARQUITETURA TÉCNICA DETALHADA

```
┌───────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                        │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Pages/                  Components/                 Lib/      │
│  ├─ Dashboard.tsx        ├─ EmployeeTable.tsx       ├─ api    │
│  └─ HRModule.tsx         ├─ VacationTable.tsx       └─ utils  │
│                          ├─ AddEmployeeModal.tsx              │
│                          └─ EmployeeDetailModal.tsx           │
│                                                                │
└───────────┬───────────────────────────────────────────────────┘
            │ HTTP/JSON
            │ (Fetch API)
            │
┌───────────▼───────────────────────────────────────────────────┐
│                      BACKEND (PHP 8.2)                         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  app_hr.php                srv/                               │
│  ├─ GET /employees         ├─ config.php (DB)                │
│  ├─ POST /employees        ├─ permissions.php                │
│  ├─ PUT /employees         └─ auth.php                       │
│  ├─ DELETE /employees                                         │
│  ├─ GET /vacations                                            │
│  ├─ POST /vacations                                           │
│  ├─ GET /leaves                                               │
│  └─ GET /stats                                                │
│                                                                │
└───────────┬───────────────────────────────────────────────────┘
            │ PDO
            │ (Prepared Statements)
            │
┌───────────▼───────────────────────────────────────────────────┐
│                     DATABASE (MySQL 8.0)                       │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  Tables:                                                       │
│  ├─ hr_employees       (Cadastro principal)                   │
│  ├─ hr_vacations       (Férias)                               │
│  ├─ hr_leaves          (Afastamentos)                         │
│  ├─ hr_benefits        (Benefícios)                           │
│  ├─ hr_documents       (Documentos)                           │
│  └─ users              (Sistema de autenticação)              │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

```
BANCO DE DADOS
□ Criar tabela hr_employees
□ Criar tabela hr_vacations
□ Criar tabela hr_leaves
□ Criar tabela hr_benefits
□ Criar tabela hr_documents
□ Adicionar índices para performance
□ Popular dados de teste

BACKEND (PHP)
□ Criar app_hr.php
□ Endpoint: Listar funcionários (GET)
□ Endpoint: Criar funcionário (POST)
□ Endpoint: Atualizar funcionário (PUT)
□ Endpoint: Deletar funcionário (DELETE)
□ Endpoint: Estatísticas (GET)
□ Endpoint: Férias (CRUD)
□ Endpoint: Afastamentos (CRUD)
□ Endpoint: Benefícios (CRUD)
□ Endpoint: Upload documentos
□ Implementar validações
□ Adicionar permissões
□ Testes de API

FRONTEND (React)
□ Criar tipos TypeScript (types.ts)
□ Adicionar rotas no apiClient
□ Criar HRDashboard.tsx
□ Criar EmployeeTable.tsx
□ Criar AddEmployeeModal.tsx
□ Criar EditEmployeeModal.tsx
□ Criar EmployeeDetailModal.tsx
□ Criar VacationTable.tsx
□ Criar VacationRequestModal.tsx
□ Criar LeaveTable.tsx
□ Criar BenefitTable.tsx
□ Criar DocumentUploadModal.tsx
□ Adicionar menu "RH" no Header
□ Implementar busca/filtros
□ Implementar paginação
□ Testes de interface

DEPLOY
□ Build da aplicação
□ Upload arquivos backend
□ Executar migrations SQL
□ Configurar permissões
□ Testar em homologação
□ Deploy produção
□ Documentação
```

---

**Última atualização:** 02/06/2026  
**Criado por:** Kiro AI Assistant
