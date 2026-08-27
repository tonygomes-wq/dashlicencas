# 🚀 DEPLOY URGENTE - Correção de Erro Console

**Data:** 27/08/2026  
**Commit:** 310ca22  
**Prioridade:** ALTA

---

## 🐛 PROBLEMA CORRIGIDO

**Erro no console:**
```
Uncaught TypeError: r: se.info is not a function
```

**Causa:** `toast.info()` não é compatível após minificação do build.

**Solução:** Trocar para `toast()` com opções de ícone.

---

## 📁 ARQUIVOS PARA FAZER UPLOAD

### 1. Arquivo TypeScript (Fonte):
```
src/components/DetailSidebar.tsx
```

### 2. Arquivos do Build (dist/):
```
dist/index.html
dist/assets/index-36ae7f11.js  ← NOVO (atualizado)
dist/assets/index-74fa550e.css ← NOVO (atualizado)
dist/assets/logo-e02fd245.png
```

**⚠️ IMPORTANTE:** 
- APAGAR arquivo antigo: `dist/assets/index-*.js` (versão antiga)
- Fazer upload dos NOVOS arquivos acima

---

## 🔧 PASSO A PASSO DO DEPLOY

### Opção 1: FTP/FileZilla

1. **Conectar ao servidor**
2. **Navegar até `/var/www/html/`**
3. **APAGAR:**
   - `/var/www/html/assets/index-*.js` (arquivo antigo, ex: index-7884cf66.js)
   - `/var/www/html/assets/index-*.css` (arquivo antigo)
4. **FAZER UPLOAD:**
   ```
   C:\Users\suporte04\Documents\GitHub\dashlicencas\dist\index.html
   C:\Users\suporte04\Documents\GitHub\dashlicencas\dist\assets\index-36ae7f11.js
   C:\Users\suporte04\Documents\GitHub\dashlicencas\dist\assets\index-74fa550e.css
   C:\Users\suporte04\Documents\GitHub\dashlicencas\dist\assets\logo-e02fd245.png
   ```
5. **Verificar permissões:** 644 para arquivos, 755 para diretórios

---

### Opção 2: EasyPanel

1. **Acessar painel EasyPanel**
2. **Ir em Projects → dashlicencas**
3. **Clicar em "Rebuild"**
4. **Aguardar 2-3 minutos**
5. **Verificar status: "Running"**

---

### Opção 3: Via SCP (Terminal)

```bash
# Navegar até o diretório local
cd C:\Users\suporte04\Documents\GitHub\dashlicencas

# Upload dos arquivos
scp dist/index.html usuario@servidor:/var/www/html/
scp dist/assets/index-36ae7f11.js usuario@servidor:/var/www/html/assets/
scp dist/assets/index-74fa550e.css usuario@servidor:/var/www/html/assets/
scp dist/assets/logo-e02fd245.png usuario@servidor:/var/www/html/assets/

# Ajustar permissões
ssh usuario@servidor "chmod 644 /var/www/html/assets/*"
```

---

## ✅ VERIFICAR APÓS O DEPLOY

### 1. Limpar Cache do Navegador
```
Ctrl + Shift + Delete
ou
Ctrl + F5 (reload forçado)
ou
Abrir em aba anônima
```

### 2. Verificar DevTools (F12)

**Console:**
- ❌ NÃO deve aparecer: `Uncaught TypeError: r: se.info is not a function`
- ✅ DEVE estar limpo sem erros

**Network:**
- Verificar se está carregando: `index-36ae7f11.js` (NOVO)
- ❌ NÃO deve carregar: `index-7884cf66.js` (ANTIGO)

### 3. Testar Funcionalidade

1. **Abrir modal Bitdefender**
2. **Ir em tab "Scans"**
3. **Clicar em "Quick Scan"**
   - ✅ Deve mostrar toast: "Funcionalidade de Quick Scan em desenvolvimento ℹ️"
   - ✅ SEM erros no console
4. **Ir em tab "Isolamento"**
5. **Clicar em "Isolar Endpoints"**
   - ✅ Deve mostrar toast: "Funcionalidade de isolamento em desenvolvimento 🔒"
   - ✅ SEM erros no console

---

## 📋 MUDANÇAS NO CÓDIGO

### Antes (ERRO):
```typescript
onClick={() => toast.info('Mensagem')}
```

### Depois (CORRIGIDO):
```typescript
onClick={() => toast('Mensagem', { icon: 'ℹ️' })}
```

---

## 🎯 ARQUIVOS MODIFICADOS

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `src/components/DetailSidebar.tsx` | toast.info → toast() | ✅ Commitado |
| `dist/index.html` | Build atualizado | ✅ Build OK |
| `dist/assets/index-36ae7f11.js` | Novo bundle JS | ✅ Build OK |
| `dist/assets/index-74fa550e.css` | Novo bundle CSS | ✅ Build OK |

---

## ⏱️ TEMPO ESTIMADO

- **FTP Upload:** 2-3 minutos
- **EasyPanel Rebuild:** 2-3 minutos
- **Verificação:** 1 minuto
- **TOTAL:** ~5 minutos

---

## 🔄 SE O ERRO PERSISTIR

1. **Limpar cache COMPLETO do navegador:**
   - Configurações → Privacidade → Limpar dados
   - Marcar: Cache, Cookies, Armazenamento local
   - Período: Todo o tempo

2. **Verificar arquivo carregado:**
   - F12 → Network → Recarregar
   - Procurar por `index-*.js`
   - Verificar se é `index-36ae7f11.js` (novo)

3. **Verificar servidor:**
   - Confirmar que arquivo foi enviado
   - Verificar data de modificação
   - Verificar tamanho: ~1.33 MB

4. **Forçar reload sem cache:**
   ```
   Ctrl + Shift + R (Chrome/Edge)
   Ctrl + F5 (Firefox)
   Cmd + Shift + R (Mac)
   ```

---

## 📞 SUPORTE

Se o erro persistir após deploy:
1. Verificar logs do navegador (F12 → Console)
2. Verificar se arquivo está no servidor
3. Verificar permissões dos arquivos
4. Testar em outro navegador
5. Testar em aba anônima

---

## ✅ CHECKLIST DE DEPLOY

```
[ ] 1. Build executado (npm run build)
[ ] 2. Arquivos gerados em dist/
[ ] 3. Conectar ao servidor (FTP/SSH/EasyPanel)
[ ] 4. APAGAR arquivos antigos em assets/
[ ] 5. Fazer upload do novo index.html
[ ] 6. Fazer upload dos novos assets/index-*.js e *.css
[ ] 7. Verificar permissões (644)
[ ] 8. Limpar cache do navegador
[ ] 9. Recarregar página (Ctrl+F5)
[ ] 10. Verificar Console (F12) - SEM erros
[ ] 11. Testar botão Quick Scan
[ ] 12. Verificar toast aparece
[ ] 13. ✅ DEPLOY CONCLUÍDO!
```

---

**Última atualização:** 27/08/2026 - 15:45h  
**Commit:** 310ca22  
**Build:** index-36ae7f11.js
