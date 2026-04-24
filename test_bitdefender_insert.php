<?php
// test_bitdefender_insert.php - Teste de inserção Bitdefender
error_reporting(E_ALL);
ini_set('display_errors', '1');

session_start();

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // Simular dados de teste
    $testData = [
        'company' => 'Teste Empresa',
        'contact_person' => 'João Silva',
        'email' => 'teste@exemplo.com',
        'expiration_date' => '2026-12-31',
        'total_licenses' => 10,
        'license_key' => 'TEST-KEY-123',
        'renewal_status' => 'Pendente',
        'notes' => 'Teste de observações'
    ];
    
    // Verificar se a coluna notes existe
    $checkColumn = $pdo->query("SHOW COLUMNS FROM bitdefender_licenses LIKE 'notes'");
    $hasNotesColumn = $checkColumn->rowCount() > 0;
    
    echo json_encode([
        'status' => 'checking',
        'has_notes_column' => $hasNotesColumn,
        'test_data' => $testData
    ]);
    
    // Tentar inserir
    if ($hasNotesColumn) {
        $sql = "INSERT INTO bitdefender_licenses (user_id, company, contact_person, email, expiration_date, total_licenses, license_key, renewal_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([
            1, // user_id de teste
            $testData['company'],
            $testData['contact_person'],
            $testData['email'],
            $testData['expiration_date'],
            $testData['total_licenses'],
            $testData['license_key'],
            $testData['renewal_status'],
            $testData['notes']
        ]);
        
        $new_id = $pdo->lastInsertId();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Inserção com notes realizada com sucesso',
            'new_id' => $new_id,
            'has_notes_column' => true
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Coluna notes não existe',
            'has_notes_column' => false
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Database Error',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'General Error',
        'message' => $e->getMessage()
    ]);
}
