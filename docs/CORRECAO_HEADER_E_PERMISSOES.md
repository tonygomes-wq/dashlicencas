# Correção: Header e Permissões do Usuário suporte01 ✅

## Data: 29/04/2026

## Status: ✅ HEADER CORRIGIDO | ⚠️ PERMISSÕES PRECISAM SER ATUALIZADAS NO BANCO

---

## 1. Header Atualizado ✅

### Problema:
O header mostrava o logo + texto "Dashboard Macip" + "Tecnologia"

### Solução Aplicada:
Removido o texto, deixando **apenas o logo da MAC-IP**

### Código Alterado:
**Antes:**
```tsx
<div className="flex items-center gap-3">
  <div className="flex items-center justify-center">
    <img src={logo} alt="MAC-IP Tecnologia" className="h-10 w-auto" />
  </div>
  <div>
    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
      Dashboard Macip
    </h1>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      Tecnologia
    </p>
  </div>
</div>
```

**Depois:**
```tsx
<div className="flex items-center">
  <img src={logo} alt="MAC-IP Tecnologia" className="h-10 w-auto" />
</div>
```

✅ **Build compilado com sucesso**

---

## 2. Problema de Permissões do Usuário suporte01 ⚠️

### Sintomas:
- Usuário suporte01 não consegue criar ou salvar novas informações
- Erro no console relacionado a permissões

### Causa Raiz:
O usuário `suporte01@macip.com.br` provavelmente tem `role = 'user'` ao invés de `role = 'admin'`

### Solução:

#### **Opção 1: Via SQL (Recomendado)**

Execute o arquivo `fix_suporte01_permissions.sql` no seu banco de dados MySQL:

```sql
-- Atualizar role para admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'suporte01@macip.com.br';

-- Garantir que está ativo
UPDATE users 
SET is_active = TRUE 
WHERE email = 'suporte01@macip.com.br';

-- Verificar
SELECT id, email, role, is_active 
FROM users 
WHERE email = 'suporte01@macip.com.br';
```

**Como executar:**
1. Abra o phpMyAdmin ou MySQL Workbench
2. Selecione o banco de dados do projeto
3. Execute os comandos SQL acima
4. Verifique se `role = 'admin'` e `is_active = 1`

#### **Opção 2: Via Interface Web**

1. Faça login com um usuário admin (ex: suporte@macip.com.br)
2. Vá em **Configurações** → **Gerenciar Usuários**
3. Encontre o usuário `suporte01@macip.com.br`
4. Clique em **Editar** (ícone de lápis)
5. Altere o **Role** para **Admin**
6. Salve as alterações

#### **Opção 3: Via Script PHP**

Se tiver acesso ao terminal com PHP instalado:
```bash
php fix_suporte01_permissions.php
```

---

## 3. Verificação de Permissões

### Estrutura de Roles no Sistema:

| Role | Permissões |
|------|-----------|
| **admin** | ✅ Criar, ✅ Editar, ✅ Deletar, ✅ Visualizar tudo |
| **user** | ❌ Criar, ❌ Editar, ❌ Deletar, ✅ Visualizar apenas |

### Operações que Requerem Admin:

1. **Bitdefender:**
   - ✅ Criar nova licença
   - ✅ Editar licença
   - ✅ Deletar licença
   - ✅ Sincronizar com API

2. **Fortigate:**
   - ✅ Adicionar dispositivo
   - ✅ Editar dispositivo
   - ✅ Deletar dispositivo
   - ✅ Configurar API

3. **Office 365:**
   - ✅ Adicionar cliente
   - ✅ Editar cliente
   - ✅ Deletar cliente
   - ✅ Gerenciar licenças

4. **Gmail:**
   - ✅ Adicionar cliente
   - ✅ Editar cliente
   - ✅ Deletar cliente
   - ✅ Gerenciar licenças

5. **Configurações:**
   - ✅ Gerenciar usuários
   - ✅ Criar/editar/deletar usuários

---

## 4. Passos para Resolver

### Passo 1: Atualizar Permissões no Banco
Execute o SQL fornecido acima para atualizar o role do usuário suporte01

### Passo 2: Deploy do Header Atualizado
1. Copiar arquivos da pasta `dist/` para o servidor
2. Substituir os arquivos antigos

### Passo 3: Limpar Cache e Testar
1. Fazer **logout** do usuário suporte01
2. Limpar cache do navegador: `Ctrl + Shift + Delete`
3. Fazer **login** novamente
4. Testar criação/edição de registros

---

## 5. Verificação Final

Após aplicar as correções, verifique:

### ✅ Header:
- [ ] Logo aparece corretamente
- [ ] Texto "Dashboard Macip" e "Tecnologia" foram removidos
- [ ] Layout está alinhado

### ✅ Permissões do suporte01:
- [ ] Consegue criar novos registros
- [ ] Consegue editar registros existentes
- [ ] Consegue deletar registros
- [ ] Botões de ação aparecem (Adicionar, Editar, Remover)
- [ ] Não há erros no console

---

## 6. Arquivos Criados/Modificados

### Modificados:
- ✅ `src/components/layout/TopHeader.tsx` - Removido texto do header

### Criados:
- ✅ `fix_suporte01_permissions.sql` - Script SQL para corrigir permissões
- ✅ `fix_suporte01_permissions.php` - Script PHP para corrigir permissões
- ✅ `CORRECAO_HEADER_E_PERMISSOES.md` - Esta documentação

### Build:
- ✅ `dist/` - Build de produção atualizado

---

## 7. Comandos SQL Úteis

### Verificar todos os usuários e seus roles:
```sql
SELECT id, email, role, is_active, created_at 
FROM users 
ORDER BY role DESC, email;
```

### Tornar todos os usuários admin (use com cuidado):
```sql
UPDATE users SET role = 'admin';
```

### Verificar apenas o suporte01:
```sql
SELECT * FROM users WHERE email = 'suporte01@macip.com.br';
```

---

## 8. Troubleshooting

### Se ainda não funcionar após atualizar o role:

1. **Verificar sessão:**
   - Fazer logout completo
   - Fechar todas as abas do navegador
   - Limpar cookies e cache
   - Fazer login novamente

2. **Verificar no banco:**
   ```sql
   SELECT id, email, role, is_active 
   FROM users 
   WHERE email = 'suporte01@macip.com.br';
   ```
   - Deve mostrar: `role = 'admin'` e `is_active = 1`

3. **Verificar console do navegador:**
   - Abrir DevTools (F12)
   - Ir na aba Console
   - Procurar por erros relacionados a permissões
   - Copiar e enviar os erros se persistirem

---

**Status Final:**
- ✅ Header: CORRIGIDO E COMPILADO
- ⚠️ Permissões: AGUARDANDO ATUALIZAÇÃO NO BANCO DE DADOS

**Próximos Passos:**
1. Executar o SQL para atualizar permissões do suporte01
2. Fazer deploy do build atualizado
3. Testar com o usuário suporte01
