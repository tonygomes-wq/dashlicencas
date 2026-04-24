# 🎨 PLANO VISUAL - NOVO LAYOUT DO DASHBOARD

## 📋 VISÃO GERAL

Reformulação completa do frontend com sidebar esquerda e dashboard com informações da API Bitdefender.

---

## 🎯 ESTRUTURA PROPOSTA

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER (Fixo no topo)                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 🔒 Dashboard Macip  │  🔔 Notificações  │  👤 Admin  │  🌙 Dark │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├──────────┬──────────────────────────────────────────────────────────────┤
│          │                                                              │
│ SIDEBAR  │  CONTEÚDO PRINCIPAL                                          │
│ (Fixa)   │  (Área de trabalho dinâmica)                                 │
│          │                                                              │
│ 📊 Dash  │  ┌────────────────────────────────────────────────────┐     │
│ 🛡️ Bit   │  │                                                    │     │
│ 🔥 Fort  │  │  Conteúdo muda conforme menu selecionado           │     │
│ 📧 O365  │  │                                                    │     │
│ ✉️ Gmail │  │  - Dashboard: Cards com estatísticas               │     │
│ 🗺️ Rede  │  │  - Bitdefender: Tabela de licenças                │     │
│ 💻 Inv   │  │  - Fortigate: Tabela de dispositivos               │     │
│          │  │  - etc.                                            │     │
│          │  │                                                    │     │
│          │  └────────────────────────────────────────────────────┘     │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

---

## 🎨 MOCKUP VISUAL DETALHADO

### 1. HEADER (Barra Superior)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  🔒 Dashboard Macip Tecnologia          🔔 3   👤 Admin ▼   🌙 Dark Mode  ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Elementos:**
- Logo + Nome da empresa (esquerda)
- Ícone de notificações com badge (centro-direita)
- Menu do usuário com dropdown (direita)
- Toggle dark/light mode (extrema direita)

**Altura:** 64px
**Background:** Branco (light) / Cinza escuro (dark)
**Fixo:** Sim (sempre visível)

---

### 2. SIDEBAR (Menu Lateral Esquerdo)

```
╔═══════════════════╗
║                   ║
║  📊 Dashboard     ║  ← Selecionado (azul)
║                   ║
║  🛡️ Bitdefender   ║
║                   ║
║  🔥 Fortigate     ║
║                   ║
║  📧 Office 365    ║
║                   ║
║  ✉️ Gmail         ║
║                   ║
║  🗺️ Mapa de Rede  ║
║                   ║
║  💻 Inventário    ║
║                   ║
║  ─────────────    ║
║                   ║
║  ⚙️ Configurações ║
║                   ║
║  🚪 Sair          ║
║                   ║
╚═══════════════════╝
```

**Largura:** 240px (expandida) / 64px (colapsada)
**Background:** Cinza claro (light) / Cinza muito escuro (dark)
**Fixo:** Sim (sempre visível)
**Colapsável:** Sim (botão no topo)

**Itens do Menu:**
1. Dashboard (ícone: 📊)
2. Bitdefender (ícone: 🛡️)
3. Fortigate (ícone: 🔥)
4. Office 365 (ícone: 📧)
5. Gmail (ícone: ✉️)
6. Mapa de Rede (ícone: 🗺️)
7. Inventário (ícone: 💻)
8. Configurações (ícone: ⚙️) - no final
9. Sair (ícone: 🚪) - no final

---

