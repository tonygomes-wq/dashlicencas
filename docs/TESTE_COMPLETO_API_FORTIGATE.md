# 🧪 TESTE COMPLETO: API FortiGate - Verificação de Funcionamento

## 📋 SITUAÇÃO ATUAL
- ✅ **Campos salvos**: `api_token` e `api_ip` foram salvos com sucesso
- ✅ **Botão apareceu**: "Sincronizar" está visível no modal
- ❓ **Comunicação API**: Precisa verificar se a sincronização funciona

## 🔍 VERIFICAÇÕES NECESSÁRIAS

### 1. **Verificar Estrutura do Banco**
Acesse: `https://dashlicencas.macip.com.br/testar_sincronizacao_fortigate.php`

**O que deve aparecer:**
- ✅ Tabela `fortigate_api_config` existe
- ✅ Tabela `fortigate_devices_extended` existe  
- ✅ Tabela `fortigate_sync_history` existe
- ✅ Tabela `fortigate_alerts` existe

### 2. **Verificar Configuração Salva**
O script deve mostrar:
- Dispositivos com API habilitada
- IP da API configurado
- Status da última sincronização

### 3. **Testar Sincronização**

#### **Opção A: Via Script de Teste**
1. Acesse: `https://dashlicencas.macip.com.br/testar_sincronizacao_fortigate.php`
2. Selecione o dispositivo "PEGORARO"
3. Clique em "TESTAR SINCRONIZAÇÃO"
4. Verificar resultado

#### **Opção B: Via Modal (Método Original)**
1. Abra o modal do FortiGate
2. Clique no botão "Sincronizar" (verde)
3. Verificar se aparece toast de sucesso/erro

## 🔧 POSSÍVEIS PROBLEMAS E SOLUÇÕES

### **Problema 1: Tabelas não existem**
**Solução**: Execute no phpMyAdmin:
```sql
-- Copiar conteúdo de db_init/create_fortigate_api_tables.sql
```

### **Problema 2: Erro de conexão com FortiGate**
**Possíveis causas:**
- IP incorreto (`189.115.43.1`)
- Token inválido
- Firewall bloqueando
- FortiGate não permite API REST

**Teste manual**:
```bash
curl -k "https://189.115.43.1:443/api/v2/monitor/system/status?access_token=SEU_TOKEN"
```

### **Problema 3: Erro de SSL**
**Solução**: Configurar `verify_ssl = false` na configuração

### **Problema 4: Timeout**
**Solução**: Aumentar timeout na classe `FortigateAPI`

## 📊 DADOS ESPERADOS DA SINCRONIZAÇÃO

Se a API funcionar, deve retornar:
```json
{
  "success": true,
  "message": "Sincronização concluída com sucesso",
  "changes": {...},
  "duration": 2.5
}
```

**Dados sincronizados:**
- Hostname do FortiGate
- Versão do FortiOS
- Status das licenças (FortiCare, Antivirus, IPS, Web Filtering)
- Uso de CPU/Memória
- Contagem de sessões
- Alertas de licenças expirando

## 🚨 TROUBLESHOOTING

### **Se der erro 500:**
- Verificar logs do PHP
- Verificar se classes existem
- Verificar permissões de arquivo

### **Se der erro 401:**
- Token inválido
- Verificar se API está habilitada no FortiGate

### **Se der erro de conexão:**
- Verificar conectividade de rede
- Verificar firewall
- Testar ping para o IP

### **Se der timeout:**
- FortiGate pode estar lento
- Aumentar timeout na configuração

## 🎯 PRÓXIMOS PASSOS

1. **Execute o script de teste**: `testar_sincronizacao_fortigate.php`
2. **Verifique se tabelas existem** (se não, crie automaticamente)
3. **Teste a sincronização** via script ou modal
4. **Analise os logs** para identificar problemas
5. **Ajuste configurações** conforme necessário

## 📝 CONFIGURAÇÃO DO FORTIGATE

Para que a API funcione, o FortiGate deve ter:

```bash
# Habilitar API REST
config system api-user
    edit "api-user"
        set api-key "SEU_TOKEN_AQUI"
        set accprofile "super_admin"
        set vdom "root"
    next
end

# Permitir acesso HTTPS
config system interface
    edit "wan1"
        set allowaccess https
    next
end
```

---
**Status**: ⏳ Aguardando teste
**Próximo**: Executar verificações
**Data**: 2025-12-19