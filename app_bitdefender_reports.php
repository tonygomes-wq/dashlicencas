<?php
/**
 * API de Relatórios Bitdefender GravityZone
 * Gerencia geração, agendamento e download de relatórios
 * 
 * Endpoints:
 * - GET  /app_bitdefender_reports.php?action=list - Listar relatórios
 * - GET  /app_bitdefender_reports.php?action=get&id=X - Obter relatório específico
 * - GET  /app_bitdefender_reports.php?action=download&id=X&type=pdf|csv - Download
 * - GET  /app_bitdefender_reports.php?action=types - Tipos disponíveis
 * - GET  /app_bitdefender_reports.php?action=schedules - Listar agendamentos
 * - POST /app_bitdefender_reports.php - Criar relatório ou agendamento
 * - PUT  /app_bitdefender_reports.php?id=X - Atualizar agendamento
 * - DELETE /app_bitdefender_reports.php?id=X - Deletar relatório/agendamento
 * 
 * @version 1.0
 * @date 2026-08-26
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/srv/config.php';
require_once __DIR__ . '/app_auth.php';

// Verificar autenticação
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
        case 'PUT':
            handlePut($pdo, $user);
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
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

/**
 * GET - Listar relatórios ou realizar ações de leitura
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
            getReportTypes();
            break;
        case 'intervals':
            getReportingIntervals();
            break;
        case 'schedules':
            listSchedules($pdo, $user);
            break;
        case 'schedule':
            getSchedule($pdo, $user);
            break;
        case 'stats':
            getReportStats($pdo, $user);
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
    $reportType = $_GET['report_type'] ?? null;
    $limit = min((int)($_GET['limit'] ?? 50), 200);
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

    if ($reportType) {
        $whereClause .= " AND report_type = ?";
        $params[] = $reportType;
    }

    // Listar relatórios com JOIN manual
    $stmt = $pdo->prepare("
        SELECT br.*,
               bl.company AS client_name,
               CASE 
                   WHEN br.pdf_path IS NOT NULL AND br.pdf_path != '' THEN TRUE 
                   ELSE FALSE 
               END AS has_pdf,
               CASE 
                   WHEN br.csv_path IS NOT NULL AND br.csv_path != '' THEN TRUE 
                   ELSE FALSE 
               END AS has_csv
        FROM bitdefender_reports br
        LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
        WHERE $whereClause
        ORDER BY br.created_at DESC
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
        SELECT br.*, 
               bl.company as client_name
        FROM bitdefender_reports br
        LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
        WHERE br.id = ?
    ");
    $stmt->execute([$reportId]);
    $report = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$report) {
        http_response_code(404);
        echo json_encode(['error' => 'Relatório não encontrado']);
        return;
    }

    // Decodificar JSON fields
    if ($report['custom_params']) {
        $report['custom_params'] = json_decode($report['custom_params'], true);
    }
    if ($report['result_summary']) {
        $report['result_summary'] = json_decode($report['result_summary'], true);
    }
    if ($report['error_details']) {
        $report['error_details'] = json_decode($report['error_details'], true);
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
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        return;
    }

    $action = $data['action'] ?? 'create_report';

    switch ($action) {
        case 'create_report':
            createReport($pdo, $user, $data);
            break;
        case 'create_schedule':
            createSchedule($pdo, $user, $data);
            break;
        case 'check_status':
            checkReportStatus($pdo, $user, $data);
            break;
        case 'refresh_download':
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
    // Validar parâmetros obrigatórios
    if (!isset($data['client_id']) || !isset($data['report_type'])) {
        http_response_code(400);
        echo json_encode(['error' => 'client_id e report_type são obrigatórios']);
        return;
    }

    $clientId = (int)$data['client_id'];
    $reportType = (int)$data['report_type'];
    $reportName = $data['report_name'] ?? getReportTypeName($reportType) . ' - ' . date('d/m/Y H:i');
    
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
        $reportParams['reportingInterval'] ?? 'thisMonth',
        $reportParams['filterType'] ?? 0,
        isset($reportParams['detailedExport']) ? 1 : 0,
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
            throw new Exception('Resposta inválida da API Bitdefender: ' . json_encode($result));
        }

        $bitdefenderReportId = $result['result']['reportId'] ?? null;

        // Atualizar registro com ID do Bitdefender
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET bitdefender_report_id = ?,
                status = 'ready',
                generation_completed_at = NOW(),
                generation_duration_seconds = TIMESTAMPDIFF(SECOND, generation_started_at, NOW())
            WHERE id = ?
        ");
        $stmt->execute([$bitdefenderReportId, $reportId]);

        // Tentar obter link de download imediatamente
        try {
            $downloadResult = callBitdefenderAPI(
                $client['client_access_url'],
                $client['client_api_key'],
                'reporting',
                'getDownloadLinks',
                ['reportId' => $bitdefenderReportId]
            );

            if (isset($downloadResult['result']['url'])) {
                $downloadUrl = $downloadResult['result']['url'];
                
                // Atualizar com URL de download
                $stmt = $pdo->prepare("
                    UPDATE bitdefender_reports
                    SET download_url = ?,
                        download_url_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR)
                    WHERE id = ?
                ");
                $stmt->execute([$downloadUrl, $reportId]);

                // Fazer download imediatamente
                downloadAndStoreReport($pdo, $reportId, $downloadUrl, $client);
            }
        } catch (Exception $e) {
            // Não é crítico se falhar obter o link agora
            error_log("Aviso: Não foi possível obter link de download imediatamente: " . $e->getMessage());
        }

        // Buscar relatório atualizado
        $stmt = $pdo->prepare("
            SELECT br.*, bl.company AS client_name
            FROM bitdefender_reports br
            LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
            WHERE br.id = ?
        ");
        $stmt->execute([$reportId]);
        $reportData = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Relatório criado com sucesso',
            'data' => $reportData
        ]);

    } catch (Exception $e) {
        // Atualizar status para 'failed'
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET status = 'failed',
                error_message = ?,
                error_details = ?,
                generation_completed_at = NOW()
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
 * Fazer download e armazenar relatório localmente
 */
