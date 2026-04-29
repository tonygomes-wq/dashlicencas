# Como Testar: Campo de Busca e Botão Remover

## 🚀 Preparação

### 1. Limpar Cache do Navegador
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Fazer Login
- Acesse o dashboard
- Faça login com suas credenciais

## ✅ Testes Funcionais

### Teste 1: Campo de Busca - Bitdefender

**Objetivo**: Verificar se a busca filtra corretamente

**Passos**:
1. Clique na aba **Bitdefender**
2. Observe a barra acima da tabela
3. Digite "AGRO" no campo de busca
4. Verifique que apenas AGROPLAY aparece
5. Digite "DIALLI"
6. Verifique que apenas DIALLI aparece
7. Limpe o campo
8. Verifique que todos os itens voltam

**Resultado Esperado**:
- ✅ Campo de busca visível
- ✅ Placeholder: "Buscar licenças..."
- ✅ Filtra em tempo real
- ✅ Case-insensitive (AGRO = agro)

---

### Teste 2: Campo de Busca - Fortigate

**Objetivo**: Verificar busca em Fortigate

**Passos**:
1. Clique na aba **Fortigate**
2. Digite "PEGORARO" no campo de busca
3. Verifique que apenas dispositivos da PEGORARO aparecem
4. Limpe o campo

**Resultado Esperado**:
- ✅ Placeholder: "Buscar dispositivos..."
- ✅ Filtra corretamente

---

### Teste 3: Campo de Busca - Office 365

**Objetivo**: Verificar busca em O365

**Passos**:
1. Clique na aba **Office 365**
2. Digite "Agroplay" no campo de busca
3. Verifique que apenas o cliente Agroplay aparece
4. Limpe o campo

**Resultado Esperado**:
- ✅ Placeholder: "Buscar clientes..."
- ✅ Filtra corretamente

---

### Teste 4: Campo de Busca - Gmail

**Objetivo**: Verificar busca em Gmail

**Passos**:
1. Clique na aba **Gmail**
2. Digite "Eagleflex" no campo de busca
3. Verifique que apenas Eagleflex aparece
4. Limpe o campo

**Resultado Esperado**:
- ✅ Placeholder: "Buscar clientes..."
- ✅ Filtra corretamente

---

### Teste 5: Botão Remover - Aparece/Desaparece

**Objetivo**: Verificar que o botão aparece apenas quando há seleção

**Passos**:
1. Vá para aba **Bitdefender**
2. Verifique que o botão Remover **NÃO** está visível
3. Marque 1 checkbox
4. Verifique que o botão **Remover (1)** aparece
5. Marque mais 2 checkboxes
6. Verifique que o botão muda para **Remover (3)**
7. Desmarque todos os checkboxes
8. Verifique que o botão desaparece

**Resultado Esperado**:
- ✅ Botão só aparece com seleção
- ✅ Contador atualiza dinamicamente
- ✅ Botão desaparece ao desmarcar tudo

---

### Teste 6: Botão Remover - Funcionalidade

**Objetivo**: Verificar que a remoção funciona

**Passos**:
1. Vá para aba **Bitdefender**
2. Marque 1 checkbox (escolha um item de teste)
3. Clique no botão **Remover (1)**
4. Verifique que o modal de confirmação abre
5. Clique em **Cancelar**
6. Verifique que nada foi removido
7. Clique novamente em **Remover (1)**
8. Clique em **Confirmar**
9. Verifique que o item foi removido
10. Verifique que aparece toast de sucesso

**Resultado Esperado**:
- ✅ Modal de confirmação abre
- ✅ Cancelar não remove
- ✅ Confirmar remove
- ✅ Toast de sucesso aparece

---

### Teste 7: Permissões - Usuário Admin

**Objetivo**: Verificar que admin vê o botão

**Passos**:
1. Faça login como **admin**
2. Vá para aba **Bitdefender**
3. Marque 1 checkbox
4. Verifique que o botão **Remover** aparece

**Resultado Esperado**:
- ✅ Admin vê o botão Remover

---

### Teste 8: Permissões - Usuário Sem Permissão

**Objetivo**: Verificar que usuário sem permissão NÃO vê o botão

**Passos**:
1. Faça login como **usuário sem permissão de exclusão**
2. Vá para aba **Bitdefender**
3. Marque 1 checkbox
4. Verifique que o botão **Remover NÃO** aparece

**Resultado Esperado**:
- ✅ Usuário sem permissão NÃO vê o botão

---

### Teste 9: Dark Mode

**Objetivo**: Verificar que funciona em dark mode

**Passos**:
1. Ative o **dark mode** (botão no header)
2. Vá para aba **Bitdefender**
3. Verifique o campo de busca:
   - Fundo escuro
   - Texto branco
   - Border cinza escuro
4. Marque 1 checkbox
5. Verifique o botão Remover:
   - Cor vermelha mantida
   - Texto branco

**Resultado Esperado**:
- ✅ Campo de busca com tema escuro
- ✅ Botão Remover mantém cor vermelha
- ✅ Tudo legível

---

### Teste 10: Responsividade - Mobile

**Objetivo**: Verificar layout em telas pequenas

