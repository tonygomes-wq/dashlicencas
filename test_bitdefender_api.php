<?php
// test_bitdefender_api.php - Testar API do Bitdefender

session_start();
header('Content-Type: application/json');
require_once 'srv/config.php';

// Simular sessão de admin se não estiver logado
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1; // Admin
    $_SESSION['user_email'] = 'suporte@macip.com.br';
}

try {
    // Buscar todos os registros
    $stmt = $pdo->query("
        SELECT id, company, contactPerson as contact_person, email, 
               licenseKey as license_key, totalLicenses as total_licenses, 
               expirationDate as expiration_date, renewalStatus as renewal_status
        FROM bitdefender_licenses
        ORDER BY company
    ");
    
    $licenses = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'count' => count($licenses),
        'data' => $licenses
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
