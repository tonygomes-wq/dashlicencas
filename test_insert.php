<?php
// test_insert.php - Testar inserção direta no banco

session_start();

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

// Simular usuário logado
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1;
}

try {
    // Inserir registro de teste
    $sql = "INSERT INTO bitdefender_licenses 
            (user_id, company, contact_person, email, expiration_date, total_licenses, license_key, renewal_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $_SESSION['user_id'],
        'TESTE EMPRESA ' . date('His'),
        'Contato Teste',
        'teste@teste.com',
        '2026-12-31',
        10,
        'TEST-KEY-123',
        'Ativo'
    ]);
    
    $new_id = $pdo->lastInsertId();
    
    // Buscar o registro inserido
    $stmt = $pdo->prepare('SELECT * FROM bitdefender_licenses WHERE id = ?');
    $stmt->execute([$new_id]);
    $inserted = $stmt->fetch();
    
    // Contar total de registros
    $total = $pdo->query('SELECT COUNT(*) FROM bitdefender_licenses')->fetchColumn();
    
    echo json_encode([
        'success' => true,
        'message' => 'Registro inserido com sucesso!',
        'new_id' => $new_id,
        'inserted_data' => $inserted,
        'total_records' => $total
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
