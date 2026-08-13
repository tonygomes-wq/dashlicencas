# 🔧 Guia: Como Configurar FortiGate API

## 📍 Onde Configurar o Token da API FortiGate

A configuração da API FortiGate é feita **dispositivo por dispositivo** através da tabela de dispositivos.

---

## 🎯 Passo a Passo

### 1️⃣ **Ir para a Página FortiGate**
1. No menu lateral, clique em **"FortiGate"**
2. Você verá a lista de todos os dispositivos FortiGate

### 2️⃣ **Localizar o Ícone de Configuração**
Na tabela, cada dispositivo tem **dois ícones** na coluna "API":
- 🔧 **Ícone de Engrenagem (Settings)** - Abre o modal de configuração
- 🔄 **Ícone de Sincronização (Refresh)** - Sincroniza manualmente

### 3️⃣ **Abrir o Modal de Configuração**
1. Clique no **ícone de engrenagem** (🔧) do dispositivo que deseja configurar
2. O modal **"Configuração API FortiGate"** será aberto

### 4️⃣ **Preencher os Dados da API**

No modal, você verá os seguintes campos:

#### **Configurações Básicas:**
- ✅ **Habilitar API** - Marque o checkbox para ativar
- 📍 **IP/Hostname** - Endereço do FortiGate (ex: `192.168.1.1` ou `fortigate.empresa.com`)
- 🔑 **Token da API** - Token gerado no FortiGate
- 🔌 **Porta** - Porta HTTPS (padrão: `443`)
- 🔒 **Verificar SSL** - Marque se usar certificado válido

#### **Configurações de Sincronização:**
- ⏱️ **Intervalo de Sincronização** - Em minutos (padrão: `60`)

### 5️⃣ **Testar a Conexão**
1. Após preencher os dados, clique em **"Testar Conexão"**
2. O sistema tentará conectar ao FortiGate
3. **Resultado esperado:**
   - ✅ **Sucesso:** "Conexão estabelecida com sucesso!"
   - ❌ **Erro:** Mensagem detalhada do problema

### 6️⃣ **Salvar a Configuração**
1. Se o teste foi bem-sucedido, clique em **"Salvar Configuração"**
2. A API será habilitada para esse dispositivo
3. O sistema começará a sincronizar automaticamente

### 7️⃣ **Sincronizar Manualmente (Opcional)**
1. Após salvar, você pode clicar em **"Sincronizar Agora"**
2. Ou clicar no **ícone de sincronização** (🔄) na tabela
3. O sistema buscará dados atualizados do FortiGate

---

## 🔑 Como Gerar o Token no FortiGate

### No FortiGate (Interface Web):

1. **Login no FortiGate**
   - Acesse: `https://IP_DO_FORTIGATE`
   - Faça login como administrador

2. **Criar Perfil de API**
   - Vá em: **System → Admin Profiles**
   - Crie um novo perfil ou use um existente
   - Habilite permissões de leitura para:
     - System
     - Firewall
     - VPN
     - Log & Report

3. **Criar Usuário de API**
   - Vá em: **System → Administrators**
   - Clique em **"Create New" → "REST API Admin"**
   - Preencha:
     - **Username:** `api_dashboard` (ou outro nome)
     - **Administrator Profile:** Selecione o perfil criado
     - **Trusted Hosts:** Adicione o IP do servidor do dashboard
   - Clique em **"OK"**

4. **Copiar o Token**
   - Após criar, o FortiGate mostrará o **Token da API**
   - **⚠️ IMPORTANTE:** Copie e guarde o token imediatamente!
   - O token só é mostrado uma vez e não pode ser recuperado depois

5. **Usar o Token no Dashboard**
   - Cole o token no campo **"Token da API"** do modal de configuração
   - Teste a conexão
   - Salve

---

## 📊 Monitoramento da API

### Card de Estatísticas (Dashboard Home)

Na página inicial, você verá o card **"FortiGate API"** com:

- 🛡️ **Dispositivos Configurados** - Quantos têm API habilitada
- ✅ **Sincronizados (1h)** - Sincronizados na última hora
- ⚠️ **Alertas Pendentes** - Alertas não resolvidos
- 🚨 **Alertas Críticos** - Alertas que requerem atenção
- ⏰ **Licenças Expirando (30d)** - Licenças próximas do vencimento
- 📊 **Status Geral** - OK ou ATENÇÃO

### Botão "Sincronizar Todos"

No card, há um botão para sincronizar todos os dispositivos de uma vez.

