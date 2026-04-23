# 🔄 Como Compilar e Atualizar o Frontend

## 📁 Situação Atual

Esta pasta contém os **arquivos compilados** do projeto (produção).
Para atualizar o frontend, você precisa compilar no projeto de desenvolvimento.

---

## 🎯 Opção 1: Compilar do Projeto de Desenvolvimento

### Passo 1: Localizar o Projeto de Desenvolvimento

Procure pela pasta que contém:
- ✅ `package.json`
- ✅ `vite.config.ts` ou `vite.config.js`
- ✅ Pasta `src/` com código fonte não compilado

**Possíveis localizações:**
- Pasta com nome diferente (ex: `dashlicencas-dev`, `dashboard-dev`)
- Repositório Git separado
- Backup ou pasta de desenvolvimento

### Passo 2: Atualizar Arquivos no Projeto de Desenvolvimento

Copie estes arquivos atualizados para o projeto de desenvolvimento:

```
src/components/DetailSidebar.tsx  → [projeto-dev]/src/components/
src/types.ts                      → [projeto-dev]/src/
```

### Passo 3: Compilar

No projeto de desenvolvimento, execute:

```bash
cd [caminho-do-projeto-dev]
npm install  # Se necessário
npm run build
```

### Passo 4: Copiar Arquivos Compilados

Após o build, copie os arquivos gerados:

```bash
# Copiar da pasta dist/ ou build/ do projeto dev
# Para esta pasta de produção

# Arquivos a copiar:
- index.html
- assets/* (todos os arquivos JS e CSS)
```

---

## 🎯 Opção 2: Recriar package.json Aqui (Não Recomendado)

Se você não tem o projeto de desenvolvimento, posso criar um `package.json` 
básico aqui, mas isso pode causar conflitos.

---

## 📝 Arquivos Já Atualizados

Estes arquivos já foram modificados e estão prontos:

### Backend (✅ Pronto para uso)
- `app_bitdefender_sync_client.php` - API de sincronização individual
- Banco de dados com colunas criadas

### Frontend (⏳ Precisa compilar)
- `src/components/DetailSidebar.tsx` - Interface atualizada
- `src/types.ts` - Tipos atualizados

---

## 🔍 Como Encontrar o Projeto de Desenvolvimento

Execute estes comandos para procurar:

### Windows (PowerShell)
```powershell
# Procurar package.json em pastas próximas
Get-ChildItem -Path "C:\Users\suporte04" -Filter "package.json" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName

# Ou procurar por vite.config
Get-ChildItem -Path "C:\Users\suporte04" -Filter "vite.config.*" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

### Ou procure manualmente:
1. Abra o explorador de arquivos
2. Procure por pastas com nomes similares
3. Verifique se contém `package.json`

---

## ✅ Após Compilar e Copiar

1. Acesse o dashboard no navegador
2. Faça Ctrl+F5 para limpar cache
3. Abra detalhes de um cliente Bitdefender
4. Verifique se aparece a seção "API Bitdefender (Opcional)"
5. Teste configurar uma API Key

---

## 🆘 Precisa de Ajuda?

Se não encontrar o projeto de desenvolvimento, me informe e posso:
1. Criar um package.json aqui (com riscos)
2. Ajudar a procurar o projeto original
3. Criar um novo projeto de desenvolvimento

---

**Nota:** O backend já está 100% funcional. Apenas o frontend precisa ser compilado.
