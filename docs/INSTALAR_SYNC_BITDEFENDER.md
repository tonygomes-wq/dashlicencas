# 🔄 Instalação da Sincronização Bitdefender

## ✅ O que será sincronizado

A integração irá atualizar automaticamente estas 3 colunas na tabela Bitdefender:

1. **License Key** (Chave da Licença)
2. **Total Licenses** (Total de Licenças)
3. **Expiration Date** (Data de Vencimento)

---

## 📦 Passo 1: Instalar Backend (5 minutos)

### 1.1 Criar Tabelas no Banco

Execute o script SQL via phpMyAdmin:

1. Acesse phpMyAdmin
2. Selecione o banco `faceso56_dashlicencas`
3. Vá em "SQL"
4. Cole o conteúdo de `db_bitdefender_sync_schema.sql`
5. Clique em "Executar"

Ou via linha de comando:
```bash
mysql -u faceso56_dashlicencas -p"dash@123@macip" faceso56_dashlicencas < db_bitdefender_sync_schema.sql
```

### 1.2 Verificar Arquivo PHP

O arquivo `app_bitdefender_sync.php` já está criado na raiz do projeto.

---

## 🔑 Passo 2: Obter API Key do Bitdefender (3 minutos)

### 2.1 Acessar GravityZone

1. Acesse https://gravityzone.bitdefender.com/
2. Faça login com conta de administrador

### 2.2 Gerar API Key

1. Clique no ícone do usuário (canto superior direito)
2. Selecione **"My Account"**
3. Role até a seção **"API keys"**
4. Clique em **"Add"**
5. Digite uma descrição: "Dashboard Licenças - Sincronização"
6. Selecione as APIs necessárias:
   - ✅ **Companies**
   - ✅ **Licensing**
7. Clique em **"Generate"**
8. **IMPORTANTE:** Copie a chave e salve em local seguro!
   - A chave só é exibida uma vez
   - Você não poderá vê-la novamente

### 2.3 Obter Access URL

Na mesma página "My Account":
1. Procure a seção **"Control Center API"**
2. Copie o valor do campo **"Access URL"**
3. Exemplo: `https://cloud.gravityzone.bitdefender.com/api`

---

## ⚙️ Passo 3: Configurar no Dashboard (2 minutos)

### 3.1 Adicionar Botão no Header

Você precisará adicionar um botão no Header do dashboard para abrir o painel de sincronização.

**Localização:** `src/components/Header.tsx`

Adicione:
```typescript
import BitdefenderSyncPanel from './BitdefenderSyncPanel';

// No componente:
const [isSyncPanelOpen, setIsSyncPanelOpen] = useState(false);

// No JSX, adicione o botão:
<button
  onClick={() => setIsSyncPanelOpen(true)}
  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  title="Sincronizar com Bitdefender"
>
  <RefreshCw className="w-5 h-5" />
</button>

// E o modal:
<BitdefenderSyncPanel
  isOpen={isSyncPanelOpen}
  onClose={() => setIsSyncPanelOpen(false)}
/>
```

### 3.2 Configurar API

1. Clique no botão de sincronização
2. Cole a **API Key** obtida
3. Cole a **Access URL** obtida
4. Marque **"Ativar sincronização automática"** (opcional)
5. Clique em **"Testar Conexão"**
6. Se OK, clique em **"Salvar Configuração"**

---

## 🚀 Passo 4: Sincronizar (1 minuto)

### 4.1 Primeira Sincronização

1. No painel de sincronização, clique em **"Sincronizar Agora"**
2. Aguarde o processo (pode levar alguns segundos)
3. Você verá uma mensagem de sucesso com:
   - Número de registros atualizados
   - Tempo de execução

### 4.2 Verificar Resultados

1. Feche o painel de sincronização
2. A página será recarregada automaticamente
3. Verifique a tabela Bitdefender:
   - ✅ Chaves de licença atualizadas
   - ✅ Total de licenças atualizado
   - ✅ Datas de vencimento atualizadas

---

## 📊 Como Funciona

### Fluxo de Sincronização

```
1. Sistema conecta na API do Bitdefender
   ↓
2. Busca lista de empresas (companies)
   ↓
3. Para cada empresa, busca detalhes da licença
   ↓
4. Compara com registros locais
   ↓
5. Atualiza ou cria registros no banco
   ↓
6. Registra log da operação
```

### Mapeamento de Dados

```
API Bitdefender          →  Banco Local
─────────────────────────────────────────
licenseKey               →  license_key
seats (total)            →  total_licenses
expirationDate           →  expiration_date
company.name             →  company
```

### O que é Atualizado

- ✅ **Registros Existentes:** Atualiza as 3 colunas
- ✅ **Novos Registros:** Cria com os dados da API
- ✅ **Log:** Registra todas as operações

---

## 🔄 Sincronização Automática (Opcional)

### Configurar Cron Job

Se você marcou "Ativar sincronização automática", configure um cron job:

**Linux/Mac:**
```bash
# Editar crontab
crontab -e

# Adicionar linha (executar a cada hora)
0 * * * * php /caminho/para/app_bitdefender_sync.php
```

**Windows (Task Scheduler):**
1. Abra "Agendador de Tarefas"
2. Criar Tarefa Básica
3. Nome: "Sincronizar Bitdefender"
4. Gatilho: Diariamente, a cada 1 hora
5. Ação: Iniciar programa
6. Programa: `php.exe`
7. Argumentos: `C:\caminho\para\app_bitdefender_sync.php`

---

## 📝 Histórico de Sincronizações

### Visualizar Logs

1. Abra o painel de sincronização
2. Clique na aba **"Histórico"**
3. Veja todas as sincronizações:
   - ✅ Sucesso (verde)
   - ❌ Erro (vermelho)
   - ⚠️ Aviso (amarelo)

### Informações do Log

- Data e hora
- Status da operação
- Mensagem descritiva
- Número de registros afetados

---

## 🐛 Troubleshooting

### Erro: "API não configurada"
- ✅ Verifique se salvou a configuração
- ✅ Confirme que marcou "Ativar"

### Erro: "Conexão falhou"
- ✅ Verifique a API Key
- ✅ Confirme a Access URL
- ✅ Teste a conexão primeiro

### Erro: "Limite de requisições excedido"
- ⏳ Aguarde 1 minuto
- ⏳ Tente novamente
- ℹ️ API limita a 10 requisições/segundo

### Nenhum registro atualizado
- ✅ Verifique se há empresas no GravityZone
- ✅ Confirme que as empresas têm licenças
- ✅ Veja os logs para detalhes

---

## ✅ Checklist de Instalação

- [ ] Executei o script SQL
- [ ] Obtive a API Key do Bitdefender
- [ ] Obtive a Access URL
- [ ] Configurei no painel
- [ ] Testei a conexão
- [ ] Executei primeira sincronização
- [ ] Verifiquei os dados atualizados
- [ ] (Opcional) Configurei cron job

---

## 🎉 Pronto!

Agora você tem sincronização automática com o Bitdefender!

### Benefícios

- ✅ Dados sempre atualizados
- ✅ Sem entrada manual
- ✅ Histórico completo
- ✅ Alertas automáticos

### Próximos Passos

- Configure sincronização automática
- Monitore os logs regularmente
- Ajuste o intervalo conforme necessário

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs no painel
2. Confirme as credenciais da API
3. Teste a conexão manualmente

---

**Desenvolvido para Dashboard de Licenças - Macip Tecnologia**  
**Data:** 16/03/2026