### 3. DASHBOARD (Página Inicial)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Dashboard - Visão Geral                                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          ║
║  │ 🛡️ Bitdefender  │  │ 🔥 Fortigate    │  │ 📧 Office 365   │          ║
║  │                 │  │                 │  │                 │          ║
║  │  Total: 45      │  │  Total: 23      │  │  Total: 120     │          ║
║  │  Vencidos: 3    │  │  Vencidos: 1    │  │  Ativos: 115    │          ║
║  │  7 dias: 5      │  │  7 dias: 2      │  │  Inativos: 5    │          ║
║  │                 │  │                 │  │                 │          ║
║  └─────────────────┘  └─────────────────┘  └─────────────────┘          ║
║                                                                           ║
║  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          ║
║  │ ✉️ Gmail        │  │ 💻 Inventário   │  │ 🗺️ Rede         │          ║
║  │                 │  │                 │  │                 │          ║
║  │  Total: 85      │  │  Dispositivos:  │  │  Dispositivos:  │          ║
║  │  Ativos: 80     │  │  Desktop: 45    │  │  Online: 67     │          ║
║  │  Inativos: 5    │  │  Notebook: 32   │  │  Offline: 3     │          ║
║  │                 │  │  Servidor: 8    │  │                 │          ║
║  └─────────────────┘  └─────────────────┘  └─────────────────┘          ║
║                                                                           ║
║  ┌───────────────────────────────────────────────────────────────────┐   ║
║  │ 📊 Estatísticas Bitdefender (via API)                            │   ║
║  ├───────────────────────────────────────────────────────────────────┤   ║
║  │                                                                   │   ║
║  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │   ║
║  │  │ Endpoints    │  │ Ameaças      │  │ Atualizações │           │   ║
║  │  │ Protegidos   │  │ Bloqueadas   │  │ Pendentes    │           │   ║
║  │  │              │  │              │  │              │           │   ║
║  │  │    1.234     │  │     567      │  │      12      │           │   ║
║  │  │              │  │              │  │              │           │   ║
║  │  └──────────────┘  └──────────────┘  └──────────────┘           │   ║
║  │                                                                   │   ║
║  │  ┌──────────────────────────────────────────────────────────┐    │   ║
║  │  │ 📈 Gráfico de Ameaças (Últimos 7 dias)                  │    │   ║
║  │  │                                                          │    │   ║
║  │  │  [Gráfico de linhas mostrando ameaças por dia]          │    │   ║
║  │  │                                                          │    │   ║
║  │  └──────────────────────────────────────────────────────────┘    │   ║
║  │                                                                   │   ║
║  └───────────────────────────────────────────────────────────────────┘   ║
║                                                                           ║
║  ┌───────────────────────────────────────────────────────────────────┐   ║
║  │ ⚠️ Alertas Recentes                                               │   ║
║  ├───────────────────────────────────────────────────────────────────┤   ║
║  │  • Licença Bitdefender "Empresa X" vence em 3 dias               │   ║
║  │  • Fortigate "Serial ABC123" vencido há 2 dias                    │   ║
║  │  • 12 endpoints Bitdefender com atualizações pendentes            │   ║
║  └───────────────────────────────────────────────────────────────────┘   ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Seções:**
1. **Cards de Resumo** (Grid 3 colunas)
   - Bitdefender, Fortigate, Office 365
   - Gmail, Inventário, Rede

2. **Estatísticas Bitdefender API** (Seção destacada)
   - Cards com métricas em tempo real
   - Gráfico de ameaças
   - Dados obtidos via API Bitdefender

3. **Alertas Recentes** (Lista)
   - Licenças vencendo
   - Problemas detectados
   - Ações necessárias

---

### 4. PÁGINA BITDEFENDER

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Bitdefender - Gerenciamento de Licenças                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔍 Buscar...  │  📊 Status: Todos ▼  │  📅 Vencimento ▼  │  ➕ Nova     ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ Empresa          │ Licenças │ Vencimento │ Status      │ Ações      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │ Empresa A        │ 50/50    │ 15/05/2026 │ ⚠️ 7 dias   │ 👁️ ✏️ 🗑️  │ ║
║  │ Empresa B        │ 30/30    │ 20/06/2026 │ ✅ OK       │ 👁️ ✏️ 🗑️  │ ║
║  │ Empresa C        │ 25/25    │ 10/04/2026 │ ❌ Vencido  │ 👁️ ✏️ 🗑️  │ ║
║  │ ...              │ ...      │ ...        │ ...         │ ...        │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║  Mostrando 1-10 de 45 registros  │  ◀️ 1 2 3 4 5 ▶️                      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Funcionalidades:**
- Busca em tempo real
- Filtros por status e vencimento
- Tabela responsiva
- Ações: Visualizar, Editar, Deletar
- Paginação

