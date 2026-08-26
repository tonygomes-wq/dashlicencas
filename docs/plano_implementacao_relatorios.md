# Plano de Implementação: Sistema de Relatórios Bitdefender

**Prioridade:** 🔴 CRÍTICA  
**Sprint:** 1  
**Duração Estimada:** 2 semanas  
**Data:** 26 de agosto de 2026

---

## 🎯 OBJETIVO

Implementar sistema completo de relatórios da API Bitdefender, permitindo:
- Gerar relatórios instantâneos de Malware Status
- Gerar relatórios de On-demand Scanning
- Agendar relatórios automáticos (diário/semanal/mensal)
- Download automático de PDF + CSV
- Interface integrada ao dashboard existente

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Database Schema (Dia 1)
- [ ] Criar tabela `bitdefender_reports`
- [ ] Criar tabela `bitdefender_report_schedules`
- [ ] Criar tabela `bitdefender_report_downloads`
- [ ] Adicionar índices otimizados
- [ ] Testar migrations

### Fase 2: API Backend (Dias 2-5)
- [ ] Criar `app_bitdefender_reports.php`
- [ ] Implementar método `createReport`
- [ ] Implementar método `getReportsList`
- [ ] Implementar método `getDownloadLinks`
- [ ] Implementar método `deleteReport`
- [ ] Implementar agendamento de relatórios
- [ ] Sistema de download e extração de ZIP
- [ ] Logs e auditoria

### Fase 3: Testes API (Dia 6)
- [ ] Testar criação de relatório tipo 12 (Malware)
- [ ] Testar criação de relatório tipo 15 (Scans)
- [ ] Testar download de PDF + CSV
- [ ] Testar relatórios programados
- [ ] Testar com múltiplos clientes

### Fase 4: Interface Frontend (Dias 7-10)
- [ ] Página de relatórios no dashboard
- [ ] Botão "Gerar Relatório"
- [ ] Seletor de tipo de relatório
- [ ] Seletor de período
- [ ] Lista de relatórios gerados
- [ ] Download de PDF/CSV
- [ ] Agendamento de relatórios

### Fase 5: Integração (Dias 11-12)
- [ ] Integrar com página de clientes
- [ ] Botão de relatório rápido
- [ ] Notificações de relatório pronto
- [ ] Sistema de cache

### Fase 6: Documentação e Deploy (Dias 13-14)
- [ ] Documentação técnica
- [ ] Guia do usuário
- [ ] Deploy em produção
- [ ] Treinamento da equipe

---

## 💾 DATABASE SCHEMA

