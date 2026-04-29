# Deploy da Correção do Filtro do Dashboard

## 📋 Resumo da Correção

Foram corrigidos 4 problemas no filtro do dashboard:

1. ✅ **Bitdefender**: Agora soma `total_licenses` em vez de contar registros
2. ✅ **O365 e Gmail**: Filtro por cliente aplicado corretamente
3. ✅ **Dropdown**: Inclui clientes de todas as fontes
4. ✅ **Normalização**: Comparação case-insensitive

## 🚀 Passos para Deploy

### 1. Verificar Alterações
```bash
git status
```

Arquivo modificado:
- `src/pages/DashboardHome.tsx`

### 2. Testar Localmente (Opcional)
```bash
# Instalar dependências (se necessário)
npm install

# Executar em modo desenvolvimento
npm run dev

# Ou fazer build e testar
npm run build
npm run preview
```

### 3. Commit das Alterações
```bash
git add src/pages/DashboardHome.tsx
git commit -m "fix: corrige filtro do dashboard para somar licenças Bitdefender e filtrar O365/Gmail corretamente"
```

### 4. Push para o Repositório
```bash
git push origin main
```

### 5. Deploy no Easypanel

Se o deploy é automático via Git:
- O Easypanel detectará o push e fará o deploy automaticamente
- Aguarde a conclusão do build

Se o deploy é manual:
1. Acesse o painel do Easypanel
2. Vá no projeto do dashboard
3. Clique em "Deploy" ou "Rebuild"
4. Aguarde a conclusão

### 6. Verificar Deploy

Após o deploy, acesse:
```
https://dashlicencas.macip.com.br
```

1. **Limpe o cache do navegador**: `Ctrl + Shift + R`
2. Faça login
3. Selecione o filtro **AGROPLAY**
4. Verifique os valores:
   - Bitdefender: **60** (não mais 1)
   - Office 365: **24** (não mais 564)
   - Gmail: **68** (não mais 91)
   - Fortigate: **1** (correto)

## 🧪 Testes Recomendados

### Teste 1: AGROPLAY
- Bitdefender: 60
- Fortigate: 1
- Office 365: 24
- Gmail: 68

### Teste 2: Eagleflex - Interseals
- Gmail: 23

### Teste 3: Todos os Clientes
- Verifique se o total geral está correto
- Soma de todas as licenças de todos os clientes

### Teste 4: Outros Clientes
- Selecione diferentes clientes no dropdown
- Confirme que os valores mudam corretamente

## ⚠️ Problemas Comuns

### Cache do Navegador
**Sintoma**: Ainda mostra valores antigos após deploy

**Solução**:
```
1. Ctrl + Shift + R (hard refresh)
2. Ou Ctrl + Shift + Delete (limpar cache completo)
3. Ou usar modo anônimo
```

### Build Falhou
**Sintoma**: Erro durante o build no Easypanel

**Solução**:
```bash
# Verificar erros localmente
npm run build

# Ver logs de erro
npm run build 2>&1 | tee build.log
```

### Valores Ainda Incorretos
**Sintoma**: Após limpar cache, valores ainda estão errados

**Verificar**:
1. Deploy foi concluído com sucesso?
2. Versão correta do código está no servidor?
3. Banco de dados tem os dados corretos?

```sql
-- Verificar dados do Bitdefender para AGROPLAY
SELECT company, total_licenses 
FROM bitdefender_licenses 
WHERE UPPER(TRIM(company)) = 'AGROPLAY';
```

## 📊 Monitoramento Pós-Deploy

### Verificar Logs do Servidor
```bash
# Se tiver acesso SSH
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Verificar Console do Navegador
1. Abra DevTools (F12)
2. Vá na aba Console
3. Verifique se há erros JavaScript
4. Verifique se as requisições API estão retornando dados corretos

### Verificar Network
1. Abra DevTools (F12)
2. Vá na aba Network
3. Filtre por "XHR" ou "Fetch"
4. Verifique as respostas das APIs:
   - `/app_bitdefender.php`
   - `/app_o365.php?type=clients`
   - `/app_o365.php?type=licenses`
   - `/app_gmail.php?type=clients`
   - `/app_gmail.php?type=licenses`

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode reverter:

```bash
# Ver último commit
git log -1

# Reverter para commit anterior
git revert HEAD

# Ou resetar para commit específico
git reset --hard <commit-hash>

# Push forçado (cuidado!)
git push origin main --force
```

## 📝 Checklist Final

- [ ] Código testado localmente
- [ ] Commit feito com mensagem descritiva
- [ ] Push para repositório
- [ ] Deploy concluído com sucesso
- [ ] Cache do navegador limpo
- [ ] Teste com AGROPLAY: valores corretos
- [ ] Teste com outros clientes: valores corretos
- [ ] Teste "Todos os Clientes": total geral correto
- [ ] Sem erros no console do navegador
- [ ] Sem erros nos logs do servidor

## 🎉 Conclusão

Após seguir todos os passos, o filtro do dashboard estará funcionando corretamente:
- Bitdefender mostrará a soma de licenças
- O365 e Gmail serão filtrados por cliente
- Dropdown incluirá todos os clientes
- Comparação será case-insensitive

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do servidor
2. Verifique o console do navegador
3. Confirme que o cache foi limpo
4. Verifique se o deploy foi concluído
5. Execute as queries SQL de verificação