function downloadAndStoreReport($pdo, $reportId, $downloadUrl, $client) {
    try {
        // Criar diretório se não existir
        $reportsDir = __DIR__ . '/storage/reports/' . $client['id'];
        if (!file_exists($reportsDir)) {
            mkdir($reportsDir, 0755, true);
        }

        // Download do arquivo (pode ser ZIP contendo PDF+CSV)
        $ch = curl_init($downloadUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutos
        $fileContent = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$fileContent) {
            throw new Exception("Erro ao baixar relatório: HTTP $httpCode");
        }

        // Salvar arquivo temporário
        $tempFile = $reportsDir . '/temp_' . $reportId . '.download';
        file_put_contents($tempFile, $fileContent);

        $pdfPath = null;
        $csvPath = null;

        // Verificar se é um ZIP
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tempFile);
        finfo_close($finfo);

        if ($mimeType === 'application/zip' || $mimeType === 'application/x-zip-compressed') {
            // É um ZIP, extrair
            $zip = new ZipArchive();
            if ($zip->open($tempFile) === TRUE) {
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    $fileinfo = pathinfo($filename);
                    
                    if (isset($fileinfo['extension'])) {
                        if (strtolower($fileinfo['extension']) === 'pdf') {
                            $pdfPath = $reportsDir . '/report_' . $reportId . '.pdf';
                            copy("zip://" . $tempFile . "#" . $filename, $pdfPath);
                        } elseif (strtolower($fileinfo['extension']) === 'csv') {
                            $csvPath = $reportsDir . '/report_' . $reportId . '.csv';
                            copy("zip://" . $tempFile . "#" . $filename, $csvPath);
                        }
                    }
                }
                $zip->close();
            }
            
            // Remover ZIP temporário
            unlink($tempFile);
        } else {
            // Não é ZIP, verificar se é PDF ou CSV diretamente
            if (strpos($mimeType, 'pdf') !== false) {
                $pdfPath = $reportsDir . '/report_' . $reportId . '.pdf';
                rename($tempFile, $pdfPath);
            } elseif (strpos($mimeType, 'csv') !== false || strpos($mimeType, 'text') !== false) {
                $csvPath = $reportsDir . '/report_' . $reportId . '.csv';
                rename($tempFile, $csvPath);
            } else {
                // Tipo desconhecido, salvar como PDF por padrão
                $pdfPath = $reportsDir . '/report_' . $reportId . '.pdf';
                rename($tempFile, $pdfPath);
            }
        }

        // Atualizar banco de dados
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
            $pdfPath && file_exists($pdfPath) ? round(filesize($pdfPath) / 1024, 2) : null,
            $csvPath && file_exists($csvPath) ? round(filesize($csvPath) / 1024, 2) : null,
            $reportId
        ]);

        return true;

    } catch (Exception $e) {
        error_log("Erro ao fazer download do relatório $reportId: " . $e->getMessage());
        
        // Atualizar status de erro mas não falhar completamente
        $stmt = $pdo->prepare("
            UPDATE bitdefender_reports
            SET error_message = CONCAT(COALESCE(error_message, ''), '\n', ?)
            WHERE id = ?
        ");
        $stmt->execute(["Erro no download: " . $e->getMessage(), $reportId]);
        
        return false;
    }
}

