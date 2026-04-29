# Adição de Campo de Busca e Botão Remover

## 🎯 Objetivo

Adicionar um campo de busca e um botão de remover clientes/licenças selecionados nas páginas de:
- Bitdefender
- Fortigate
- Office 365
- Gmail

## ✅ Implementação

### Localização
Arquivo modificado: `src/pages/Dashboard.tsx`

### O Que Foi Adicionado

#### 1. Barra de Ações
Uma nova barra foi adicionada acima das tabelas com:
- **Campo de Busca**: À esquerda, ocupa a maior parte do espaço
- **Botão Remover**: À direita, aparece apenas quando há itens selecionados

#### 2. Campo de Busca
```tsx
<input
  type="text"
  placeholder="Buscar licenças/dispositivos/clientes..."
  value={companyFilter}
  onChange={(e) => setCompanyFilter(e.target.value)}
  className="w-full px-4 py-2 border rounded-md..."
/>
```

**Características**:
- Placeholder dinâmico baseado na aba ativa
- Usa o filtro `companyFilter` existente
- Busca em tempo real (sem necessidade de clicar em botão)
- Responsivo e com suporte a dark mode

**Placeholders por aba**:
- Bitdefender: "Buscar licenças..."
- Fortigate: "Buscar dispositivos..."
- Office 365: "Buscar clientes..."
- Gmail: "Buscar clientes..."

#### 3. Botão Remover
```tsx
{selectedItems.size > 0 && canDelete && (
  <button onClick={() => setIsDeleteModalOpen(true)}>
    Remover ({selectedItems.size})
  </button>
)}
```

**Características**:
- Aparece apenas quando há itens selecionados
- Mostra a quantidade de itens selecionados
- Verifica permissão de exclusão (`canDelete`)
- Cor vermelha para indicar ação destrutiva
- Ícone de lixeira
- Abre o modal de confirmação existente

## 📊 Layout Visual

```
┌─────────────────────────────────────────────────────────────┐
│  [Bitdefender] [Fortigate] [Office 365] [Gmail] [Rede] [...] │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [🔍 Buscar licenças...]              [🗑️ Remover (3)]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ☑ EMPRESA    RESPONSÁVEL    EMAIL    SERIAL    LICENÇAS    │
│  ☑ ACIL       MARCELO        ...      ...       0           │
│  ☑ AGROPLAY   VALDIR         ...      ...       60          │
│  ☐ DIALLI     ADRIANO        ...      ...       105         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Estilos

### Campo de Busca
- **Largura**: Flex-1 com max-width de 28rem (md)
- **Padding**: 4 (px-4 py-2)
- **Border**: Cinza claro no light mode, cinza escuro no dark mode
- **Focus**: Anel azul (ring-blue-500)
- **Background**: Branco no light mode, cinza escuro no dark mode

### Botão Remover
- **Cor**: Vermelho (bg-red-600)
- **Hover**: Vermelho mais escuro (bg-red-700)
- **Padding**: 4 (px-4 py-2)
- **Gap**: 2 entre ícone e texto
- **Ícone**: SVG de lixeira (24x24)
- **Contador**: Mostra quantidade entre parênteses

### Container
- **Background**: Branco no light mode, cinza escuro no dark mode
- **Padding**: 4 (p-4)
- **Margin Bottom**: 4 (mb-4)
- **Border Radius**: Arredondado (rounded-lg)
- **Shadow**: Sombra média (shadow-md)
- **Layout**: Flexbox com justify-between

## 🔍 Funcionalidades

### Busca
1. **Tempo Real**: Filtra conforme o usuário digita
2. **Case-Insensitive**: Não diferencia maiúsculas/minúsculas
3. **Múltiplos Campos**: Busca em empresa, responsável, email, etc.
4. **Limpar**: Basta apagar o texto do campo

### Remover
1. **Seleção**: Usuário marca checkboxes nas linhas
2. **Contador**: Botão mostra quantos itens estão selecionados
3. **Confirmação**: Abre modal de confirmação antes de excluir
4. **Permissão**: Só aparece se o usuário tiver permissão de exclusão
5. **Feedback**: Toast de sucesso/erro após a operação

## 🔐 Permissões

### Campo de Busca
- **Visível para**: Todos os usuários
- **Funciona em**: Todas as abas (Bitdefender, Fortigate, O365, Gmail)

### Botão Remover
- **Visível para**: Apenas usuários com permissão `canDelete`
- **Condição**: `selectedItems.size > 0 && canDelete`
- **Usuários Admin**: Sempre têm permissão
- **Usuários Normais**: Depende das permissões configuradas

## 📱 Responsividade

### Desktop (> 768px)
```
[🔍 Buscar licenças......................]  [🗑️ Remover (3)]
```

### Mobile (< 768px)
```
[🔍 Buscar licenças......................]

