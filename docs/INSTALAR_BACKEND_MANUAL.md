# 🚀 Instalação Manual do Backend - Inventário de Hardware

## ✅ Método 1: Via phpMyAdmin (MAIS FÁCIL)

### Passo 1: Acesse o phpMyAdmin
Abra seu navegador e acesse:
```
http://localhost/phpmyadmin
```
ou
```
http://seu-dominio/phpmyadmin
```

### Passo 2: Faça Login
- **Usuário:** faceso56_dashlicencas
- **Senha:** dash@123@macip

### Passo 3: Selecione o Banco de Dados
- Clique em `faceso56_dashlicencas` no menu lateral esquerdo

### Passo 4: Execute o SQL
1. Clique na aba **"SQL"** no topo
2. Abra o arquivo `db_hardware_schema.sql` com um editor de texto
3. Copie TODO o conteúdo do arquivo
4. Cole na área de texto do phpMyAdmin
5. Clique no botão **"Executar"** (ou "Go")

### Passo 5: Verificar Instalação
Você deve ver mensagens de sucesso:
- ✅ Tabela `hardware_devices` criada
- ✅ Tabela `storage_devices` criada
- ✅ 3 registros inseridos em `hardware_devices`
- ✅ 4 registros inseridos em `storage_devices`

---

## ✅ Método 2: Via Linha de Comando

### Encontrar o MySQL

Execute este comando para encontrar o MySQL:

