<?php
/**
 * Cron Job - Sincronização Automática
 * 
 * Este script deve ser executado periodicamente via cron
 * Exemplo de configuração no crontab:
 * 0 */6 * * * /usr/bin/php /path/to/cron_auto_sync.php >> /var/log/dashlicencas_sync.log 2>&1
 * 
 * Executa a cada 6 horas
 */

// Permitir execução apenas via CLI ou com token secreto
if (php_sapi_name() !== 'cli') {
    $token = $_GET['token'] ?? '';
    $expectedToken = getenv('CRON_SECRET_TOKEN') ?: 'change_this_secret_token';
    
    if ($token !== $expectedToken) {
        http_response_code(403);
        die('Acesso negado');
    }
}

require_once __DIR__ . '/srv/config.php';

echo "[" . date('Y-m-d H:i:s') . "] Iniciando sincronização automática...\n";

$startTime = microtime(true);
$logId = createSyncLog($pdo, 'auto_sync', 'cron');

try {
    // 1. Sincronizar licenças Bitdefender
    echo "Sincronizando licenças Bitdefender...\n";
    $bitdefenderResult = syncBitdefenderLicenses($pdo);
    echo "  - Processados: {$bitdefenderResult['processed']}\n";
    echo "  - Atualizados: {$bitdefenderResult['updated']}\n";
    
    // 2. Sincronizar endpoints Bitdefender
    echo "Sincronizando endpoints Bitdefender...\n";
    $endpointsResult = syncBitdefenderEndpoints($pdo);
    echo "  - Clientes: {$endpointsResult['clients']}\n";
    echo "  - Endpoints: {$endpointsResult['endpoints']}\n";
    
    // 3. Verificar vencimentos e criar notificações
    echo "Verificando vencimentos...\n";
    $notificationsResult = checkExpirations($pdo);
    echo "  - Notificações criadas: {$notificationsResult['created']}\n";
    
    // 4. Verificar garantias de hardware
    echo "Verificando garantias de hardware...\n";
    $warrantiesResult = checkWarranties($pdo);
    echo "  - Notificações criadas: {$warrantiesResult['created']}\n";
    
    $executionTime = microtime(true) - $startTime;
    
    updateSyncLog($pdo, $logId, 'success', [
        'bitdefender' => $bitdefenderResult,
        'endpoints' => $endpointsResult,
        'notifications' => $notificationsResult,
        'warranties' => $warrantiesResult
    ], $executionTime);
    
    echo "[" . date('Y-m-d H:i:s') . "] Sincronização concluída com sucesso!\n";
    echo "Tempo de execução: " . round($executionTime, 2) . "s\n";
    
} catch (Exception $e) {
    $executionTime = microtime(true) - $startTime;
    updateSyncLog($pdo, $logId, 'failed', null, $executionTime, $e->getMessage());
    
    echo "[" . date('Y-m-d H:i:s') . "] ERRO: " . $e->getMessage() . "\n";
    
    // Notificar admins sobre falha
    notifyAdminsAboutSyncFailure($pdo, $e->getMessage());
}

/**
 * Sincronizar licenças Bitdefender
 */
