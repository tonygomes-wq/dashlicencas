# 🔧 CORREÇÃO: Conectividade FortiGate API

## 📋 PROBLEMA IDENTIFICADO
- ❌ **Timeout de conexão**: Servidor não acessa `189.115.43.1:443`
- ❌ **Token diferente**: Sistema usa token antigo
- ❌ **Possível firewall**: Bloqueio de conexão externa

## ✅ CONFIGURAÇÃO DO FORTIGATE (CORRETA)
Baseado na imagem da CLI:

```bash
config system api-user
    edit "api_readonly"
        set api-key ENC SH2/Qd1+Q9AioZE7NeJANTs7J8cDT5HRw8XifmStTKAU/2NVG5ng7G6jS3t0=
        set accprofile "api_user"
        set cors-allow-origin "https://dashlicencas.macip.com.br"
        config trusthost
            edit 1
                set ipv4-trusthost 201.46.121.38 255.255.255.255
            next
        end
    next
end
```

## 🔧 CORREÇÕES NECESSÁRIAS

### 1. **Atualizar Token no Sistema**
O token atual no sistema (`pdnjdbhbzq...`) precisa ser substituído pelo token correto do FortiGate.

**Ação**: Abrir modal do FortiGate e atualizar o API Token.

### 2. **Verificar IP do Servidor**
Confirmar se `201.46.121.38` é realmente o IP do servidor dashlicencas.macip.com.br

**Teste**:
```bash
nslookup dashlicencas.macip.com.br
```

### 3. **Verificar Conectividade de Rede**

#### **Opção A: Teste do Servidor para FortiGate**
```bash
# No servidor dashlicencas
ping 189.115.43.1
telnet 189.115.43.1 443
```

#### **Opção B: Teste do FortiGate para Servidor**
```bash
# No FortiGate CLI
execute ping 201.46.121.38
execute telnet 201.46.121.38 443
```

### 4. **Configurações de Firewall**

#### **No FortiGate:**
```bash
# Permitir acesso HTTPS na interface WAN
config system interface
    edit "wan1"
        set allowaccess https ping ssh
    next
end

# Verificar políticas de firewall
show firewall policy
```

#### **No Servidor (se aplicável):**
```bash
# Verificar se pode fazer conexões externas
curl -I https://google.com
```

## 🧪 TESTES RECOMENDADOS

### **Teste 1: Atualizar Token**
1. Abrir modal FortiGate no dashboard
2. Substituir token por: `ENC SH2/Qd1+Q9AioZE7NeJANTs7J8cDT5HRw8XifmStTKAU/2NVG5ng7G6jS3t0=`
3. Salvar e testar sincronização

### **Teste 2: Verificar IP do Servidor**
```bash
# Descobrir IP real do servidor
dig dashlicencas.macip.com.br
nslookup dashlicencas.macip.com.br
```

### **Teste 3: Teste Manual da API**
```bash
# Do servidor para FortiGate (se conectividade OK)
curl -k "https://189.115.43.1:443/api/v2/monitor/system/status?access_token=ENC%20SH2/Qd1%2BQ9AioZE7NeJANTs7J8cDT5HRw8XifmStTKAU/2NVG5ng7G6jS3t0%3D"
```

## 🎯 PRÓXIMOS PASSOS

### **Passo 1: Atualizar Token (IMEDIATO)**
- Abrir dashboard → FortiGate → Modal detalhes
- Atualizar API Token para o valor correto
- Testar sincronização

### **Passo 2: Verificar Conectividade**
- Confirmar IP do servidor
- Testar ping/telnet entre servidor e FortiGate
- Verificar firewalls

### **Passo 3: Ajustar Configurações**
- Atualizar trusthost se IP estiver errado
- Configurar allowaccess no FortiGate
- Testar novamente

## 📊 RESULTADO ESPERADO

Após correções:
- ✅ **Conectividade**: Servidor acessa FortiGate
- ✅ **Autenticação**: Token válido aceito
- ✅ **Sincronização**: Dados do FortiGate sincronizados
- ✅ **Alertas**: Licenças monitoradas automaticamente

---
**Status**: 🔧 Correções identificadas
**Próximo**: Atualizar token e testar conectividade
**Data**: 2025-12-19