```sql
-- ============================================================
-- SCHEMA: Sistema de Relatórios Bitdefender
-- Versão: 1.0
-- Data: 2026-08-26
-- ============================================================

-- Tabela principal de relatórios
CREATE TABLE IF NOT EXISTS bitdefender_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relacionamento
    client_id INT NOT NULL,
    user_id INT NOT NULL COMMENT 'Usuário que solicitou',
    
    -- Identificação
    bitdefender_report_id VARCHAR(255) NULL COMMENT 'ID do relatório no GravityZone',
    report_name VARCHAR(255) NOT NULL,
    report_type INT NOT NULL COMMENT '12=Malware, 15=Scans, etc',
    report_type_name VARCHAR(100) NOT NULL,
    
    -- Status
    status ENUM('pending', 'generating', 'ready', 'downloaded', 'failed', 'expired') DEFAULT 'pending',
    generation_mode ENUM('instant', 'scheduled') DEFAULT 'instant',
    
    -- Parâmetros
    reporting_interval VARCHAR(50) NULL COMMENT 'thisMonth, lastWeek, etc',
    filter_type INT DEFAULT 0 COMMENT '0=Todos, 1=Infectados',
    detailed_export BOOLEAN DEFAULT FALSE COMMENT 'Incluir detalhes no PDF',
    custom_params JSON NULL COMMENT 'Outros parâmetros específicos',
    
    -- Arquivos gerados
    pdf_path VARCHAR(500) NULL,
    csv_path VARCHAR(500) NULL,
    pdf_size_kb INT NULL,
    csv_size_kb INT NULL,
    
    -- URLs de download (temporárias)
    download_url VARCHAR(1000) NULL,
    download_url_expires_at DATETIME NULL,
    
    -- Metadados
    generation_started_at DATETIME NULL,
    generation_completed_at DATETIME NULL,
    downloaded_at DATETIME NULL,
    generation_duration_seconds INT NULL,
    
    -- Resultados
    total_endpoints INT NULL,
    infected_endpoints INT NULL,
    threats_detected INT NULL,
    scans_performed INT NULL,
    result_summary JSON NULL COMMENT 'Resumo dos resultados',
    
    -- Erro
    error_message TEXT NULL,
    error_details JSON NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at DATETIME NULL COMMENT 'Data de expiração do relatório no GravityZone',
    
    -- Índices
    INDEX idx_client (client_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_type (report_type),
    INDEX idx_created (created_at),
    INDEX idx_bitdefender_id (bitdefender_report_id),
    
    -- Chaves estrangeiras
    FOREIGN KEY (client_id) REFERENCES bitdefender_licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================

-- Tabela de agendamentos de relatórios
CREATE TABLE IF NOT EXISTS bitdefender_report_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relacionamento
    client_id INT NOT NULL,
    user_id INT NOT NULL COMMENT 'Usuário que criou o agendamento',
    
    -- Configuração do agendamento
    schedule_name VARCHAR(255) NOT NULL,
    report_type INT NOT NULL,
    report_type_name VARCHAR(100) NOT NULL,
    
    -- Recorrência
    recurrence ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
    day_of_week INT NULL COMMENT '1=Segunda, 7=Domingo',
    day_of_month INT NULL COMMENT '1-31',
    time_of_day TIME NOT NULL DEFAULT '08:00:00',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Parâmetros do relatório
    reporting_interval VARCHAR(50) NULL COMMENT 'Período a ser considerado',
    filter_type INT DEFAULT 0,
    detailed_export BOOLEAN DEFAULT FALSE,
    custom_params JSON NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_execution_at DATETIME NULL,
    last_execution_status ENUM('success', 'failed') NULL,
    last_error_message TEXT NULL,
    next_execution_at DATETIME NULL,
    execution_count INT DEFAULT 0,
    
    -- Notificações
    send_email_notification BOOLEAN DEFAULT TRUE,
    notification_emails JSON NULL COMMENT 'Array de emails',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices
    INDEX idx_client (client_id),
    INDEX idx_user (user_id),
    INDEX idx_active (is_active),
    INDEX idx_next_execution (next_execution_at),
    INDEX idx_recurrence (recurrence),
    
    -- Chaves estrangeiras
    FOREIGN KEY (client_id) REFERENCES bitdefender_licenses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================

-- Tabela de histórico de downloads
CREATE TABLE IF NOT EXISTS bitdefender_report_downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    report_id INT NOT NULL,
    user_id INT NOT NULL,
    
    download_type ENUM('pdf', 'csv', 'zip') NOT NULL,
    file_size_kb INT NULL,
    
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    
    INDEX idx_report (report_id),
    INDEX idx_user (user_id),
    INDEX idx_date (downloaded_at),
    
    FOREIGN KEY (report_id) REFERENCES bitdefender_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================

-- View auxiliar para dashboard
CREATE OR REPLACE VIEW v_bitdefender_reports_summary AS
SELECT 
    br.id,
    br.client_id,
    bl.company AS client_name,
    br.report_name,
    br.report_type_name,
    br.status,
    br.generation_mode,
    br.created_at,
    br.generation_completed_at,
    br.total_endpoints,
    br.infected_endpoints,
    br.threats_detected,
    TIMESTAMPDIFF(SECOND, br.generation_started_at, br.generation_completed_at) AS duration_seconds,
    u.username AS created_by,
    CASE 
        WHEN br.pdf_path IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END AS has_pdf,
    CASE 
        WHEN br.csv_path IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END AS has_csv
FROM bitdefender_reports br
LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
LEFT JOIN users u ON br.user_id = u.id
ORDER BY br.created_at DESC;

-- ============================================================

-- Stored Procedure para calcular próxima execução
DELIMITER //

CREATE PROCEDURE calculate_next_execution(
    IN schedule_id INT
)
BEGIN
    DECLARE v_recurrence VARCHAR(20);
    DECLARE v_time_of_day TIME;
    DECLARE v_day_of_week INT;
    DECLARE v_day_of_month INT;
    DECLARE v_next_execution DATETIME;
    
    -- Buscar configurações
    SELECT recurrence, time_of_day, day_of_week, day_of_month
    INTO v_recurrence, v_time_of_day, v_day_of_week, v_day_of_month
    FROM bitdefender_report_schedules
    WHERE id = schedule_id;
    
    -- Calcular próxima execução
    SET v_next_execution = CASE
        WHEN v_recurrence = 'daily' THEN
            DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL HOUR(v_time_of_day) HOUR + INTERVAL MINUTE(v_time_of_day) MINUTE
        WHEN v_recurrence = 'weekly' THEN
            DATE_ADD(CURDATE(), INTERVAL (7 - WEEKDAY(CURDATE()) + v_day_of_week - 1) % 7 DAY) + INTERVAL HOUR(v_time_of_day) HOUR
        WHEN v_recurrence = 'monthly' THEN
            DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL v_day_of_month - 1 DAY) + INTERVAL HOUR(v_time_of_day) HOUR
        ELSE
            NULL
    END;
    
    -- Atualizar
    UPDATE bitdefender_report_schedules
    SET next_execution_at = v_next_execution
    WHERE id = schedule_id;
END //

DELIMITER ;

-- ============================================================

-- Índices adicionais para performance
ALTER TABLE bitdefender_reports 
    ADD INDEX idx_status_client (status, client_id),
    ADD INDEX idx_type_status (report_type, status),
    ADD INDEX idx_created_client (created_at, client_id);

-- ============================================================

-- Comentários nas tabelas
ALTER TABLE bitdefender_reports 
    COMMENT = 'Armazena relatórios gerados via API Bitdefender GravityZone';

ALTER TABLE bitdefender_report_schedules 
    COMMENT = 'Agendamentos automáticos de relatórios periódicos';

ALTER TABLE bitdefender_report_downloads 
    COMMENT = 'Histórico de downloads de relatórios para auditoria';
```

