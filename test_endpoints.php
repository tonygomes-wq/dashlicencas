<?php
// test_endpoints.php - Testar todos os endpoints

session_start();

header('Content-Type: application/json');

$endpoints = [
    'app_bitdefender.php',
    'app_fortigate.php',
    'app_o365.php',
    'app_gmail.php'
];

$results = [];

foreach ($endpoints as $endpoint) {
    $url = 'http://' . $_SERVER['HTTP_HOST'] . '/' . $endpoint;
    
    // Iniciar cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_COOKIE, session_name() . '=' . session_id());
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Cookie: ' . session_name() . '=' . session_id()
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $results[$endpoint] = [
        'http_code' => $httpCode,
        'error' => $error ?: null,
        'response_preview' => substr($response, 0, 500),
        'is_json' => json_decode($response) !== null,
        'response_length' => strlen($response)
    ];
}

// Verificar sessão
$results['session_info'] = [
    'session_id' => session_id(),
    'user_id' => $_SESSION['user_id'] ?? null,
    'session_data' => $_SESSION
];

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
