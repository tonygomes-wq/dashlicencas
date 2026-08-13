# 🔑 API Key Individual por Cliente - Guia Completo

## 📋 Visão Geral

Agora cada cliente Bitdefender pode ter sua própria API Key configurada individualmente, permitindo:

- ✅ Sincronização específica por cliente
- ✅ Múltiplas contas Bitdefender GravityZone
- ✅ Controle granular de acesso
- ✅ Histórico de sincronização individual

---

## 🚀 Instalação

### Passo 1: Atualizar Banco de Dados

Execute o script SQL:

```bash
# Via phpMyAdmin
1. Acesse phpMyAdmin
2. Selecione banco faceso56_dashlicencas
3. Vá em "SQL"
4. Cole conteúdo de db_bitdefender_client_api.sql
5. Execute

# Ou via linha de comando
mysql -u faceso56_dashlicencas -p"dash@123@macip" faceso56_dashlicencas < db_bitdefender_client_api.sql
```

**O que será adicionado:**
- ✅ Coluna `client_api_key` - API Key do cliente
- ✅ Coluna `client_access_url` - URL específica (opcional)
- ✅ Coluna `last_sync` - Última sincronização individual

### Passo 2: Arquivos Criados

Verifique se estes arquivos existem:
- ✅ `app_bitdefender_sync_client.php` - API de sincronização individual
- ✅ `src/components/DetailSidebar.tsx` - Atualizado com campos de API
- ✅ `src/types.ts` - Tipos atualizados

---

## 🔧 Como Usar

### Cenário 1: Cliente com Conta Própria no GravityZone

Quando um cliente tem sua própria conta Bitdefender GravityZone:

#### 1. Obter API Key do Cliente

**No GravityZone do cliente:**
1. Acesse https://gravityzone.bitdefender.com/
2. Login com conta do cliente
3. Clique no ícone do usuário → **My Account**
4. Vá em **API keys** → **Add**
5. Descrição: "Dashboard Macip - Sincronização"
6. Selecione APIs:
   - ✅ **Licensing**
   - ✅ **Companies** (opcional)
7. Clique em **Generate**
8. **Copie a chave** (só aparece uma vez!)

#### 2. Obter Access URL

Na mesma página:
1. Procure **Control Center API**
2. Copie o **Access URL**
3. Exemplo: `https://cloud.gravityzone.bitdefender.com/api`

#### 3. Configurar no Dashboard

1. Abra o dashboard
2. Clique no cliente na tabela Bitdefender
3. Role até a seção **"API Bitdefender (Opcional)"**
4. Preencha:
   - **API Key do Cliente:** Cole a chave obtida
   - **Access URL do Cliente:** Cole a URL (ou deixe padrão)
5. Clique em **"Salvar Alterações"**

#### 4. Sincronizar

1. Após salvar, aparecerá o botão **"Sincronizar Este Cliente"**
2. Clique no botão
3. Aguarde a sincronização (alguns segundos)
4. Dados atualizados:
   - ✅ Serial Chave
   - ✅ Total de Licenças
   - ✅ Vencimento

---

### Cenário 2: Sincronização Global + Individual

Você pode ter:
- **API Global:** Sincroniza todos os clientes de uma vez
- **APIs Individuais:** Sincroniza clientes específicos

**Exemplo de uso:**
```
Cliente A → Usa API Global (sincronização em massa)
Cliente B → Tem API própria (sincronização individual)
Cliente C → Usa API Global
Cliente D → Tem API própria
```

---

## 📊 Interface Atualizada

### Janela de Detalhes do Cliente

```
┌─────────────────────────────────────────────────────┐
│ Detalhes da Licença Bitdefender                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Status de Renovação: [Pendente ▼]                  │
│                                                     │
│ Empresa: [CRIART                              ]    │
│ Responsável: [                                ]    │
│ Email: [antivirus@criart@gmail.com            ]    │
│ Serial Chave: [U5TBF0D                        ]    │
│ Total de Licenças: [7                         ]    │
│ Vencimento: [2020-11-28                       ]    │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 🔐 API Bitdefender (Opcional)               │   │
│ │                                             │   │
│ │ Configure uma API Key específica para       │   │
│ │ este cliente para sincronização individual  │   │
│ │                                             │   │
│ │ API Key do Cliente:                         │   │
│ │ [••••••••••••••••••••••••••••••••]         │   │
│ │                                             │   │
│ │ Access URL do Cliente:                      │   │
│ │ [https://cloud.gravityzone...]             │   │
│ │                                             │   │
│ │ ℹ️ Última sincronização:                    │   │
│ │ 16/03/2026 14:30:45                        │   │
│ │                                             │   │
│ │ [🔄 Sincronizar Este Cliente]              │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│                          [💾 Salvar Alterações]    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Sincronização Individual

```
1. Usuário clica em "Sincronizar Este Cliente"
   ↓
2. Sistema valida se cliente tem API Key configurada
   ↓
3. Conecta na API do Bitdefender usando credenciais do cliente
   ↓
4. Busca informações de licença (getLicenseInfo)
   ↓
5. Atualiza 3 colunas no banco:
   - license_key
   - total_licenses
   - expiration_date
   ↓
6. Atualiza campo last_sync com timestamp
   ↓
