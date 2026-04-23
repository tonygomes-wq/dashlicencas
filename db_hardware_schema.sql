-- Script SQL para criar as tabelas de Inventário de Hardware
-- Execute este script no banco de dados MySQL

-- Tabela principal de dispositivos de hardware
CREATE TABLE IF NOT EXISTS hardware_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_name VARCHAR(255) NOT NULL,
    device_type ENUM('Desktop', 'Notebook', 'Servidor', 'Workstation', 'Outro') NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    
    -- Processador
    cpu_model VARCHAR(255) NOT NULL,
    cpu_cores INT,
    cpu_frequency VARCHAR(50),
    
    -- Memória RAM
    ram_size INT NOT NULL COMMENT 'Em GB',
    ram_type VARCHAR(50),
    ram_speed VARCHAR(50),
    
    -- Sistema Operacional
    os_name VARCHAR(100),
    os_version VARCHAR(100),
    
    -- Rede
    mac_address VARCHAR(17),
    ip_address VARCHAR(45),
    
    -- Informações Adicionais
    serial_number VARCHAR(255),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    purchase_date DATE,
    warranty_expiration DATE,
    notes TEXT,
    
    -- Controle
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

-- Tabela de dispositivos de armazenamento (relacionamento 1:N com hardware_devices)
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

-- Dados de exemplo (opcional - remova se não quiser dados de teste)
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

-- Inserir dispositivos de armazenamento para os exemplos
INSERT INTO storage_devices (hardware_id, type, capacity, manufacturer, interface) VALUES
(1, 'NVMe', 512, 'Samsung', 'PCIe 4.0'),
(2, 'SSD', 256, 'Kingston', 'SATA'),
(3, 'SSD', 480, 'Samsung', 'SATA'),
(3, 'HDD', 2000, 'Seagate', 'SATA');

-- Verificar as tabelas criadas
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_devices FROM hardware_devices;
SELECT COUNT(*) as total_storage FROM storage_devices;
