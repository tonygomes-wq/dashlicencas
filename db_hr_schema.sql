-- ========================================================================
-- SCHEMA DO MÓDULO DE GESTÃO DE RH
-- Data de Criação: 02/06/2026
-- Versão: 1.0 (MVP)
-- ========================================================================

-- Desabilitar checks temporariamente para facilitar a criação
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================================
-- TABELA: hr_employees (Funcionários)
-- Armazena todas as informações dos funcionários
-- ========================================================================
CREATE TABLE IF NOT EXISTS `hr_employees` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL COMMENT 'Usuário que criou o registro',
    
    -- ===== DADOS PESSOAIS =====
    `full_name` VARCHAR(200) NOT NULL COMMENT 'Nome completo',
    `cpf` VARCHAR(14) UNIQUE NOT NULL COMMENT 'CPF (formato: 111.111.111-11)',
    `rg` VARCHAR(20) DEFAULT NULL COMMENT 'RG',
    `rg_issuer` VARCHAR(50) DEFAULT NULL COMMENT 'Órgão emissor do RG',
    `rg_issue_date` DATE DEFAULT NULL COMMENT 'Data de emissão do RG',
    `birth_date` DATE NOT NULL COMMENT 'Data de nascimento',
    `gender` ENUM('M', 'F', 'Outro', 'Não informar') DEFAULT NULL COMMENT 'Sexo',
    `marital_status` ENUM('Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável') DEFAULT NULL COMMENT 'Estado civil',
    `nationality` VARCHAR(50) DEFAULT 'Brasileira' COMMENT 'Nacionalidade',
    
    -- ===== DADOS DE CONTATO =====
    `personal_email` VARCHAR(150) DEFAULT NULL COMMENT 'Email pessoal',
    `corporate_email` VARCHAR(150) DEFAULT NULL COMMENT 'Email corporativo',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Telefone fixo',
    `mobile_phone` VARCHAR(20) DEFAULT NULL COMMENT 'Celular',
    
    -- ===== ENDEREÇO =====
    `zip_code` VARCHAR(10) DEFAULT NULL COMMENT 'CEP',
    `street` VARCHAR(200) DEFAULT NULL COMMENT 'Rua/Avenida',
    `number` VARCHAR(10) DEFAULT NULL COMMENT 'Número',
    `complement` VARCHAR(100) DEFAULT NULL COMMENT 'Complemento',
    `neighborhood` VARCHAR(100) DEFAULT NULL COMMENT 'Bairro',
    `city` VARCHAR(100) DEFAULT NULL COMMENT 'Cidade',
    `state` VARCHAR(2) DEFAULT NULL COMMENT 'Estado (UF)',
    
    -- ===== DADOS PROFISSIONAIS =====
    `position` VARCHAR(100) NOT NULL COMMENT 'Cargo/Função',
    `department` VARCHAR(100) DEFAULT NULL COMMENT 'Departamento/Setor',
    `hire_date` DATE NOT NULL COMMENT 'Data de admissão',
    `termination_date` DATE DEFAULT NULL COMMENT 'Data de demissão',
    `contract_type` ENUM('CLT', 'PJ', 'Estagiário', 'Temporário', 'Aprendiz') NOT NULL COMMENT 'Tipo de contrato',
    `status` ENUM('Ativo', 'Afastado', 'Férias', 'Demitido') DEFAULT 'Ativo' COMMENT 'Status atual',
    `salary` DECIMAL(10,2) DEFAULT NULL COMMENT 'Salário base',
    `work_hours` VARCHAR(50) DEFAULT NULL COMMENT 'Jornada de trabalho (ex: 40h semanais)',
    
    -- ===== OBSERVAÇÕES E ANEXOS =====
    `notes` TEXT DEFAULT NULL COMMENT 'Observações gerais',
    `photo_url` VARCHAR(255) DEFAULT NULL COMMENT 'URL da foto/avatar',
    
    -- ===== AUDITORIA =====
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    
    -- ===== CHAVES ESTRANGEIRAS E ÍNDICES =====
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_status` (`status`),
    INDEX `idx_department` (`department`),
    INDEX `idx_cpf` (`cpf`),
    INDEX `idx_hire_date` (`hire_date`),
    INDEX `idx_full_name` (`full_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Cadastro de funcionários do módulo RH';

