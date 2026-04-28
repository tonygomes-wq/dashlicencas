<?php
/**
 * Script para verificar se os arquivos necessários existem no servidor
 */

header('Content-Type: application/json');

$arquivos = [
    'app_bitdefender.php',
    'app_bitdefender_endpoints.php',
    'app_bitdefender_license_usage.php',
    'app_bitdefender_sync_client.php',
];

$resultado = [
    'servidor' => $_SERVER['HTTP_HOST'],
    'diretorio' => __DIR__,
    'arquivos' => []
];

foreach ($arquivos as $arquivo) {
    $caminho = __DIR__ . '/' . $arquivo;
    $existe = file_exists($caminho);
    
    $resultado['arquivos'][$arquivo] = [
        'existe' => $existe,
        'caminho' => $caminho,
        'legivel' => $existe ? is_readable($caminho) : false,
        'tamanho' => $existe ? filesize($caminho) : 0,
        'modificado' => $existe ? date('Y-m-d H:i:s', filemtime($caminho)) : null
    ];
}

echo json_encode($resultado, JSON_PRETTY_PRINT);
?>