[🗑️ Remover (3)]
```

O layout usa `flex-wrap` para empilhar em telas pequenas.

## 🎯 Abas Afetadas

| Aba | Campo de Busca | Botão Remover | Busca Por |
|-----|----------------|---------------|-----------|
| **Bitdefender** | ✅ Sim | ✅ Sim | Empresa, Responsável, Email |
| **Fortigate** | ✅ Sim | ✅ Sim | Cliente, Serial, Modelo |
| **Office 365** | ✅ Sim | ✅ Sim | Nome do Cliente, Email |
| **Gmail** | ✅ Sim | ✅ Sim | Nome do Cliente, Email |
| **Mapa de Rede** | ❌ Não | ❌ Não | N/A |
| **Inventário** | ❌ Não | ❌ Não | Tem própria implementação |

## 🔄 Integração com Código Existente

### Usa Funcionalidades Existentes
1. **Filtro**: Reutiliza `companyFilter` e `setCompanyFilter`
2. **Seleção**: Usa `selectedItems` existente
3. **Modal**: Abre `DeleteConfirmModal` existente
4. **Permissões**: Verifica `canDelete` existente

### Não Quebra Nada
- Não remove funcionalidades existentes
- Não altera comportamento de filtros
- Não modifica lógica de exclusão
- Compatível com dark mode

## 🧪 Como Testar

### Teste 1: Campo de Busca
1. Acesse a aba Bitdefender
2. Digite "AGRO" no campo de busca
3. Verifique que apenas AGROPLAY aparece
4. Limpe o campo
5. Verifique que todos os itens voltam

### Teste 2: Botão Remover
1. Acesse a aba Bitdefender
2. Marque 2 checkboxes
3. Verifique que o botão "Remover (2)" aparece
4. Clique no botão
5. Verifique que o modal de confirmação abre
6. Confirme a exclusão
7. Verifique que os itens foram removidos

### Teste 3: Permissões
1. Faça login como usuário sem permissão de exclusão
2. Marque checkboxes
3. Verifique que o botão Remover NÃO aparece

### Teste 4: Dark Mode
1. Ative o dark mode
2. Verifique que o campo de busca tem fundo escuro
3. Verifique que o texto é branco
4. Verifique que o botão mantém a cor vermelha

### Teste 5: Responsividade
1. Redimensione a janela para mobile
2. Verifique que o campo de busca ocupa toda a largura
3. Verifique que o botão remover fica abaixo

## 📝 Notas Técnicas

### Por Que Não Criar Componente Separado?
- A barra é simples e específica para o Dashboard
- Reutiliza estados e funções do Dashboard
- Evita prop drilling desnecessário
- Mantém a lógica centralizada

### Por Que Usar `companyFilter`?
- Já existe e funciona
- Já está conectado aos filtros
- Evita duplicação de estado
- Mantém consistência

### Por Que Não Adicionar ao Header?
- Header já está cheio de botões
- Barra de ações fica mais próxima da tabela
- Melhor UX: busca perto dos resultados
- Mais fácil de entender visualmente

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras
1. **Busca Avançada**: Filtros por múltiplos campos
2. **Ordenação**: Colunas clicáveis para ordenar
3. **Paginação**: Para grandes volumes de dados
4. **Exportar Selecionados**: Botão para exportar apenas selecionados
5. **Ações em Massa**: Editar múltiplos itens de uma vez

### Não Implementado (Por Enquanto)
- Busca por data de vencimento
- Busca por status
- Busca por range de licenças
- Autocomplete de empresas
- Histórico de buscas

## ✅ Checklist de Conclusão

- [x] Campo de busca adicionado
- [x] Botão remover adicionado
- [x] Funciona em Bitdefender
- [x] Funciona em Fortigate
- [x] Funciona em Office 365
- [x] Funciona em Gmail
- [x] Verifica permissões
- [x] Suporta dark mode
- [x] Responsivo
- [x] Usa código existente
- [x] Não quebra funcionalidades

## 🎉 Resultado Final

Agora todas as páginas de gerenciamento têm:
- ✅ Campo de busca visível e funcional
- ✅ Botão de remover que aparece quando necessário
- ✅ Interface consistente e intuitiva
- ✅ Melhor experiência do usuário