-- ========================================================================
-- TABELA: hr_vacations (Férias)
-- Controla solicitações e histórico de férias
-- ========================================================================
CREATE TABLE IF NOT EXISTS `hr_vacations` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `employee_id` INT NOT NULL COMMENT 'ID do funcionário',
    
    -- ===== PERÍODO AQUISITIVO =====
    `acquisition_start` DATE NOT NULL COMMENT 'Início do período aquisitivo',
    `acquisition_end` DATE NOT NULL COMMENT 'Fim do período aquisitivo',
    
    -- ===== FÉRIAS SOLICITADAS =====
    `vacation_start` DATE NOT NULL COMMENT 'Data de início das férias',
    `vacation_end` DATE NOT NULL COMMENT 'Data de término das férias',
    `days_requested` INT NOT NULL COMMENT 'Quantidade de dias solicitados',
    `cash_bonus_days` INT DEFAULT 0 COMMENT 'Dias de abono pecuniário (máx 10)',
    
    -- ===== STATUS E APROVAÇÃO =====
    `status` ENUM('Solicitada', 'Aprovada', 'Rejeitada', 'Concluída', 'Cancelada') DEFAULT 'Solicitada' COMMENT 'Status da solicitação',
    `requested_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data da solicitação',
    `approved_by` INT DEFAULT NULL COMMENT 'ID do usuário que aprovou/rejeitou',
    `approved_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Data da aprovação/rejeição',
    `rejection_reason` TEXT DEFAULT NULL COMMENT 'Motivo da rejeição',
    
    -- ===== OBSERVAÇÕES =====
    `notes` TEXT DEFAULT NULL COMMENT 'Observações',
    
    -- ===== AUDITORIA =====
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    
    -- ===== CHAVES ESTRANGEIRAS E ÍNDICES =====
    FOREIGN KEY (`employee_id`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_status` (`status`),
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_dates` (`vacation_start`, `vacation_end`),
    INDEX `idx_acquisition` (`acquisition_start`, `acquisition_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Gestão de férias dos funcionários';

-- ========================================================================
-- TABELA: hr_leaves (Afastamentos e Licenças)
-- Registra afastamentos temporários
-- ========================================================================
CREATE TABLE IF NOT EXISTS `hr_leaves` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `employee_id` INT NOT NULL COMMENT 'ID do funcionário',
    
    -- ===== DADOS DO AFASTAMENTO =====
    `leave_type` ENUM(
        'Licença Médica', 
        'Licença Maternidade', 
        'Licença Paternidade', 
        'Licença Sem Vencimento', 
        'Afastamento INSS', 
        'Outro'
    ) NOT NULL COMMENT 'Tipo de afastamento',
    `start_date` DATE NOT NULL COMMENT 'Data de início do afastamento',
    `expected_return_date` DATE DEFAULT NULL COMMENT 'Data prevista de retorno',
    `actual_return_date` DATE DEFAULT NULL COMMENT 'Data real de retorno',
    
    -- ===== DETALHES =====
    `reason` TEXT DEFAULT NULL COMMENT 'Motivo detalhado do afastamento',
    `notes` TEXT DEFAULT NULL COMMENT 'Observações adicionais',
    `document_url` VARCHAR(255) DEFAULT NULL COMMENT 'URL do atestado/documento comprobatório',
    
    -- ===== STATUS =====
    `status` ENUM('Ativo', 'Concluído', 'Cancelado') DEFAULT 'Ativo' COMMENT 'Status do afastamento',
    
    -- ===== AUDITORIA =====
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    
    -- ===== CHAVES ESTRANGEIRAS E ÍNDICES =====
    FOREIGN KEY (`employee_id`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE,
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_leave_type` (`leave_type`),
    INDEX `idx_dates` (`start_date`, `expected_return_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Registro de afastamentos e licenças';

-- ========================================================================
-- TABELA: hr_benefits (Benefícios)
-- Gerencia benefícios concedidos aos funcionários
-- ========================================================================
CREATE TABLE IF NOT EXISTS `hr_benefits` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `employee_id` INT NOT NULL COMMENT 'ID do funcionário',
    
    -- ===== TIPO DE BENEFÍCIO =====
    `benefit_type` VARCHAR(100) NOT NULL COMMENT 'Tipo de benefício (Vale Transporte, Plano Saúde, etc)',
    `description` TEXT DEFAULT NULL COMMENT 'Descrição detalhada do benefício',
    
    -- ===== VALORES =====
    `monthly_value` DECIMAL(10,2) DEFAULT NULL COMMENT 'Valor mensal do benefício',
    
    -- ===== VIGÊNCIA =====
    `start_date` DATE NOT NULL COMMENT 'Data de início do benefício',
    `end_date` DATE DEFAULT NULL COMMENT 'Data de término do benefício (NULL = vigente)',
    `status` ENUM('Ativo', 'Inativo', 'Cancelado') DEFAULT 'Ativo' COMMENT 'Status do benefício',
    
    -- ===== OBSERVAÇÕES =====
    `notes` TEXT DEFAULT NULL COMMENT 'Observações',
    
    -- ===== AUDITORIA =====
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Data da última atualização',
    
    -- ===== CHAVES ESTRANGEIRAS E ÍNDICES =====
    FOREIGN KEY (`employee_id`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE,
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_type` (`benefit_type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Gestão de benefícios dos funcionários';

-- ========================================================================
-- TABELA: hr_documents (Documentos)
-- Armazena documentos anexados aos funcionários
-- ========================================================================
CREATE TABLE IF NOT EXISTS `hr_documents` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `employee_id` INT NOT NULL COMMENT 'ID do funcionário',
    
    -- ===== DADOS DO DOCUMENTO =====
    `document_type` VARCHAR(100) NOT NULL COMMENT 'Tipo do documento (Contrato, RG, CPF, Atestado, etc)',
    `document_name` VARCHAR(255) NOT NULL COMMENT 'Nome do arquivo',
    `file_url` VARCHAR(255) NOT NULL COMMENT 'URL/caminho do arquivo',
    `file_size` INT DEFAULT NULL COMMENT 'Tamanho do arquivo em bytes',
    `mime_type` VARCHAR(100) DEFAULT NULL COMMENT 'Tipo MIME do arquivo',
    
    -- ===== OBSERVAÇÕES =====
    `description` TEXT DEFAULT NULL COMMENT 'Descrição do documento',
    
    -- ===== AUDITORIA =====
    `uploaded_by` INT NOT NULL COMMENT 'ID do usuário que fez o upload',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data do upload',
    
    -- ===== CHAVES ESTRANGEIRAS E ÍNDICES =====
    FOREIGN KEY (`employee_id`) REFERENCES `hr_employees`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_employee` (`employee_id`),
    INDEX `idx_type` (`document_type`),
    INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Armazenamento de documentos dos funcionários';

-- ========================================================================
-- REABILITAR CHECKS
-- ========================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- DADOS DE EXEMPLO (OPCIONAL - Apenas para testes)
-- Descomente para inserir dados de teste
-- ========================================================================

/*
-- Funcionário de teste
INSERT INTO `hr_employees` (
    `user_id`, `full_name`, `cpf`, `birth_date`, `position`, 
    `department`, `hire_date`, `contract_type`, `status`, 
    `personal_email`, `mobile_phone`, `salary`
) VALUES (
    1, 
    'João Silva', 
    '111.111.111-11', 
    '1990-03-15', 
    'Analista de Sistemas', 
    'TI', 
    '2020-01-15', 
    'CLT', 
    'Ativo', 
    'joao.silva@email.com', 
    '(43) 99999-9999',
    5000.00
);

-- Férias de teste
INSERT INTO `hr_vacations` (
    `employee_id`, `acquisition_start`, `acquisition_end`, 
    `vacation_start`, `vacation_end`, `days_requested`, `status`
) VALUES (
    1, 
    '2023-01-15', 
    '2024-01-14', 
    '2024-12-15', 
    '2025-01-13', 
    30, 
    'Aprovada'
);

-- Benefício de teste
INSERT INTO `hr_benefits` (
    `employee_id`, `benefit_type`, `monthly_value`, 
    `start_date`, `status`
) VALUES (
    1, 
    'Vale Transporte', 
    200.00, 
    '2020-01-15', 
    'Ativo'
);
*/

-- ========================================================================
-- VERIFICAÇÃO DAS TABELAS CRIADAS
-- ========================================================================
SELECT 
    'hr_employees' AS tabela,
    COUNT(*) AS registros
FROM hr_employees
UNION ALL
SELECT 
    'hr_vacations' AS tabela,
    COUNT(*) AS registros
FROM hr_vacations
UNION ALL
SELECT 
    'hr_leaves' AS tabela,
    COUNT(*) AS registros
FROM hr_leaves
UNION ALL
SELECT 
    'hr_benefits' AS tabela,
    COUNT(*) AS registros
FROM hr_benefits
UNION ALL
SELECT 
    'hr_documents' AS tabela,
    COUNT(*) AS registros
FROM hr_documents;

-- ========================================================================
-- FIM DO SCHEMA
-- ========================================================================

-- NOTAS DE IMPLEMENTAÇÃO:
-- 1. Execute este script no banco de dados do sistema
-- 2. Certifique-se de que a tabela 'users' já existe
-- 3. Ajuste os tipos de dados conforme necessário para seu ambiente
-- 4. Considere adicionar mais índices se houver queries específicas
-- 5. Para produção, considere particionamento de tabelas grandes