---

### 5. PÁGINA FORTIGATE

Similar à página Bitdefender, mas com colunas específicas:
- Cliente
- Serial
- Modelo
- Vencimento
- Status
- Ações

---

### 6. PÁGINA OFFICE 365

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Office 365 - Gerenciamento de Licenças                                  ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  📁 Clientes (15)  │  👥 Licenças (120)                                   ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ Cliente          │ Licenças │ Tipo        │ Status      │ Ações      │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │ Cliente A        │ 25       │ Business    │ ✅ Ativo    │ 👁️ ✏️      │ ║
║  │ Cliente B        │ 50       │ Enterprise  │ ✅ Ativo    │ 👁️ ✏️      │ ║
║  │ ...              │ ...      │ ...         │ ...         │ ...        │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 7. PÁGINA GMAIL

Similar ao Office 365, com estrutura de clientes e licenças.

---

### 8. PÁGINA MAPA DE REDE

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Mapa de Rede - Topologia e Diagramas                                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  ➕ Novo Diagrama  │  📥 Importar  │  📤 Exportar                         ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │                                                                       │ ║
║  │                    [Área de Canvas Interativa]                       │ ║
║  │                                                                       │ ║
║  │  Arraste e solte elementos para criar diagramas de rede              │ ║
║  │                                                                       │ ║
║  │  🖥️ Servidor    🔥 Firewall    🔀 Switch    💻 Desktop               │ ║
║  │                                                                       │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

**Funcionalidades:**
- Canvas interativo (usando @xyflow/react)
- Drag and drop de elementos
- Conexões entre dispositivos
- Exportar como imagem
- Salvar diagramas

---

### 9. PÁGINA INVENTÁRIO

```
╔═══════════════════════════════════════════════════════════════════════════╗
║  Inventário de Hardware                                                   ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║  🔍 Buscar...  │  💻 Tipo: Todos ▼  │  📍 Local ▼  │  ➕ Novo             ║
║                                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐ ║
║  │ Nome         │ Tipo     │ Cliente  │ CPU      │ RAM  │ Status  │ ⚙️  │ ║
║  ├─────────────────────────────────────────────────────────────────────┤ ║
║  │ PC-001       │ Desktop  │ Emp. A   │ i5-9400  │ 16GB │ ✅ Ativo│ ... │ ║
║  │ NB-045       │ Notebook │ Emp. B   │ i7-10750 │ 32GB │ ✅ Ativo│ ... │ ║
║  │ SRV-MAIN     │ Servidor │ Interno  │ Xeon     │ 64GB │ ✅ Ativo│ ... │ ║
║  │ ...          │ ...      │ ...      │ ...      │ ...  │ ...     │ ... │ ║
║  └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎨 PALETA DE CORES

### Light Mode
```
Background Principal:    #F3F4F6 (gray-100)
Background Sidebar:      #FFFFFF (white)
Background Cards:        #FFFFFF (white)
Texto Principal:         #111827 (gray-900)
Texto Secundário:        #6B7280 (gray-500)
Accent (Azul):          #3B82F6 (blue-600)
Sucesso (Verde):        #10B981 (green-500)
Aviso (Amarelo):        #F59E0B (amber-500)
Erro (Vermelho):        #EF4444 (red-500)
Bordas:                 #E5E7EB (gray-200)
```

### Dark Mode
```
Background Principal:    #111827 (gray-900)
Background Sidebar:      #1F2937 (gray-800)
Background Cards:        #1F2937 (gray-800)
Texto Principal:         #F9FAFB (gray-50)
Texto Secundário:        #9CA3AF (gray-400)
Accent (Azul):          #60A5FA (blue-400)
Sucesso (Verde):        #34D399 (green-400)
Aviso (Amarelo):        #FBBF24 (amber-400)
Erro (Vermelho):        #F87171 (red-400)
Bordas:                 #374151 (gray-700)
```

---

## 📐 DIMENSÕES E ESPAÇAMENTOS

```
Header Height:           64px
Sidebar Width:           240px (expandida) / 64px (colapsada)
Card Padding:            24px
Card Border Radius:      12px
Card Shadow:             0 1px 3px rgba(0,0,0,0.1)
Grid Gap:                24px
Container Max Width:     1400px
Container Padding:       32px
```

---

## 🔄 RESPONSIVIDADE

### Desktop (> 1024px)
- Sidebar sempre visível (240px)
- Grid de 3 colunas para cards
- Tabelas completas

### Tablet (768px - 1024px)
- Sidebar colapsável
- Grid de 2 colunas para cards
- Tabelas com scroll horizontal

### Mobile (< 768px)
- Sidebar como drawer (overlay)
- Grid de 1 coluna para cards
- Tabelas em modo card (vertical)
- Header compacto

---

## 🎯 COMPONENTES NECESSÁRIOS

### Novos Componentes

1. **Layout/Sidebar.tsx**
   - Menu lateral com navegação
   - Colapsável
   - Ícones + texto

2. **Layout/Header.tsx**
   - Logo
   - Notificações
   - Menu do usuário
   - Dark mode toggle

3. **Layout/MainLayout.tsx**
   - Container principal
   - Header + Sidebar + Content

4. **Dashboard/StatsCard.tsx**
   - Card de estatísticas
   - Ícone + título + valores

5. **Dashboard/BitdefenderAPIStats.tsx**
   - Estatísticas da API Bitdefender
   - Gráficos
   - Métricas em tempo real

6. **Dashboard/AlertsList.tsx**
   - Lista de alertas
   - Priorização por urgência

### Componentes Existentes (Reutilizar)

- Tabelas de licenças
- Modais de detalhes
- Formulários
- Filtros e busca

---

## 📊 INTEGRAÇÃO COM API BITDEFENDER

### Endpoints Necessários

```typescript
// Estatísticas gerais
GET /app_bitdefender_endpoints.php?action=stats
Response: {
  totalEndpoints: number,
  protectedEndpoints: number,
  threatsBlocked: number,
  updatesAvailable: number
}