```powershell
Get-ChildItem -Path "C:\Program Files" -Filter mysql.exe -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

Ou procure em locais comuns:
```
C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
C:\xampp\mysql\bin\mysql.exe
C:\wamp64\bin\mysql\mysql8.0.x\bin\mysql.exe
C:\laragon\bin\mysql\mysql-8.x.x-winx64\bin\mysql.exe
```

### Executar o Script

Quando encontrar o MySQL, execute:

```bash
# Substitua [CAMINHO] pelo caminho encontrado
"[CAMINHO]\mysql.exe" -u faceso56_dashlicencas -p"dash@123@macip" faceso56_dashlicencas < db_hardware_schema.sql
```

Exemplo:
```bash
"C:\xampp\mysql\bin\mysql.exe" -u faceso56_dashlicencas -p"dash@123@macip" faceso56_dashlicencas < db_hardware_schema.sql
```

---

## ✅ Método 3: Copiar e Colar SQL Direto

Se preferir, aqui está o SQL completo para copiar e colar:

### 1. Criar Tabela hardware_devices

```sql
CREATE TABLE IF NOT EXISTS hardware_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    device_type ENUM('Desktop', 'Notebook', 'Servidor', 'Workstation', 'Outro') NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    
    cpu_model VARCHAR(255) NOT NULL,
    cpu_cores INT,
    cpu_frequency VARCHAR(50),
    
    ram_size INT NOT NULL COMMENT 'Em GB',
    ram_type VARCHAR(50),
    ram_speed VARCHAR(50),
    
    os_name VARCHAR(100),
    os_version VARCHAR(100),
    
    mac_address VARCHAR(17),
    ip_address VARCHAR(45),
    
    serial_number VARCHAR(255),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    purchase_date DATE,
    warranty_expiration DATE,
    notes TEXT,
    
    status ENUM('Ativo', 'Inativo', 'Manutenção', 'Descartado') DEFAULT 'Ativo',
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_client (client_name),
    INDEX idx_device_type (device_type),
    INDEX idx_status (status),
    INDEX idx_warranty (warranty_expiration),
    INDEX idx_serial (serial_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Criar Tabela storage_devices

```sql
CREATE TABLE IF NOT EXISTS storage_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hardware_id INT NOT NULL,
    type ENUM('SSD', 'HDD', 'NVMe', 'M.2') NOT NULL,
    capacity INT NOT NULL COMMENT 'Em GB',
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    interface VARCHAR(50) COMMENT 'Ex: SATA, PCIe, NVMe',
    
    FOREIGN KEY (hardware_id) REFERENCES hardware_devices(id) ON DELETE CASCADE,
    INDEX idx_hardware (hardware_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Inserir Dados de Exemplo (Opcional)

```sql
INSERT INTO hardware_devices (
    device_name, device_type, client_name, location,
    cpu_model, cpu_cores, cpu_frequency,
    ram_size, ram_type, ram_speed,
    os_name, os_version,
    serial_number, manufacturer, model,
    purchase_date, warranty_expiration,
    status, user_id
) VALUES 
(
    'PC-001', 'Desktop', 'Empresa Exemplo LTDA', 'Sala 101',
    'Intel Core i7-12700K', 12, '3.6 GHz',
    16, 'DDR4', '3200 MHz',
    'Windows 11 Pro', '22H2',
    'SN123456789', 'Dell', 'OptiPlex 7090',
    '2023-01-15', '2026-01-15',
    'Ativo', 1
),
(
    'NB-045', 'Notebook', 'Empresa Exemplo LTDA', 'Departamento TI',
    'Intel Core i5-1135G7', 4, '2.4 GHz',
    8, 'DDR4', '3200 MHz',
    'Windows 11 Pro', '22H2',
    'SN987654321', 'Lenovo', 'ThinkPad E14',
    '2023-06-20', '2026-06-20',
    'Ativo', 1
),
(
    'SRV-MAIN', 'Servidor', 'Interno', 'Data Center',
    'Intel Xeon E5-2680 v4', 28, '2.4 GHz',
    64, 'DDR4 ECC', '2400 MHz',
    'Windows Server 2022', 'Standard',
    'SN555666777', 'HP', 'ProLiant DL380 Gen10',
    '2022-03-10', '2025-03-10',
    'Ativo', 1
);

INSERT INTO storage_devices (hardware_id, type, capacity, manufacturer, interface) VALUES
(1, 'NVMe', 512, 'Samsung', 'PCIe 4.0'),
(2, 'SSD', 256, 'Kingston', 'SATA'),
(3, 'SSD', 480, 'Samsung', 'SATA'),
(3, 'HDD', 2000, 'Seagate', 'SATA');
```

---

## 🔍 Verificar Instalação

Após executar o SQL, verifique se funcionou:

### No phpMyAdmin:
1. Clique em `faceso56_dashlicencas` no menu lateral
2. Você deve ver as novas tabelas:
   - ✅ `hardware_devices`
   - ✅ `storage_devices`

### Via SQL:
Execute estas queries para verificar:

```sql
-- Ver quantos dispositivos foram criados
SELECT COUNT(*) as total_dispositivos FROM hardware_devices;

-- Ver os dispositivos
SELECT device_name, device_type, client_name FROM hardware_devices;

-- Ver armazenamento
SELECT COUNT(*) as total_storage FROM storage_devices;
```

---

## 🎯 Testar a API

Após instalar o banco, teste se a API está funcionando:

### Teste 1: Verificar se o arquivo existe
Acesse no navegador:
```
http://localhost/app_hardware.php
```

Você deve ver um erro de autenticação (isso é normal, significa que a API está funcionando):
```json
{"error":"Não autenticado"}
```

### Teste 2: Verificar estrutura do arquivo
O arquivo `app_hardware.php` já está criado e pronto na raiz do projeto.

---

## ✅ Checklist de Instalação

- [ ] Acessei o phpMyAdmin
- [ ] Selecionei o banco `faceso56_dashlicencas`
- [ ] Executei o SQL da tabela `hardware_devices`
- [ ] Executei o SQL da tabela `storage_devices`
- [ ] Inseri os dados de exemplo (opcional)
- [ ] Verifiquei que as tabelas foram criadas
- [ ] Testei o acesso ao `app_hardware.php`

---

## 🎉 Próximos Passos

Após instalar o backend:

1. ✅ **Backend funcionando** - API pronta para receber requisições
2. ⏳ **Frontend pendente** - Aguardando compilação
3. 📝 **Documentação** - Leia os arquivos MD criados

Quando o frontend for compilado, a aba "Inventário" aparecerá automaticamente no dashboard!

---

## 🆘 Problemas Comuns

### Erro: Tabela já existe
Se você ver "Table already exists", está tudo bem! As tabelas já foram criadas.

### Erro: Access denied
Verifique usuário e senha:
- Usuário: `faceso56_dashlicencas`
- Senha: `dash@123@macip`

### Erro: Foreign key constraint
Execute primeiro a tabela `hardware_devices`, depois `storage_devices`.

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do MySQL
2. Confirme que o banco `faceso56_dashlicencas` existe
3. Teste a conexão com o banco usando outro script PHP

---

**Boa instalação! 🚀**
