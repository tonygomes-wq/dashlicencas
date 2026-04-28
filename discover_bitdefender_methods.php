<?php
/**
 * Descobrir métodos disponíveis na API Bitdefender
 */

header('Content-Type: application/json');
require_once __DIR__ . '/srv/config.php';

$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 3;

try {
    $stmt = $pdo->prepare("
        SELECT id, company, client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE id = ?
    ");
    $stmt->execute([$clientId]);
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$client || !$client['client_api_key']) {
        throw new Exception("Cliente não encontrado ou sem API Key");
    }

    $apiKey = $client['client_api_key'];
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';

    echo json_encode([
        'client' => $client['company'],
        'testing_methods' => 'Testando métodos comuns da API Bitdefender...'
    ], JSON_PRETTY_PRINT) . "\n\n";

    // Lista de métodos comuns da API Bitdefender GravityZone
    $methods = [
        // Métodos de Endpoints/Devices
        'getEndpointsList',
        'getNetworkInventoryItems',
        'getManagedEndpointsList',
        'getEndpointsDetails',
        'getComputers',
        'getDevices',
        
        // Métodos de Licenças
        'getLicenseInfo',
        'getAccountLicenseInfo',
        
        // Métodos de Políticas
        'getPoliciesList',
        
        // Métodos de Relatórios
        'getReports',
        
        // Métodos de Pacotes
        'getPackagesList',
        
        // Métodos de Contas
        'getAccountsList',
        'getCompanyDetails',
    ];

    $results = [];

    foreach ($methods as $method) {
        $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/' . $method;
        
        $payload = json_encode([
            'params' => [
                'perPage' => 1,
                'page' => 1
            ],
            'jsonrpc' => '2.0',
            'method' => $method,
            'id' => '1'
        ]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Basic ' . base64_encode($apiKey . ':')
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($response, true);
        
        $status = 'unknown';
        $message = '';
        
        if ($httpCode === 200 && $decoded) {
            if (isset($decoded['result'])) {
                $status = '✅ DISPONÍVEL';
                $message = 'Método funciona!';
            } elseif (isset($decoded['error'])) {
                if ($decoded['error']['code'] === -32601) {
                    $status = '❌ NÃO DISPONÍVEL';
                    $message = 'Method not found';
                } else {
                    $status = '⚠️ ERRO';
                    $message = $decoded['error']['message'];
                }
            }
        } else {
            $status = '❌ FALHA HTTP';
            $message = "HTTP $httpCode";
        }

        $results[] = [
            'method' => $method,
            'status' => $status,
            'message' => $message
        ];

        // Pequeno delay para não sobrecarregar a API
        usleep(200000); // 0.2 segundos
    }

    echo json_encode([
        'summary' => 'Métodos testados: ' . count($methods),
        'results' => $results
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