---

## 🔍 Verificar Status da Sincronização

### Na Tabela FortiGate:

Cada dispositivo mostra:
- ✅ **Ícone verde** - API configurada e funcionando
- ⚠️ **Ícone amarelo** - API configurada mas com problemas
- ⭕ **Sem ícone** - API não configurada

### No Modal de Configuração:

Mostra:
- **Última Sincronização:** Data e hora
- **Status:** Sucesso, Falha, Pendente ou Nunca
- **Erro:** Mensagem de erro (se houver)

---

## 🚨 Problemas Comuns

### ❌ "Erro ao conectar: Connection timeout"
**Causa:** IP/Hostname incorreto ou FortiGate inacessível
**Solução:**
- Verifique se o IP está correto
- Teste ping para o FortiGate
- Verifique firewall entre servidor e FortiGate

### ❌ "Erro ao conectar: SSL certificate verify failed"
**Causa:** Certificado SSL inválido ou autoassinado
**Solução:**
- Desmarque "Verificar SSL" no modal
- Ou instale certificado válido no FortiGate

### ❌ "Erro ao conectar: Unauthorized"
**Causa:** Token inválido ou expirado
**Solução:**
- Gere um novo token no FortiGate
- Atualize o token no modal de configuração

### ❌ "Erro ao conectar: Forbidden"
**Causa:** Perfil de API sem permissões adequadas
**Solução:**
- Verifique o perfil do usuário de API no FortiGate
- Habilite permissões de leitura necessárias

---

## 📋 Checklist de Configuração

- [ ] **1. Gerar token no FortiGate**
  - Criar perfil de API
  - Criar usuário REST API
  - Copiar token

- [ ] **2. Configurar no Dashboard**
  - Abrir modal de configuração (ícone 🔧)
  - Marcar "Habilitar API"
  - Preencher IP/Hostname
  - Colar token
  - Configurar porta (443)
  - Definir intervalo de sincronização

- [ ] **3. Testar conexão**
  - Clicar em "Testar Conexão"
  - Verificar mensagem de sucesso

- [ ] **4. Salvar e sincronizar**
  - Clicar em "Salvar Configuração"
  - Clicar em "Sincronizar Agora"

- [ ] **5. Verificar dados**
  - Ver se dados foram sincronizados
  - Verificar card de estatísticas na home
  - Conferir alertas (se houver)

---

## 🎯 Dados Sincronizados

A API FortiGate sincroniza:

### 📊 **Informações do Dispositivo:**
- Nome do dispositivo
- Versão do firmware
- Número de série
- Modelo
- Status operacional

### 🔐 **Licenças:**
- Tipo de licença
- Data de expiração
- Status (ativa, expirada, expirando)
- Dias restantes

### ⚠️ **Alertas:**
- Alertas de sistema
- Alertas de segurança
- Alertas de licença
- Severidade (crítico, aviso, info)

### 📈 **Estatísticas:**
- CPU usage
- Memória usage
- Sessões ativas
- Throughput

---

## 🔄 Sincronização Automática

Após configurar, o sistema sincroniza automaticamente:

- **Intervalo:** Definido no modal (padrão: 60 minutos)
- **Processo:** Executado em background via cron
- **Logs:** Salvos na tabela `fortigate_sync_history`
- **Alertas:** Criados automaticamente se houver problemas

---

## 📁 Arquivos Relacionados

### Frontend:
- `src/components/FortigateAPIConfig.tsx` - Modal de configuração
- `src/components/dashboard/FortigateAPIStats.tsx` - Card de estatísticas
- `src/components/FortigateTable.tsx` - Tabela com ícones de API

### Backend:
- `app_fortigate_api.php` - Endpoint REST da API
- `srv/FortigateAPI.php` - Classe de comunicação com FortiGate
- `srv/FortigateSync.php` - Classe de sincronização
- `cron_fortigate_sync.php` - Script de sincronização automática

### Banco de Dados:
- `fortigate_api_config` - Configurações de API
- `fortigate_devices_extended` - Dados sincronizados
- `fortigate_sync_history` - Histórico de sincronizações
- `fortigate_alerts` - Alertas gerados

---

## ✅ Conclusão

A configuração da API FortiGate permite:
- ✅ Sincronização automática de licenças
- ✅ Monitoramento em tempo real
- ✅ Alertas automáticos
- ✅ Estatísticas detalhadas
- ✅ Histórico de sincronizações

**Configure agora e tenha controle total dos seus dispositivos FortiGate!** 🚀