/**
 * Download de relatório pelo usuário (serve o arquivo)
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
        echo json_encode(['error' => 'Arquivo não encontrado. O relatório pode não ter sido baixado ainda.']);
        return;
    }

    // Registrar download para auditoria
    try {
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
    } catch (Exception $e) {
        error_log("Erro ao registrar download: " . $e->getMessage());
    }

    // Enviar arquivo
    header('Content-Type: application/' . ($fileType === 'pdf' ? 'pdf' : 'csv'));
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: 0');
    
    readfile($filePath);
    exit;
}

/**
 * Criar agendamento de relatório
 */
function createSchedule($pdo, $user, $data) {
    // Validar parâmetros
    $required = ['client_id', 'schedule_name', 'report_type', 'recurrence', 'time_of_day'];
    foreach ($required as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Campo obrigatório: $field"]);
            return;
        }
    }

    $reportParams = buildReportParams($data['report_type'], $data);

    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_report_schedules (
            client_id, user_id, schedule_name, report_type, report_type_name,
            description, recurrence, day_of_week, day_of_month, time_of_day,
            timezone, reporting_interval, filter_type, detailed_export,
            custom_params, send_email_notification, notification_emails, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['client_id'],
        $user['id'],
        $data['schedule_name'],
        $data['report_type'],
        getReportTypeName($data['report_type']),
        $data['description'] ?? null,
        $data['recurrence'],
        $data['day_of_week'] ?? null,
        $data['day_of_month'] ?? null,
        $data['time_of_day'],
        $data['timezone'] ?? 'America/Sao_Paulo',
        $reportParams['reportingInterval'] ?? null,
        $reportParams['filterType'] ?? 0,
        isset($reportParams['detailedExport']) ? 1 : 0,
        json_encode($reportParams),
        $data['send_email_notification'] ?? true,
        isset($data['notification_emails']) ? json_encode($data['notification_emails']) : null,
        $data['is_active'] ?? true
    ]);

    $scheduleId = $pdo->lastInsertId();

    // Buscar agendamento criado (trigger já calculou next_execution)
    $stmt = $pdo->prepare("
        SELECT brs.*, bl.company AS client_name
        FROM bitdefender_report_schedules brs
        LEFT JOIN bitdefender_licenses bl ON brs.client_id = bl.id
        WHERE brs.id = ?
    ");
    $stmt->execute([$scheduleId]);
    $schedule = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Agendamento criado com sucesso',
        'data' => $schedule
    ]);
}

/**
 * Listar agendamentos
 */
function listSchedules($pdo, $user) {
    $clientId = $_GET['client_id'] ?? null;
    $isActive = isset($_GET['is_active']) ? (bool)$_GET['is_active'] : null;

    $whereClause = "1=1";
    $params = [];

    if ($clientId) {
        $whereClause .= " AND client_id = ?";
        $params[] = $clientId;
    }

    if ($isActive !== null) {
        $whereClause .= " AND is_active = ?";
        $params[] = $isActive;
    }

    $stmt = $pdo->prepare("
        SELECT brs.*, bl.company AS client_name
        FROM bitdefender_report_schedules brs
        LEFT JOIN bitdefender_licenses bl ON brs.client_id = bl.id
        WHERE $whereClause
        ORDER BY brs.next_execution_at ASC
    ");
    $stmt->execute($params);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $schedules
    ]);
}