**Passos**:
1. Redimensione a janela para **< 768px** (mobile)
2. Vá para aba **Bitdefender**
3. Verifique que:
   - Campo de busca ocupa toda a largura
   - Botão Remover fica abaixo (se houver seleção)
4. Marque 1 checkbox
5. Verifique que o botão aparece abaixo do campo

**Resultado Esperado**:
- ✅ Layout empilhado em mobile
- ✅ Campo de busca full-width
- ✅ Botão abaixo do campo

---

### Teste 11: Busca + Seleção

**Objetivo**: Verificar interação entre busca e seleção

**Passos**:
1. Vá para aba **Bitdefender**
2. Digite "AGRO" no campo de busca
3. Marque o checkbox da AGROPLAY
4. Verifique que o botão **Remover (1)** aparece
5. Limpe o campo de busca
6. Verifique que:
   - Todos os itens voltam
   - AGROPLAY continua marcada
   - Botão continua visível

**Resultado Esperado**:
- ✅ Busca não desmarca seleção
- ✅ Seleção persiste ao limpar busca
- ✅ Botão continua visível

---

### Teste 12: Múltiplas Abas

**Objetivo**: Verificar que funciona em todas as abas

**Passos**:
1. Teste em **Bitdefender**: ✅
2. Teste em **Fortigate**: ✅
3. Teste em **Office 365**: ✅
4. Teste em **Gmail**: ✅
5. Verifique **Mapa de Rede**: Não tem barra (correto)
6. Verifique **Inventário**: Não tem barra (tem própria)

**Resultado Esperado**:
- ✅ Funciona em Bitdefender
- ✅ Funciona em Fortigate
- ✅ Funciona em Office 365
- ✅ Funciona em Gmail
- ✅ Não aparece em Mapa de Rede
- ✅ Não aparece em Inventário

---

## 🐛 Testes de Bugs Comuns

### Bug 1: Busca Não Filtra

**Sintoma**: Digitar no campo não filtra os resultados

**Verificar**:
1. Cache do navegador foi limpo?
2. Código foi atualizado no servidor?
3. Console do navegador tem erros?

**Solução**:
- Limpar cache: `Ctrl + Shift + R`
- Verificar console (F12)

---

### Bug 2: Botão Não Aparece

**Sintoma**: Marcar checkbox não mostra o botão

**Verificar**:
1. Usuário tem permissão de exclusão?
2. Checkbox está realmente marcado?
3. Console tem erros?

**Solução**:
- Verificar permissões do usuário
- Fazer login como admin para testar

---

### Bug 3: Botão Não Remove

**Sintoma**: Clicar em Remover não faz nada

**Verificar**:
1. Modal de confirmação abre?
2. Console tem erros?
3. Backend está respondendo?

**Solução**:
- Verificar console (F12)
- Verificar Network tab
- Verificar logs do backend

---

## 📊 Checklist de Testes

### Funcionalidade
- [ ] Campo de busca visível em Bitdefender
- [ ] Campo de busca visível em Fortigate
- [ ] Campo de busca visível em Office 365
- [ ] Campo de busca visível em Gmail
- [ ] Busca filtra em tempo real
- [ ] Busca é case-insensitive
- [ ] Limpar busca restaura todos os itens

### Botão Remover
- [ ] Botão aparece ao selecionar itens
- [ ] Botão mostra contador correto
- [ ] Botão desaparece ao desmarcar tudo
- [ ] Botão abre modal de confirmação
- [ ] Cancelar não remove itens
- [ ] Confirmar remove itens
- [ ] Toast de sucesso aparece

### Permissões
- [ ] Admin vê o botão
- [ ] Usuário sem permissão NÃO vê o botão
- [ ] Usuário com permissão vê o botão

### Visual
- [ ] Dark mode funciona
- [ ] Layout responsivo em mobile
- [ ] Cores corretas
- [ ] Ícones aparecem
- [ ] Animações suaves

### Integração
- [ ] Não quebra funcionalidades existentes
- [ ] Filtros do header continuam funcionando
- [ ] Seleção persiste ao mudar busca
- [ ] Funciona em todas as abas corretas

---

## 🎯 Critérios de Aceitação

Para considerar o teste **APROVADO**, todos os itens devem estar ✅:

1. ✅ Campo de busca visível e funcional
2. ✅ Botão remover aparece quando necessário
3. ✅ Contador de seleção correto
4. ✅ Remoção funciona com confirmação
5. ✅ Permissões respeitadas
6. ✅ Dark mode funciona
7. ✅ Responsivo em mobile
8. ✅ Funciona em todas as 4 abas
9. ✅ Não quebra funcionalidades existentes
10. ✅ Sem erros no console

---

## 📞 Reportar Problemas

Se encontrar algum problema:

1. **Abra o Console** (F12)
2. **Copie os erros** (se houver)
3. **Tire um screenshot** da tela
4. **Descreva o problema**:
   - O que você fez?
   - O que esperava?
   - O que aconteceu?
5. **Informe o navegador** e versão

---

## ✅ Conclusão

Após completar todos os testes, você deve ter:
- ✅ Campo de busca funcionando
- ✅ Botão remover funcionando
- ✅ Permissões corretas
- ✅ Visual correto
- ✅ Sem bugs

**Status**: 🎉 Pronto para uso!