// Ameaças por período
GET /app_bitdefender_endpoints.php?action=threats&days=7
Response: {
  threats: Array<{
    date: string,
    count: number
  }>
}

// Endpoints com problemas
GET /app_bitdefender_endpoints.php?action=issues
Response: {
  endpoints: Array<{
    name: string,
    issue: string,
    severity: 'low' | 'medium' | 'high'
  }>
}
```

---

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Fase 1: Estrutura Base (2-3 horas)
1. Criar componentes de layout (Sidebar, Header, MainLayout)
2. Implementar navegação entre páginas
3. Configurar rotas
4. Aplicar tema dark/light

### Fase 2: Dashboard (2-3 horas)
1. Criar cards de estatísticas
2. Implementar seção de API Bitdefender
3. Adicionar lista de alertas
4. Integrar dados reais

### Fase 3: Páginas Individuais (3-4 horas)
1. Adaptar páginas existentes ao novo layout
2. Adicionar filtros e buscas
3. Melhorar responsividade
4. Testar em diferentes resoluções

### Fase 4: Polimento (1-2 horas)
1. Animações e transições
2. Loading states
3. Error handling
4. Testes finais

**Tempo Total Estimado:** 8-12 horas

---

## 📝 PRÓXIMOS PASSOS

1. **Aprovação do Design**
   - Revisar mockups
   - Ajustar conforme feedback
   - Definir prioridades

2. **Preparação**
   - Instalar dependências necessárias
   - Criar estrutura de pastas
   - Configurar rotas

3. **Implementação**
   - Seguir plano de implementação
   - Commits incrementais
   - Testes contínuos

4. **Deploy**
   - Build e teste local
   - Deploy no Easypanel
   - Validação em produção

---

**Criado em:** 24/04/2026  
**Status:** 📋 Planejamento  
**Próxima Ação:** Aguardando aprovação para iniciar implementação
