# Correção: Erro 500 ao Adicionar Licenças O365/Gmail ✅

## Data: 29/04/2026

## Status: ✅ CORRIGIDO

---

## Problema Identificado

### Sintomas:
- Erro 500 (Internal Server Error) ao tentar adicionar licença do Office 365
- Erro 500 (Internal Server Error) ao tentar adicionar licença do Gmail
- Mensagem no console: `POST https://dashlicencas.macip.com.br/app_o365.php?type=licenses 500`

### Causa Raiz:
Os campos `username`, `email` e `license_type` são **NOT NULL** na tabela do banco de dados, mas o código PHP estava tentando inserir `null` quando esses campos não eram fornecidos.

**Estrutura da tabela:**
```sql
CREATE TABLE `o365_licenses` (
  `id` int(11) NOT NULL,
  `client_id` varchar(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,      -- ❌ NOT NULL
  `email` varchar(255) NOT NULL,         -- ❌ NOT NULL
  `password` varchar(255) DEFAULT NULL,
  `license_type` varchar(255) NOT NULL,  -- ❌ NOT NULL
  `renewal_status` varchar(50) DEFAULT 'Pendente',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Código problemático:**
```php
$stmt->execute([
    $data['client_id'],
    $user_id,
    $data['username'] ?? null,    // ❌ Pode ser null
    $data['email'] ?? null,       // ❌ Pode ser null
    $data['password'] ?? null,
    $data['license_type'] ?? null, // ❌ Pode ser null
    $data['renewal_status'] ?? 'Pendente'
]);
```

---

## Correções Aplicadas

### 1. **Validação de Campos Obrigatórios**

Adicionada validação antes de inserir no banco:

```php
// Validar campos obrigatórios
if (empty($data['username'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Campo "username" é obrigatório']);
    exit;
}
if (empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Campo "email" é obrigatório']);
    exit;
}
if (empty($data['license_type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Campo "license_type" é obrigatório']);
    exit;
}
```

### 2. **Tratamento de Exceções**

Adicionado try-catch para capturar erros do banco:

```php
try {
    $stmt->execute([
        $data['client_id'],
        $user_id,
        $data['username'],
        $data['email'],
        $data['password'] ?? '',  // ✅ String vazia ao invés de null
        $data['license_type'],
        $data['renewal_status'] ?? 'Pendente'
    ]);
    // ... resto do código
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao inserir licença: ' . $e->getMessage()]);
}
```

### 3. **Correções Aplicadas em Múltiplos Locais**

As correções foram aplicadas em:

#### **Office 365 (app_o365.php):**
- ✅ Inserção única de licença
- ✅ Inserção em massa (bulk_create)
- ✅ Criação de cliente com licenças

#### **Gmail (app_gmail.php):**
- ✅ Inserção única de licença
- ✅ Inserção em massa (bulk_create)
- ✅ Criação de cliente com licenças

---

## Mensagens de Erro Melhoradas

Agora, quando um campo obrigatório não for fornecido, o usuário verá mensagens claras:

### Antes:
```
❌ Erro 500 (Internal Server Error)
❌ Sem detalhes do erro
```

### Depois:
```
✅ Erro 400 (Bad Request)
✅ "Campo 'username' é obrigatório"
✅ "Campo 'email' é obrigatório"
✅ "Campo 'license_type' é obrigatório"
```

---

## Campos Obrigatórios

### Office 365 / Gmail - Licenças:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| **username** | ✅ Sim | Nome do usuário |
| **email** | ✅ Sim | Email da licença |
| **license_type** | ✅ Sim | Tipo de licença |
| password | ❌ Não | Senha (pode ser vazia) |
| renewal_status | ❌ Não | Status de renovação (padrão: "Pendente") |

---

## Testes Recomendados

Após fazer deploy, teste os seguintes cenários:

### ✅ Cenário 1: Adicionar licença com todos os campos
1. Acessar Office 365 ou Gmail
2. Clicar em um cliente
3. Clicar em "Adicionar Licença"
4. Preencher todos os campos (username, email, password, license_type)
5. Salvar
6. **Resultado esperado:** Licença criada com sucesso

### ✅ Cenário 2: Adicionar licença sem username
1. Acessar Office 365 ou Gmail
2. Clicar em um cliente
3. Clicar em "Adicionar Licença"
4. Deixar campo "username" vazio
5. Preencher email e license_type
6. Tentar salvar
7. **Resultado esperado:** Erro "Campo 'username' é obrigatório"

### ✅ Cenário 3: Adicionar licença sem email
1. Acessar Office 365 ou Gmail
2. Clicar em um cliente
3. Clicar em "Adicionar Licença"
4. Preencher username e license_type
5. Deixar campo "email" vazio
6. Tentar salvar
7. **Resultado esperado:** Erro "Campo 'email' é obrigatório"

### ✅ Cenário 4: Adicionar licença sem license_type
1. Acessar Office 365 ou Gmail
2. Clicar em um cliente
3. Clicar em "Adicionar Licença"
4. Preencher username e email
5. Deixar campo "license_type" vazio
6. Tentar salvar
7. **Resultado esperado:** Erro "Campo 'license_type' é obrigatório"

### ✅ Cenário 5: Importação em massa (CSV)
1. Acessar Office 365 ou Gmail
2. Clicar em um cliente
3. Clicar em "Importar CSV"
4. Importar arquivo com licenças
5. **Resultado esperado:** 
   - Se todas as linhas tiverem campos obrigatórios: Sucesso
   - Se alguma linha estiver incompleta: Erro específico

---

## Arquivos Modificados

- ✅ `app_o365.php` - Validação e tratamento de erros para Office 365
- ✅ `app_gmail.php` - Validação e tratamento de erros para Gmail

---

## Próximos Passos

1. **Deploy dos arquivos PHP:**
   - Copiar `app_o365.php` para o servidor
   - Copiar `app_gmail.php` para o servidor
   - Substituir os arquivos antigos

2. **Testar:**
   - Fazer login com usuário suporte02
   - Tentar adicionar licença no Office 365
   - Tentar adicionar licença no Gmail
   - Verificar se não há mais erro 500
   - Verificar se mensagens de erro são claras

3. **Verificar logs:**
   - Verificar logs do servidor PHP
   - Verificar console do navegador
   - Confirmar que não há mais erros 500

---

## Troubleshooting

### Se o erro persistir:

1. **Verificar se os arquivos foram atualizados no servidor:**
   ```bash
   # Verificar data de modificação
   ls -la app_o365.php
   ls -la app_gmail.php
   ```

2. **Verificar logs do PHP:**
   ```bash
   tail -f /var/log/php/error.log
   ```

3. **Verificar estrutura da tabela:**
   ```sql
   DESCRIBE o365_licenses;
   DESCRIBE gmail_licenses;
   ```

4. **Testar inserção manual:**
   ```sql
   INSERT INTO o365_licenses 
   (client_id, user_id, username, email, password, license_type, renewal_status) 
   VALUES 
   ('test-id', 1, 'Test User', 'test@test.com', 'pass123', 'Basic', 'Pendente');
   ```

---

**Status Final: CORRIGIDO E PRONTO PARA DEPLOY** 🚀

## Resumo das Melhorias

| Antes | Depois |
|-------|--------|
| ❌ Erro 500 sem detalhes | ✅ Erro 400 com mensagem clara |
| ❌ Campos null causavam erro | ✅ Validação antes de inserir |
| ❌ Sem tratamento de exceções | ✅ Try-catch com mensagens |
| ❌ Difícil debugar | ✅ Fácil identificar o problema |