/**
 * PUT - Atualizar agendamento
 */
function handlePut($pdo, $user) {
    $scheduleId = $_GET['id'] ?? null;
    
    if (!$scheduleId) {
        http_response_code(400);
        echo json_encode(['error' => 'ID do agendamento não fornecido']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Dados inválidos']);
        return;
    }

    // Campos permitidos para atualização
    $allowedFields = [
        'schedule_name', 'description', 'recurrence', 'day_of_week', 
        'day_of_month', 'time_of_day', 'timezone', 'reporting_interval',
        'filter_type', 'detailed_export', 'custom_params', 
        'send_email_notification', 'notification_emails', 'is_active'
    ];

    $updates = [];
    $params = [];

    foreach ($allowedFields as $field) {
        if (array_key_exists($field, $data)) {
            $updates[] = "$field = ?";
            
            // Converter arrays para JSON
            if (in_array($field, ['custom_params', 'notification_emails']) && is_array($data[$field])) {
                $params[] = json_encode($data[$field]);
            } else {
                $params[] = $data[$field];
            }
        }
    }

    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['error' => 'Nenhum campo para atualizar']);
        return;
    }

    $params[] = $scheduleId;
    
    $stmt = $pdo->prepare("
        UPDATE bitdefender_report_schedules 
        SET " . implode(', ', $updates) . "
        WHERE id = ?
    ");
    $stmt->execute($params);

    echo json_encode([
        'success' => true,
        'message' => 'Agendamento atualizado com sucesso'
    ]);
}

/**
 * DELETE - Remover relatório ou agendamento
 */
function handleDelete($pdo, $user) {
    $type = $_GET['type'] ?? 'report'; // report ou schedule
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID não fornecido']);
        return;
    }

    if ($type === 'report') {
        // Buscar relatório para deletar arquivos físicos
        $stmt = $pdo->prepare("SELECT pdf_path, csv_path FROM bitdefender_reports WHERE id = ?");
        $stmt->execute([$id]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($report) {
            // Deletar arquivos físicos
            if ($report['pdf_path'] && file_exists($report['pdf_path'])) {
                unlink($report['pdf_path']);
            }
            if ($report['csv_path'] && file_exists($report['csv_path'])) {
                unlink($report['csv_path']);
            }
        }

        // Deletar do banco
        $stmt = $pdo->prepare("DELETE FROM bitdefender_reports WHERE id = ?");
        $stmt->execute([$id]);
        
        $message = 'Relatório deletado com sucesso';
    } else {
        // Deletar agendamento
        $stmt = $pdo->prepare("DELETE FROM bitdefender_report_schedules WHERE id = ?");
        $stmt->execute([$id]);
        
        $message = 'Agendamento deletado com sucesso';
    }

    echo json_encode([
        'success' => true,
        'message' => $message
    ]);
}

/**
 * Obter tipos de relatórios disponíveis
 */
function getReportTypes() {
    $types = [
        ['id' => 1, 'name' => 'Network Inventory', 'description' => 'Inventário completo da rede', 'category' => 'network'],
        ['id' => 2, 'name' => 'Network Status', 'description' => 'Status atual da rede', 'category' => 'network'],
        ['id' => 12, 'name' => 'Malware Status', 'description' => 'Status de malware e antimalware nos endpoints', 'category' => 'security', 'popular' => true],
        ['id' => 15, 'name' => 'On-demand Scanning', 'description' => 'Relatório de varreduras sob demanda realizadas', 'category' => 'security', 'popular' => true],
        ['id' => 8, 'name' => 'Update Status', 'description' => 'Status de atualizações dos agentes', 'category' => 'maintenance'],
        ['id' => 10, 'name' => 'Monthly License Usage', 'description' => 'Uso mensal de licenças', 'category' => 'licensing'],
        ['id' => 13, 'name' => 'Endpoint Modules Status', 'description' => 'Status dos módulos de proteção', 'category' => 'security'],
        ['id' => 9, 'name' => 'Security Audit', 'description' => 'Auditoria de segurança completa', 'category' => 'security']
    ];

    echo json_encode([
        'success' => true,
        'data' => $types
    ]);
}

