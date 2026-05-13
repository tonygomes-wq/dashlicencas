-- Criar tabela de diagramas de rede
CREATE TABLE IF NOT EXISTS network_diagrams (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único do diagrama',
    user_id INT NOT NULL COMMENT 'ID do usuário que criou o diagrama',
    name VARCHAR(255) NOT NULL DEFAULT 'Novo Diagrama' COMMENT 'Nome do diagrama/cliente',
    data LONGTEXT NOT NULL COMMENT 'Dados do diagrama em formato JSON',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
