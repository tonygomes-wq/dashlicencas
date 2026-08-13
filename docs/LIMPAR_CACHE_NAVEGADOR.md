# Como Limpar o Cache do Navegador

## Problema
O dashboard ainda mostra dados incorretos após a correção do código porque o navegador está usando a versão antiga do JavaScript em cache.

## Solução Rápida

### Chrome / Edge / Brave
1. Abra a página do dashboard
2. Pressione **Ctrl + Shift + R** (Windows/Linux) ou **Cmd + Shift + R** (Mac)
3. Ou pressione **F12** para abrir DevTools, depois clique com botão direito no ícone de recarregar e selecione **"Esvaziar cache e recarregar forçadamente"**

### Firefox
1. Abra a página do dashboard
2. Pressione **Ctrl + Shift + R** (Windows/Linux) ou **Cmd + Shift + R** (Mac)
3. Ou pressione **Ctrl + F5**

### Safari
1. Abra a página do dashboard
2. Pressione **Cmd + Option + R**
3. Ou vá em **Develop > Empty Caches** (precisa ativar o menu Develop nas preferências)

## Solução Completa (se a rápida não funcionar)

### Chrome / Edge / Brave
1. Pressione **Ctrl + Shift + Delete**
2. Selecione **"Imagens e arquivos em cache"**
3. Período: **"Última hora"** ou **"Todo o período"**
4. Clique em **"Limpar dados"**
5. Recarregue a página

### Firefox
1. Pressione **Ctrl + Shift + Delete**
2. Marque **"Cache"**
3. Período: **"Última hora"** ou **"Tudo"**
4. Clique em **"Limpar agora"**
5. Recarregue a página

## Verificação
Após limpar o cache, ao filtrar por **AGROPLAY**, os cards devem mostrar:
- ✅ **Bitdefender**: 60 licenças (não mais 1)
- ✅ **Fortigate**: 1 dispositivo
- ✅ **Office 365**: 24 licenças
- ✅ **Gmail**: 68 licenças

## O que foi corrigido no código

1. **Busca de clientes O365/Gmail**: Agora busca os nomes dos clientes, não só os IDs
2. **Filtro aplicado**: O365 e Gmail agora são filtrados corretamente por nome do cliente
3. **Normalização**: Comparação case-insensitive (AGROPLAY = Agroplay = agroplay)
4. **Dropdown completo**: Todos os clientes de todas as fontes aparecem no filtro

## Nota para Desenvolvedores
Se estiver desenvolvendo localmente, considere:
- Desabilitar cache no DevTools (F12 > Network > "Disable cache")
- Usar modo anônimo/privado para testes
- Adicionar versioning aos arquivos JS/CSS no build