7. Registra log da operação
   ↓
8. Exibe mensagem de sucesso
   ↓
9. Recarrega página para mostrar dados atualizados
```

---

## 🆚 Comparação: Global vs Individual

| Aspecto | API Global | API Individual |
|---------|-----------|----------------|
| **Configuração** | Uma vez no painel | Por cliente |
| **Sincronização** | Todos de uma vez | Um por vez |
| **Uso** | Clientes da mesma conta | Clientes com contas próprias |
| **Botão** | "Sincronizar Agora" (painel) | "Sincronizar Este Cliente" (detalhes) |
| **Velocidade** | Mais rápido (batch) | Individual |
| **Controle** | Geral | Granular |

---

## 💡 Casos de Uso

### Caso 1: MSP com Múltiplos Clientes

**Situação:** Você é um MSP e gerencia Bitdefender para vários clientes

**Solução:**
- Configure API Global para clientes na sua conta GravityZone
- Configure APIs individuais para clientes com contas próprias

### Caso 2: Cliente VIP com Acesso Próprio

**Situação:** Cliente grande tem sua própria conta GravityZone

**Solução:**
- Solicite API Key do cliente
- Configure no dashboard
- Sincronize individualmente

### Caso 3: Migração de Conta

**Situação:** Cliente migrou para conta própria

**Solução:**
1. Obtenha nova API Key da conta do cliente
2. Atualize no dashboard
3. Sincronize para validar

---

## 🔐 Segurança

### Armazenamento

- ✅ API Keys armazenadas no banco de dados
- ✅ Campo tipo `password` na interface (oculta visualmente)
- ⚠️ **Recomendação:** Criptografar no banco (implementação futura)

### Acesso

- ✅ Apenas administradores podem configurar
- ✅ Apenas administradores podem sincronizar
- ✅ Validação de permissões no backend

### Boas Práticas

1. **Não compartilhe** API Keys entre clientes
2. **Revogue** chaves antigas ao migrar
3. **Monitore** logs de sincronização
4. **Documente** qual cliente usa qual API

---

## 📝 Logs e Histórico

### Visualizar Logs

1. Abra o painel de sincronização global
2. Vá na aba **"Histórico"**
3. Veja todas as sincronizações:
   - Globais (múltiplos clientes)
   - Individuais (cliente específico)

### Formato do Log

```
✅ Cliente ID 5: Cliente sincronizado em 1.2s
❌ Cliente ID 8: Erro - API Key inválida
⚠️ Cliente ID 12: Aviso - Limite de requisições
```

---

## 🐛 Troubleshooting

### Erro: "Configure a API Key do cliente primeiro"
- ✅ Preencha o campo "API Key do Cliente"
- ✅ Salve as alterações
- ✅ Tente sincronizar novamente

### Erro: "API Key inválida"
- ✅ Verifique se copiou a chave completa
- ✅ Confirme que a chave não foi revogada
- ✅ Teste no GravityZone diretamente

### Erro: "Resposta inválida da API"
- ✅ Verifique a Access URL
- ✅ Confirme que o cliente tem licenças ativas
- ✅ Veja os logs para mais detalhes

### Botão não aparece
- ✅ Salve a API Key primeiro
- ✅ Recarregue a página
- ✅ Verifique se é administrador

---

## 📊 Dados Sincronizados

### O que é atualizado:

| Campo | Origem API | Destino Banco |
|-------|-----------|---------------|
| Chave da Licença | `licenseKey` | `license_key` |
| Total de Licenças | `seats` | `total_licenses` |
| Data de Vencimento | `expirationDate` | `expiration_date` |
| Última Sincronização | Timestamp | `last_sync` |

### O que NÃO é alterado:

- ❌ Nome da empresa
- ❌ Responsável
- ❌ Email de contato
- ❌ Status de renovação

---

## ✅ Checklist de Configuração

Por cliente com API própria:

- [ ] Obtive API Key do GravityZone do cliente
- [ ] Obtive Access URL (ou uso padrão)
- [ ] Abri detalhes do cliente no dashboard
- [ ] Preenchi "API Key do Cliente"
- [ ] Preenchi "Access URL" (opcional)
- [ ] Salvei as alterações
- [ ] Cliquei em "Sincronizar Este Cliente"
- [ ] Verifiquei dados atualizados
- [ ] Documentei a configuração

---

## 🎉 Benefícios

### Para o MSP

- ✅ Gerencia múltiplas contas GravityZone
- ✅ Sincronização flexível (global + individual)
- ✅ Controle granular por cliente
- ✅ Histórico completo de operações

### Para o Cliente

- ✅ Mantém controle da própria conta
- ✅ Dados sempre atualizados
- ✅ Transparência total
- ✅ Sem compartilhamento de credenciais

---

## 🔄 Próximas Melhorias

Sugestões para versões futuras:

- 🔐 Criptografia de API Keys no banco
- 📧 Notificações de sincronização
- 📊 Dashboard de status por cliente
- ⏰ Agendamento de sincronização individual
- 📈 Métricas de uso da API
- 🔍 Auditoria de acessos

---

**Desenvolvido para Dashboard de Licenças - Macip Tecnologia**  
**Data:** 16/03/2026