---

## 🔧 IMPLEMENTAÇÃO DA API

### Arquivo: app_bitdefender_reports.php

```php
<?php
/**
 * API de Relatórios Bitdefender
 * Gerencia geração, agendamento e download de relatórios do GravityZone
 * 
 * Versão: 1.0
 * Data: 2026-08-26
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_auth.php';

$auth = check_auth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

$user = $auth['user'];
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            handleGet($pdo, $user);
            break;
        case 'POST':
            handlePost($pdo, $user);
            break;
        case 'DELETE':
            handleDelete($pdo, $user);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    error_log("Erro em app_bitdefender_reports.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

/**
 * GET - Listar relatórios ou baixar arquivo
 */
function handleGet($pdo, $user) {
    $action = $_GET['action'] ?? 'list';

    switch ($action) {
        case 'list':
            listReports($pdo, $user);
            break;
        case 'get':
            getReport($pdo, $user);
            break;
        case 'download':
            downloadReport($pdo, $user);
            break;
        case 'types':
            getReportTypes($pdo, $user);
            break;
        case 'schedules':
            listSchedules($pdo, $user);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

/**
 * Listar relatórios
 */
function listReports($pdo, $user) {
    $clientId = $_GET['client_id'] ?? null;
    $status = $_GET['status'] ?? null;
    $limit = (int)($_GET['limit'] ?? 50);
    $offset = (int)($_GET['offset'] ?? 0);

    $whereClause = "1=1";
    $params = [];

    if ($clientId) {
        $whereClause .= " AND client_id = ?";
        $params[] = $clientId;
    }

    if ($status) {
        $whereClause .= " AND status = ?";
        $params[] = $status;
    }

    $stmt = $pdo->prepare("
        SELECT * FROM v_bitdefender_reports_summary
        WHERE $whereClause
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt->execute($params);
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Contar total
    $countStmt = $pdo->prepare("
        SELECT COUNT(*) as total 
        FROM bitdefender_reports 
        WHERE $whereClause
    ");
    $countStmt->execute(array_slice($params, 0, -2)); // Remove limit e offset
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        'success' => true,
        'data' => $reports,
        'pagination' => [
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total
        ]
    ]);
}

/**
 * Obter detalhes de um relatório específico
 */
function getReport($pdo, $user) {
    $reportId = $_GET['id'] ?? null;
    
    if (!$reportId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do relatório não fornecido']);
        return;
    }

    $stmt = $pdo->prepare("
        SELECT * FROM bitdefender_reports WHERE id = ?
    ");
    $stmt->execute([$reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$report) {
        http_response_code(404);
        echo json_encode(['error' => 'Relatório não encontrado']);
        return;
    }

    // Verificar se o relatório ainda está disponível no GravityZone
    if ($report['status'] === 'ready' && $report['bitdefender_report_id']) {
        checkReportAvailability($pdo, $report);
    }

    echo json_encode([
        'success' => true,
        'data' => $report
    ]);
}

/**
 * POST - Criar relatório ou agendamento
 */
function handlePost($pdo, $user) {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? 'create';

    switch ($action) {
        case 'create':
            createReport($pdo, $user, $data);
            break;
        case 'schedule':
            scheduleReport($pdo, $user, $data);
            break;
        case 'check_status':
            checkReportStatus($pdo, $user, $data);
            break;
        case 'refresh_download_link':
            refreshDownloadLink($pdo, $user, $data);
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Ação inválida']);
    }
}

/**
 * Criar relatório instantâneo
 */
function createReport($pdo, $user, $data) {
    // Validar parâmetros
    if (!isset($data['client_id']) || !isset($data['report_type'])) {
        http_response_code(400);
        echo json_encode(['error' => 'client_id e report_type são obrigatórios']);
        return;
    }

    $clientId = $data['client_id'];
    $reportType = (int)$data['report_type'];
    $reportName = $data['report_name'] ?? getReportTypeName($reportType);
    
    // Buscar configuração do cliente
    $client = getClient($pdo, $clientId);
    
    if (!$client) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente não encontrado']);
        return;
    }

    if (!$client['client_api_key']) {
        http_response_code(400);
        echo json_encode(['error' => 'Cliente não possui API Key configurada']);
        return;
    }

    // Preparar parâmetros do relatório
    $reportParams = buildReportParams($reportType, $data);

    // Inserir no banco com status 'pending'
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_reports (
            client_id, user_id, report_name, report_type, report_type_name,
            status, generation_mode, reporting_interval, filter_type, 
            detailed_export, custom_params, generation_started_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', 'instant', ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $clientId,
        $user['id'],
        $reportName,
        $reportType,
        getReportTypeName($reportType),
        $reportParams['reportingInterval'] ?? null,
        $reportParams['filterType'] ?? 0,
        $reportParams['detailedExport'] ?? false,
        json_encode($reportParams)
    ]);

    $reportId = $pdo->lastInsertId();

    try {
        // Atualizar status para 'generating'
        updateReportStatus($pdo, $reportId, 'generating');

        // Chamar API Bitdefender
        $result = callBitdefenderAPI(
            $client['client_access_url'],
            $client['client_api_key'],
            'reporting',
            'createReport',
            [
                'type' => $reportType,
                'options' => $reportParams
            ]
        );

        if (!isset($result['result'])) {
            throw new Exception('Resposta inválida da API Bitdefender');
        }

        $bitdefenderReportId = $result['result']['reportId'] ?? null;
        $downloadUrl = $result['result']['downloadUrl'] ?? null;

        // Atualizar registro
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET bitdefender_report_id = ?,
                status = 'ready',
                download_url = ?,
                download_url_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR),
                generation_completed_at = NOW(),
                generation_duration_seconds = TIMESTAMPDIFF(SECOND, generation_started_at, NOW())
            WHERE id = ?
        ");
        $stmt->execute([$bitdefenderReportId, $downloadUrl, $reportId]);

        // Fazer download imediatamente se disponível
        if ($downloadUrl) {
            downloadAndStoreReport($pdo, $reportId, $downloadUrl, $client);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Relatório criado com sucesso',
            'data' => [
                'report_id' => $reportId,
                'bitdefender_report_id' => $bitdefenderReportId,
                'status' => 'ready',
                'download_available' => !empty($downloadUrl)
            ]
        ]);

    } catch (Exception $e) {
        // Atualizar status para 'failed'
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET status = 'failed',
                error_message = ?,
                error_details = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $e->getMessage(),
            json_encode(['trace' => $e->getTraceAsString()]),
            $reportId
        ]);

        throw $e;
    }
}

/**
 * Fazer download e armazenar relatório
 */
function downloadAndStoreReport($pdo, $reportId, $downloadUrl, $client) {
    try {
        // Criar diretório se não existir
        $reportsDir = __DIR__ . '/storage/reports/' . $client['id'];
        if (!file_exists($reportsDir)) {
            mkdir($reportsDir, 0755, true);
        }

        // Download do ZIP
        $zipPath = $reportsDir . '/report_' . $reportId . '.zip';
        $zipContent = file_get_contents($downloadUrl);
        file_put_contents($zipPath, $zipContent);

        // Extrair ZIP
        $zip = new ZipArchive();
        if ($zip->open($zipPath) === TRUE) {
            $pdfPath = null;
            $csvPath = null;

            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                $fileinfo = pathinfo($filename);
                
                if ($fileinfo['extension'] === 'pdf') {
                    $pdfPath = $reportsDir . '/report_' . $reportId . '.pdf';
                    copy("zip://" . $zipPath . "#" . $filename, $pdfPath);
                } elseif ($fileinfo['extension'] === 'csv') {
                    $csvPath = $reportsDir . '/report_' . $reportId . '.csv';
                    copy("zip://" . $zipPath . "#" . $filename, $csvPath);
                }
            }
            $zip->close();

            // Atualizar banco
            $stmt = $pdo->prepare("
                UPDATE bitdefender_reports
                SET status = 'downloaded',
                    pdf_path = ?,
                    csv_path = ?,
                    pdf_size_kb = ?,
                    csv_size_kb = ?,
                    downloaded_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $pdfPath,
                $csvPath,
                $pdfPath ? round(filesize($pdfPath) / 1024, 2) : null,
                $csvPath ? round(filesize($csvPath) / 1024, 2) : null,
                $reportId
            ]);

            // Remover ZIP
            unlink($zipPath);

            return true;
        }

        throw new Exception('Erro ao extrair ZIP');

    } catch (Exception $e) {
        error_log("Erro ao fazer download do relatório $reportId: " . $e->getMessage());
        return false;
    }
}

/**
 * Download de relatório pelo usuário
 */
function downloadReport($pdo, $user) {
    $reportId = $_GET['id'] ?? null;
    $fileType = $_GET['type'] ?? 'pdf'; // pdf ou csv

    if (!$reportId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do relatório não fornecido']);
        return;
    }

    $stmt = $pdo->prepare("SELECT * FROM bitdefender_reports WHERE id = ?");
    $stmt->execute([$reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$report) {
        http_response_code(404);
        echo json_encode(['error' => 'Relatório não encontrado']);
        return;
    }

    $filePath = $fileType === 'pdf' ? $report['pdf_path'] : $report['csv_path'];

    if (!$filePath || !file_exists($filePath)) {
        http_response_code(404);
        echo json_encode(['error' => 'Arquivo não encontrado']);
        return;
    }

    // Registrar download
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_report_downloads (
            report_id, user_id, download_type, file_size_kb, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $reportId,
        $user['id'],
        $fileType,
        round(filesize($filePath) / 1024, 2),
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);

    // Enviar arquivo
    header('Content-Type: application/' . $fileType);
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
}

// ... [Continua com funções auxiliares]

/**
 * Tipos de relatórios disponíveis
 */
function getReportTypes($pdo, $user) {
    $types = [
        ['id' => 1, 'name' => 'Network Inventory', 'description' => 'Inventário completo da rede'],
        ['id' => 2, 'name' => 'Network Status', 'description' => 'Status atual da rede'],
        ['id' => 12, 'name' => 'Malware Status', 'description' => 'Status de malware e antimalware'],
        ['id' => 15, 'name' => 'On-demand Scanning', 'description' => 'Relatório de varreduras sob demanda'],
        ['id' => 8, 'name' => 'Update Status', 'description' => 'Status de atualizações'],
        ['id' => 10, 'name' => 'Monthly License Usage', 'description' => 'Uso mensal de licenças']
    ];

    echo json_encode([
        'success' => true,
        'data' => $types
    ]);
}

/**
 * Construir parâmetros do relatório baseado no tipo
 */
function buildReportParams($reportType, $data) {
    $params = [
        'reportingInterval' => $data['reporting_interval'] ?? 'thisMonth'
    ];

    // Parâmetros específicos por tipo
    if ($reportType == 12) { // Malware Status
        $params['filterType'] = $data['filter_type'] ?? 0; // 0=Todos, 1=Infectados
        $params['detailedExport'] = $data['detailed_export'] ?? [1];
    } elseif ($reportType == 15) { // On-demand Scanning
        $params['scanType'] = $data['scan_type'] ?? null; // quick, full, custom
    }

    return $params;
}

/**
 * Obter nome do tipo de relatório
 */
function getReportTypeName($type) {
    $names = [
        1 => 'Network Inventory',
        2 => 'Network Status',
        12 => 'Malware Status',
        15 => 'On-demand Scanning',
        8 => 'Update Status',
        10 => 'Monthly License Usage'
    ];

    return $names[$type] ?? 'Unknown Report Type';
}

/**
 * Buscar cliente
 */
function getClient($pdo, $clientId) {
    $stmt = $pdo->prepare("
        SELECT * FROM bitdefender_licenses WHERE id = ?
    ");
    $stmt->execute([$clientId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

/**
 * Atualizar status do relatório
 */
function updateReportStatus($pdo, $reportId, $status, $errorMessage = null) {
    $stmt = $pdo->prepare("
        UPDATE bitdefender_reports
        SET status = ?, error_message = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$status, $errorMessage, $reportId]);
}

/**
 * Chamar API Bitdefender
 */
function callBitdefenderAPI($accessUrl, $apiKey, $apiModule, $method, $params = []) {
    $accessUrl = rtrim($accessUrl, '/');
    
    if (!str_ends_with($accessUrl, '/jsonrpc')) {
        if (!str_ends_with($accessUrl, '/api')) {
            $accessUrl .= '/api';
        }
        $accessUrl .= '/v1.0/jsonrpc';
    }
    
    $url = $accessUrl . '/' . $apiModule;

    $payload = json_encode([
        'params' => $params,
        'jsonrpc' => '2.0',
        'method' => $method,
        'id' => uniqid()
    ]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception("Erro cURL: $curlError");
    }

    if ($httpCode !== 200) {
        throw new Exception("Erro HTTP $httpCode");
    }

    $decoded = json_decode($response, true);
    
    if (!$decoded) {
        throw new Exception("Resposta JSON inválida");
    }

    if (isset($decoded['error'])) {
        throw new Exception("API Error: " . ($decoded['error']['message'] ?? 'Unknown error'));
    }

    return $decoded;
}
```

---

## 🎨 PRÓXIMOS PASSOS

1. **Criar o arquivo SQL** `docs/db_bitdefender_reports.sql` com o schema
2. **Implementar** `app_bitdefender_reports.php` completo
3. **Testar** com cliente real do Bitdefender
4. **Criar interface** no dashboard
5. **Documentar** uso da API

---

**Status:** 📝 Pronto para implementação  
**Responsável:** Equipe de Desenvolvimento  
**Revisão:** Pendente
