<?php
/**
 * Teste direto de criação de relatório simulando exatamente o que o frontend faz
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'srv/config.php';
require_once 'php_compat_helpers.php';
require_once 'app_auth.php';

session_start();

// Verificar se está logado
if (!isset($_SESSION['user_id'])) {
    // Simular login
    $stmt = $pdo->query("SELECT id FROM users LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $_SESSION['user_id'] = $user['id'];
}

header('Content-Type: application/json; charset=UTF-8');

try {
    // Simular o POST que o frontend envia
    $data = [
        'action' => 'create_report',
        'client_id' => 22, // AMARAL VASCONCELLOS
        'report_type' => 12,
        'report_name' => 'Teste Direto - ' . date('d/m/Y H:i:s'),
        'reporting_interval' => 'thisWeek',
        'filter_type' => 0,
        'detailed_export' => true
    ];
    
    // Buscar usuário
    $auth = check_auth();
    if (!$auth['authenticated']) {
        throw new Exception('Usuário não autenticado');
    }
    
    $user = $auth['user'];
    
    // Incluir as funções do app_bitdefender_reports.php
    // Vamos copiar a lógica inline para debug
    
    $clientId = (int)$data['client_id'];
    $reportType = (int)$data['report_type'];
    $reportName = $data['report_name'] ?? 'Teste';
    
    // Buscar cliente
    $stmt = $pdo->prepare("SELECT * FROM bitdefender_licenses WHERE id = ?");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        throw new Exception('Cliente não encontrado');
    }
    
    if (!$client['client_api_key']) {
        throw new Exception('Cliente não possui API Key configurada');
    }
    
    error_log("=== DEBUG: Criando relatório ===");
    error_log("Cliente ID: $clientId");
    error_log("Report Type: $reportType");
    error_log("API Key: " . substr($client['client_api_key'], 0, 15) . "...");
    
    // Preparar parâmetros
    $reportParams = [
        'reportingInterval' => $data['reporting_interval'] ?? 'thisWeek'
    ];
    
    if ($reportType == 12) {
        $reportParams['filterType'] = $data['filter_type'] ?? 0;
        if (isset($data['detailed_export']) && $data['detailed_export']) {
            $reportParams['detailedExport'] = [1];
        }
    }
    
    error_log("Report Params: " . json_encode($reportParams));
    
    // Inserir no banco
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_reports (
            client_id, user_id, report_name, report_type, report_type_name,
            status, generation_mode, reporting_interval, filter_type, 
            detailed_export, custom_params, generation_started_at
        ) VALUES (?, ?, ?, ?, 'Malware Status', 'pending', 'instant', ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $clientId,
        $user['id'],
        $reportName,
        $reportType,
        $reportParams['reportingInterval'] ?? 'thisMonth',
        $reportParams['filterType'] ?? 0,
        isset($reportParams['detailedExport']) ? 1 : 0,
        json_encode($reportParams)
    ]);
    
    $reportId = $pdo->lastInsertId();
    error_log("Relatório criado no banco: ID $reportId");
    
    // Atualizar status para generating
    $stmt = $pdo->prepare("UPDATE bitdefender_reports SET status = 'generating' WHERE id = ?");
    $stmt->execute([$reportId]);
    
    // Chamar API Bitdefender
    $accessUrl = rtrim($client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com', '/');
    
    // Normalizar URL
    if (!str_ends_with($accessUrl, '/jsonrpc')) {
        if (!str_ends_with($accessUrl, '/api')) {
            $accessUrl .= '/api';
        }
        $accessUrl .= '/v1.0/jsonrpc';
    }
    
    $url = $accessUrl . '/reports'; // CORRIGIDO!
    
    error_log("API URL: $url");
    
    $apiPayload = [
        'params' => [
            'type' => $reportType,
            'name' => $reportName,
            'options' => $reportParams
        ],
        'jsonrpc' => '2.0',
        'method' => 'createReport',
        'id' => uniqid('report_', true)
    ];
    
    error_log("API Payload: " . json_encode($apiPayload));
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiPayload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($client['client_api_key'] . ':')
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
        throw new Exception("Resposta JSON inválida: $response");
    }
    
    if (isset($decoded['error'])) {
        $errorMsg = $decoded['error']['message'] ?? 'Erro desconhecido';
        $errorCode = $decoded['error']['code'] ?? 'N/A';
        throw new Exception("API Error [$errorCode]: $errorMsg");
    }
    
    if (!isset($decoded['result'])) {
        throw new Exception('Resposta inválida da API: ' . json_encode($decoded));
    }
    
    $bitdefenderReportId = $decoded['result']['reportId'] ?? null;
    
    error_log("Bitdefender Report ID: $bitdefenderReportId");
    
    // Atualizar no banco
    $stmt = $pdo->prepare("
        UPDATE bitdefender_reports
        SET bitdefender_report_id = ?,
            status = 'ready',
            generation_completed_at = NOW(),
            generation_duration_seconds = TIMESTAMPDIFF(SECOND, generation_started_at, NOW())
        WHERE id = ?
    ");
    $stmt->execute([$bitdefenderReportId, $reportId]);
    
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
        'data' => $reportData,
        'debug' => [
            'report_id' => $reportId,
            'bitdefender_report_id' => $bitdefenderReportId,
            'api_url' => $url,
            'http_code' => $httpCode
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("ERRO: " . $e->getMessage());
    error_log("Stack: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