/**
 * Obter intervalos de período disponíveis
 */
function getReportingIntervals() {
    $intervals = [
        ['value' => 'today', 'label' => 'Hoje', 'days' => 0],
        ['value' => 'yesterday', 'label' => 'Ontem', 'days' => 1],
        ['value' => 'thisWeek', 'label' => 'Esta Semana', 'days' => 7],
        ['value' => 'lastWeek', 'label' => 'Semana Passada', 'days' => 7],
        ['value' => 'thisMonth', 'label' => 'Este Mês', 'days' => 30],
        ['value' => 'lastMonth', 'label' => 'Mês Passado', 'days' => 30],
        ['value' => 'last2Months', 'label' => 'Últimos 2 Meses', 'days' => 60],
        ['value' => 'last3Months', 'label' => 'Últimos 3 Meses', 'days' => 90],
        ['value' => 'thisYear', 'label' => 'Este Ano', 'days' => 365],
        ['value' => 'lastYear', 'label' => 'Ano Passado', 'days' => 365]
    ];

    echo json_encode([
        'success' => true,
        'data' => $intervals
    ]);
}

/**
 * Obter estatísticas de relatórios
 */
function getReportStats($pdo, $user) {
    $clientId = $_GET['client_id'] ?? null;

    $whereClause = $clientId ? "WHERE client_id = ?" : "WHERE 1=1";
    $params = $clientId ? [$clientId] : [];

    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'downloaded' THEN 1 ELSE 0 END) as downloaded,
            SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
            SUM(CASE WHEN status = 'generating' THEN 1 ELSE 0 END) as generating,
            SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
            COUNT(DISTINCT report_type) as distinct_types,
            AVG(generation_duration_seconds) as avg_duration
        FROM bitdefender_reports
        $whereClause
    ");
    $stmt->execute($params);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $stats
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
        $params['filterType'] = $data['filter_type'] ?? 0; // 0=Todos, 1=Somente infectados
        if (isset($data['detailed_export']) && $data['detailed_export']) {
            $params['detailedExport'] = [1]; // Array conforme API
        }
    } elseif ($reportType == 15) { // On-demand Scanning
        if (isset($data['scan_type'])) {
            $params['scanType'] = $data['scan_type']; // quick, full, custom
        }
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
        8 => 'Update Status',
        9 => 'Security Audit',
        10 => 'Monthly License Usage',
        12 => 'Malware Status',
        13 => 'Endpoint Modules Status',
        15 => 'On-demand Scanning'
    ];

    return $names[$type] ?? 'Unknown Report Type';
}

/**
 * Buscar cliente do banco
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
 * Chamar API Bitdefender (JSON-RPC 2.0)
 */
function callBitdefenderAPI($accessUrl, $apiKey, $apiModule, $method, $params = []) {
    $accessUrl = rtrim($accessUrl, '/');
    
    // Normalizar URL
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
        'id' => uniqid('report_', true)
    ]);

    error_log("=== Bitdefender API Call ===");
    error_log("URL: $url");
    error_log("Method: $method");
    error_log("Payload: $payload");

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

    error_log("HTTP Code: $httpCode");
    error_log("Response: " . substr($response, 0, 500));

    if ($curlError) {
        throw new Exception("Erro cURL: $curlError");
    }

    if ($httpCode !== 200) {
        throw new Exception("Erro HTTP $httpCode: $response");
    }

    $decoded = json_decode($response, true);
    
    if (!$decoded) {
        throw new Exception("Resposta JSON inválida da API: $response");
    }

    if (isset($decoded['error'])) {
        $errorMsg = $decoded['error']['message'] ?? 'Erro desconhecido';
        $errorCode = $decoded['error']['code'] ?? 'N/A';
        throw new Exception("API Error [$errorCode]: $errorMsg");
    }

    return $decoded;
}
