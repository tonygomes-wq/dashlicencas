<?php
// verify_files.php - Verificar se arquivos foram atualizados

header('Content-Type: application/json');

$files = [
    'srv/config.php',
    'srv/permissions.php',
    'app_bitdefender.php',
    'app_fortigate.php',
    'app_o365.php',
    'app_gmail.php',
    'app_users.php'
];

$results = [];

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        
        // Verificar se tem as correções
        $hasCorrection = false;
        $correctionType = '';
        
        if ($file === 'srv/config.php') {
            $hasCorrection = strpos($content, 'NÃO incluir permissions') !== false;
            $correctionType = 'Comentário sobre não incluir permissions.php';
        } elseif ($file === 'srv/permissions.php') {
            $hasCorrection = strpos($content, 'getCurrentUser()') !== false;
            $correctionType = 'Função getCurrentUser() com lazy loading';
        } else {
            // Verificar ordem: session_start() antes de require
            $sessionPos = strpos($content, 'session_start()');
            $requirePos = strpos($content, "require_once 'srv/config.php'");
            $hasCorrection = $sessionPos !== false && $requirePos !== false && $sessionPos < $requirePos;
            $correctionType = 'session_start() antes de require_once';
        }
        
        $results[$file] = [
            'exists' => true,
            'size' => filesize($file),
            'modified' => date('Y-m-d H:i:s', filemtime($file)),
            'has_correction' => $hasCorrection,
            'correction_type' => $correctionType,
            'first_50_chars' => substr($content, 0, 200)
        ];
    } else {
        $results[$file] = [
            'exists' => false
        ];
    }
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