function syncBitdefenderLicenses($pdo) {
    $stmt = $pdo->query("
        SELECT id, company, client_api_key, client_access_url 
        FROM bitdefender_licenses 
        WHERE client_api_key IS NOT NULL AND client_api_key != ''
    ");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $processed = 0;
    $updated = 0;
    
    foreach ($clients as $client) {
        try {
            $apiKey = $client['client_api_key'];
            $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';
            
            $licenseInfo = callBitdefenderAPI($accessUrl, $apiKey, 'getLicenseInfo');
            
            if ($licenseInfo && isset($licenseInfo['result'])) {
                $result = $licenseInfo['result'];
                
                $stmt = $pdo->prepare("
                    UPDATE bitdefender_licenses 
                    SET license_key = ?, 
                        total_licenses = ?, 
                        expiration_date = ?,
                        last_sync = NOW()
                    WHERE id = ?
                ");
                
                $expirationDate = isset($result['expirationDate']) 
                    ? date('Y-m-d', $result['expirationDate']) 
                    : null;
                
                $stmt->execute([
                    $result['licenseKey'] ?? null,
                    $result['seats'] ?? 0,
                    $expirationDate,
                    $client['id']
                ]);
                
                $updated++;
            }
            
            $processed++;
            
        } catch (Exception $e) {
            echo "  - Erro ao sincronizar {$client['company']}: {$e->getMessage()}\n";
        }
    }
    
    return ['processed' => $processed, 'updated' => $updated];
}

/**
 * Sincronizar endpoints Bitdefender
 */
function syncBitdefenderEndpoints($pdo) {
    $stmt = $pdo->query("
        SELECT id FROM bitdefender_licenses 
        WHERE client_api_key IS NOT NULL AND client_api_key != ''
    ");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totalEndpoints = 0;
    
    foreach ($clients as $client) {
        try {
            // Incluir função de sincronização de endpoints
            require_once __DIR__ . '/app_bitdefender_endpoints.php';
            $result = syncClientEndpoints($pdo, $client['id']);
            
            if (isset($result['processed'])) {
                $totalEndpoints += $result['processed'];
            }
        } catch (Exception $e) {
            echo "  - Erro ao sincronizar endpoints do cliente {$client['id']}: {$e->getMessage()}\n";
        }
    }
    
    return ['clients' => count($clients), 'endpoints' => $totalEndpoints];
}

/**
 * Verificar vencimentos e criar notificações
 */
function checkExpirations($pdo) {
    $created = 0;
    
    // Buscar configurações de notificação
    $daysToNotify = [30, 7, 1]; // Notificar 30, 7 e 1 dia antes
    
    foreach ($daysToNotify as $days) {
        // Bitdefender
        $stmt = $pdo->prepare("
            SELECT id, company, email, expiration_date,
                   DATEDIFF(expiration_date, CURDATE()) as days_remaining
            FROM bitdefender_licenses
            WHERE expiration_date IS NOT NULL
              AND DATEDIFF(expiration_date, CURDATE()) = ?
              AND renewal_status != 'Renovado'
        ");
        $stmt->execute([$days]);
        $licenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($licenses as $license) {
            createExpirationNotification($pdo, 'bitdefender', $license, $days);
            $created++;
        }
        
        // Fortigate
        $stmt = $pdo->prepare("
            SELECT id, client, email, vencimento,
                   DATEDIFF(vencimento, CURDATE()) as days_remaining
            FROM fortigate_devices
            WHERE vencimento IS NOT NULL
              AND DATEDIFF(vencimento, CURDATE()) = ?
              AND renewal_status != 'Renovado'
        ");
        $stmt->execute([$days]);
        $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($devices as $device) {
            createExpirationNotification($pdo, 'fortigate', $device, $days);
            $created++;
        }
    }
    
    return ['created' => $created];
}

/**
 * Verificar garantias de hardware
 */
function checkWarranties($pdo) {
    $created = 0;
    $daysToNotify = [30, 7];
    
    foreach ($daysToNotify as $days) {
        $stmt = $pdo->prepare("
            SELECT id, device_name, client_name, warranty_expiration,
                   DATEDIFF(warranty_expiration, CURDATE()) as days_remaining
            FROM hardware_devices
            WHERE warranty_expiration IS NOT NULL
              AND DATEDIFF(warranty_expiration, CURDATE()) = ?
              AND status = 'Ativo'
        ");
        $stmt->execute([$days]);
        $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($devices as $device) {
            createWarrantyNotification($pdo, $device, $days);
            $created++;
        }
    }
    
    return ['created' => $created];
}

/**
 * Criar notificação de vencimento
 */
function createExpirationNotification($pdo, $type, $item, $days) {
    $clientName = $type === 'bitdefender' ? $item['company'] : $item['client'];
    $date = $type === 'bitdefender' ? $item['expiration_date'] : $item['vencimento'];
    
    $title = $days === 1 
        ? "Licença vence amanhã: $clientName"
        : "Licença vence em $days dias: $clientName";
    
    $message = "A licença " . ucfirst($type) . " do cliente $clientName vence em $days dias ($date).";
    
    $priority = $days <= 7 ? 'high' : 'normal';
    
    // Notificar todos os admins
    $stmt = $pdo->query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($admins as $admin) {
        $stmt = $pdo->prepare("
            INSERT INTO notifications 
            (user_id, type, title, message, related_table, related_id, priority)
            VALUES (?, 'license_expiring', ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $admin['id'],
            $title,
            $message,
            $type === 'bitdefender' ? 'bitdefender_licenses' : 'fortigate_devices',
            $item['id'],
            $priority
        ]);
    }
}

/**
 * Criar notificação de garantia
 */
function createWarrantyNotification($pdo, $device, $days) {
    $title = $days === 1 
        ? "Garantia vence amanhã: {$device['device_name']}"
        : "Garantia vence em $days dias: {$device['device_name']}";
    
    $message = "A garantia do dispositivo {$device['device_name']} ({$device['client_name']}) vence em $days dias ({$device['warranty_expiration']}).";
    
    $priority = $days <= 7 ? 'high' : 'normal';
    
    $stmt = $pdo->query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($admins as $admin) {
        $stmt = $pdo->prepare("
            INSERT INTO notifications 
            (user_id, type, title, message, related_table, related_id, priority)
            VALUES (?, 'warranty_expiring', ?, ?, 'hardware_devices', ?, ?)
        ");
        $stmt->execute([$admin['id'], $title, $message, $device['id'], $priority]);
    }
}

/**
 * Notificar admins sobre falha na sincronização
 */
function notifyAdminsAboutSyncFailure($pdo, $errorMessage) {
    $stmt = $pdo->query("SELECT id FROM users WHERE role = 'admin' AND is_active = TRUE");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($admins as $admin) {
        $stmt = $pdo->prepare("
            INSERT INTO notifications 
            (user_id, type, title, message, priority)
            VALUES (?, 'sync_failed', 'Falha na sincronização automática', ?, 'critical')
        ");
        $stmt->execute([$admin['id'], "Erro: $errorMessage"]);
    }
}

/**
 * Criar log de sincronização
 */
function createSyncLog($pdo, $syncType, $triggeredBy) {
    $stmt = $pdo->prepare("
        INSERT INTO sync_logs (sync_type, status, triggered_by)
        VALUES (?, 'running', ?)
    ");
    $stmt->execute([$syncType, $triggeredBy]);
    return $pdo->lastInsertId();
}

/**
 * Atualizar log de sincronização
 */
function updateSyncLog($pdo, $logId, $status, $results, $executionTime, $errorMessage = null) {
    $recordsProcessed = 0;
    $recordsUpdated = 0;
    
    if ($results) {
        foreach ($results as $result) {
            if (isset($result['processed'])) $recordsProcessed += $result['processed'];
            if (isset($result['updated'])) $recordsUpdated += $result['updated'];
            if (isset($result['created'])) $recordsUpdated += $result['created'];
        }
    }
    
    $stmt = $pdo->prepare("
        UPDATE sync_logs 
        SET status = ?, 
            records_processed = ?,
            records_updated = ?,
            execution_time = ?,
            error_message = ?,
            completed_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([
        $status,
        $recordsProcessed,
        $recordsUpdated,
        $executionTime,
        $errorMessage,
        $logId
    ]);
}

/**
 * Chamar API Bitdefender
 */
function callBitdefenderAPI($accessUrl, $apiKey, $method, $params = []) {
    $url = rtrim($accessUrl, '/') . '/v1.0/jsonrpc/' . $method;
    
    $payload = json_encode([
        'params' => $params,
        'jsonrpc' => '2.0',
        'method' => $method,
        'id' => uniqid()
    ]);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Basic ' . base64_encode($apiKey . ':')
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        throw new Exception("Erro na API Bitdefender: HTTP $httpCode");
    }
    
    return json_decode($response, true);
}
