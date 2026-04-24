<?php
// debug_bitdefender.php - Debug completo do erro
error_reporting(E_ALL);
ini_set('display_errors', '1');

session_start();

require_once 'srv/config.php';
require_once 'srv/permissions.php';

header('Content-Type: application/json; charset=UTF-8');

$debug = [
    'step' => 'start',
    'session_exists' => isset($_SESSION['user_id']),
    'user_id' => $_SESSION['user_id'] ?? null,
    'method' => $_SERVER['REQUEST_METHOD'],
    'has_permission_function' => function_exists('hasPermission'),
];

try {
    // Check authentication
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            'error' => 'Not authenticated',
            'debug' => $debug
        ]);
        exit;
    }
    
    $debug['step'] = 'authenticated';
    $debug['user_id'] = $_SESSION['user_id'];
    
    // Check permission
    $hasPermission = hasPermission('bitdefender', 'edit');
    $debug['has_permission'] = $hasPermission;
    $debug['step'] = 'permission_checked';
    
    if (!$hasPermission) {
        echo json_encode([
            'error' => 'No permission',
            'debug' => $debug
        ]);
        exit;
    }
    
    // Get input data
    $rawInput = file_get_contents('php://input');
    $debug['raw_input'] = $rawInput;
    $debug['step'] = 'input_read';
    
    $data = json_decode($rawInput, true);
    $debug['parsed_data'] = $data;
    $debug['json_error'] = json_last_error_msg();
    $debug['step'] = 'data_parsed';
    
    if (!$data) {
        echo json_encode([
            'error' => 'Invalid JSON',
            'debug' => $debug
        ]);
        exit;
    }
    
    // Check notes column
    $checkColumn = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'notes'");
    $hasNotesColumn = $checkColumn->rowCount() > 0;
    $debug['has_notes_column'] = $hasNotesColumn;
    $debug['step'] = 'column_checked';
    
    // Prepare SQL
    if ($hasNotesColumn) {
        $sql = "INSERT INTO bitdefender_licenses (user_id, company, contact_person, email, expiration_date, total_licenses, license_key, renewal_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $params = [
            $_SESSION['user_id'],
            $data['company'] ?? null,
            $data['contact_person'] ?? null,
            $data['email'] ?? null,
            $data['expiration_date'] ?? null,
            $data['total_licenses'] ?? 0,
            $data['license_key'] ?? null,
            $data['renewal_status'] ?? 'Pendente',
            $data['notes'] ?? null
        ];
    } else {
        $sql = "INSERT INTO bitdefender_licenses (user_id, company, contact_person, email, expiration_date, total_licenses, license_key, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $params = [
            $_SESSION['user_id'],
            $data['company'] ?? null,
            $data['contact_person'] ?? null,
            $data['email'] ?? null,
            $data['expiration_date'] ?? null,
            $data['total_licenses'] ?? 0,
            $data['license_key'] ?? null,
            $data['renewal_status'] ?? 'Pendente'
        ];
    }
    
    $debug['sql'] = $sql;
    $debug['params'] = $params;
    $debug['step'] = 'sql_prepared';
    
    // Execute
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    $debug['execute_result'] = $result;
    $debug['step'] = 'executed';
    
    $new_id = $pdo->lastInsertId();
    $debug['new_id'] = $new_id;
    
    // Get inserted record
    $stmt = $pdo->prepare('SELECT * FROM bitdefender_licenses WHERE id = ?');
    $stmt->execute([$new_id]);
    $record = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'record' => $record,
        'debug' => $debug
    ]);
    
} catch (PDOException $e) {
    $debug['step'] = 'pdo_exception';
    $debug['error_message'] = $e->getMessage();
    $debug['error_code'] = $e->getCode();
    $debug['error_file'] = $e->getFile();
    $debug['error_line'] = $e->getLine();
    
    echo json_encode([
        'error' => 'Database Error',
        'message' => $e->getMessage(),
        'debug' => $debug
    ]);
} catch (Exception $e) {
    $debug['step'] = 'general_exception';
    $debug['error_message'] = $e->getMessage();
    $debug['error_code'] = $e->getCode();
    $debug['error_file'] = $e->getFile();
    $debug['error_line'] = $e->getLine();
    
    echo json_encode([
        'error' => 'General Error',
        'message' => $e->getMessage(),
        'debug' => $debug
    ]);
}
