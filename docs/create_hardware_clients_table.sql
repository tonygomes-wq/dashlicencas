-- Criar tabela de clientes de hardware
CREATE TABLE IF NOT EXISTS hardware_clients (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do cliente',
    client_name VARCHAR(255) NOT NULL UNIQUE COMMENT 'Nome do cliente (único)',
    contact_person VARCHAR(255) COMMENT 'Pessoa de contato',
    email VARCHAR(255) COMMENT 'E-mail de contato',
    phone VARCHAR(50) COMMENT 'Telefone de contato',
    address TEXT COMMENT 'Endereço do cliente',
    notes TEXT COMMENT 'Observações adicionais',
    user_id INT NOT NULL COMMENT 'ID do usuário que criou o registro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client_name (client_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
