<?php
/**
 * FortigateSync - Classe para sincronização de dados do FortiGate
 * 
 * Gerencia a sincronização de dados entre dispositivos FortiGate e o banco de dados
 */

require_once __DIR__ . '/FortigateAPI.php';
require_once __DIR__ . '/Database.php';

class FortigateSync {
    private $db;
    private $encryptionKey;

    public function __construct($db) {
        $this->db = $db;
        // Chave de criptografia deve vir de variável de ambiente
        $this->encryptionKey = getenv('ENCRYPTION_KEY') ?: 'default_key_change_in_production';
    }

    /**
     * Criptografa um token
     */
    private function encryptToken($token) {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($token, 'aes-256-cbc', $this->encryptionKey, 0, $iv);
        return base64_encode($encrypted . '::' . $iv);
    }

    /**
     * Descriptografa um token
     */
    private function decryptToken($encryptedToken) {
        list($encrypted, $iv) = explode('::', base64_decode($encryptedToken), 2);
        return openssl_decrypt($encrypted, 'aes-256-cbc', $this->encryptionKey, 0, $iv);
    }

    /**
     * Salva ou atualiza configuração de API para um dispositivo
     */
    public function saveAPIConfig($deviceId, $apiIp, $apiToken, $apiPort = 443, $verifySsl = true, $syncInterval = 60) {
        $encryptedToken = $this->encryptToken($apiToken);
        
        $stmt = $this->db->prepare("
            INSERT INTO fortigate_api_config 
            (device_id, api_enabled, api_ip, api_port, api_token_encrypted, verify_ssl, sync_interval_minutes)
            VALUES (?, TRUE, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            api_enabled = TRUE,
            api_ip = VALUES(api_ip),
            api_port = VALUES(api_port),
            api_token_encrypted = VALUES(api_token_encrypted),
            verify_ssl = VALUES(verify_ssl),
            sync_interval_minutes = VALUES(sync_interval_minutes),
            updated_at = CURRENT_TIMESTAMP
        ");
        
        return $stmt->execute([$deviceId, $apiIp, $apiPort, $encryptedToken, $verifySsl, $syncInterval]);
    }

    /**
     * Busca configuração de API de um dispositivo
     */
    public function getAPIConfig($deviceId) {
        $stmt = $this->db->prepare("
            SELECT * FROM fortigate_api_config WHERE device_id = ?
        ");
        $stmt->execute([$deviceId]);
        $config = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($config && $config['api_token_encrypted']) {
            $config['api_token'] = $this->decryptToken($config['api_token_encrypted']);
        }
        
        return $config;
    }

    /**
     * Testa conexão com um dispositivo
     */
    public function testConnection($deviceId) {
        $config = $this->getAPIConfig($deviceId);
        
        if (!$config || !$config['api_enabled']) {
            return ['success' => false, 'message' => 'API não configurada para este dispositivo'];
        }

        $api = new FortigateAPI(
            $config['api_ip'],
            $config['api_token'],
            $config['api_port'],
            $config['verify_ssl']
        );

        return $api->testConnection();
    }

    /**
     * Sincroniza dados de um dispositivo
     */
    public function syncDevice($deviceId) {
        $startTime = microtime(true);
        $syncId = $this->createSyncHistory($deviceId);
        
        try {
            $config = $this->getAPIConfig($deviceId);
            
            if (!$config || !$config['api_enabled']) {
                throw new Exception('API não configurada ou desabilitada');
            }

            $api = new FortigateAPI(
                $config['api_ip'],
                $config['api_token'],
                $config['api_port'],
                $config['verify_ssl']
            );

            // Buscar todos os dados
            $allData = $api->getAllDeviceInfo();
            
            // Processar e salvar dados
            $changes = $this->processAndSaveData($deviceId, $allData);
            
            // Atualizar histórico de sincronização
            $duration = microtime(true) - $startTime;
            $this->completeSyncHistory($syncId, 'success', $changes, $allData, $duration);
            
            // Atualizar status na configuração
            $this->updateSyncStatus($deviceId, 'success', null);
            
            // Gerar alertas se necessário
            $this->generateAlerts($deviceId, $allData);
            
            return [
                'success' => true,
                'message' => 'Sincronização concluída com sucesso',
                'changes' => $changes,
                'duration' => round($duration, 2)
            ];
            
        } catch (Exception $e) {
            $duration = microtime(true) - $startTime;
            $this->completeSyncHistory($syncId, 'failed', null, null, $duration, $e->getMessage());
            $this->updateSyncStatus($deviceId, 'failed', $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'duration' => round($duration, 2)
            ];
        }
    }

    /**
     * Processa e salva dados no banco
     */
    private function processAndSaveData($deviceId, $data) {
        $changes = [];
        
        // Extrair dados do sistema
        $systemStatus = $data['system_status'] ?? [];
        $licenseStatus = $data['license_status'] ?? [];
        $resources = $data['system_resources'] ?? [];
        $sessions = $data['session_stats'] ?? [];
        
        // Preparar dados para salvar
        $extendedData = [
            'device_id' => $deviceId,
            'hostname' => $systemStatus['hostname'] ?? null,
            'fortios_version' => $systemStatus['version'] ?? null,
            'build_number' => $systemStatus['build'] ?? null,
            'uptime_seconds' => $systemStatus['uptime'] ?? null,
            'cpu_usage' => $resources['cpu'] ?? null,
            'memory_usage' => $resources['mem'] ?? null,
            'disk_usage' => $resources['disk'] ?? null,
            'session_count' => $sessions['session_count'] ?? null,
            'license_status' => $systemStatus['license_status'] ?? null
        ];
        
        // Processar licenças
        if (isset($licenseStatus['forticare'])) {
            $extendedData['forticare_status'] = $licenseStatus['forticare']['status'] ?? null;
            $extendedData['forticare_expiration'] = FortigateAPI::epochToDateTime($licenseStatus['forticare']['expiration'] ?? 0);
        }
        
        if (isset($licenseStatus['antivirus'])) {
            $extendedData['antivirus_status'] = $licenseStatus['antivirus']['status'] ?? null;
            $extendedData['antivirus_expiration'] = FortigateAPI::epochToDateTime($licenseStatus['antivirus']['expiration'] ?? 0);
        }
        
        if (isset($licenseStatus['ips'])) {
            $extendedData['ips_status'] = $licenseStatus['ips']['status'] ?? null;
            $extendedData['ips_expiration'] = FortigateAPI::epochToDateTime($licenseStatus['ips']['expiration'] ?? 0);
        }
        
        if (isset($licenseStatus['webfilter'])) {
            $extendedData['web_filtering_status'] = $licenseStatus['webfilter']['status'] ?? null;
            $extendedData['web_filtering_expiration'] = FortigateAPI::epochToDateTime($licenseStatus['webfilter']['expiration'] ?? 0);
        }
        
        // Verificar mudanças
        $existing = $this->getExtendedData($deviceId);
        if ($existing) {
            foreach ($extendedData as $key => $value) {
                if ($key !== 'device_id' && isset($existing[$key]) && $existing[$key] != $value) {
                    $changes[$key] = ['old' => $existing[$key], 'new' => $value];
                }
            }
        }
        
        // Salvar dados estendidos
        $this->saveExtendedData($extendedData);
        
        // Atualizar tabela principal de dispositivos se necessário
        if (isset($extendedData['fortios_version']) || isset($extendedData['hostname'])) {
            $this->updateMainDeviceTable($deviceId, $extendedData);
        }
        
        return $changes;
    }

    /**
     * Salva dados estendidos
     */
    private function saveExtendedData($data) {
        $fields = array_keys($data);
        $placeholders = array_fill(0, count($fields), '?');
        $updateFields = array_map(function($field) {
            return "{$field} = VALUES({$field})";
        }, array_filter($fields, function($f) { return $f !== 'device_id'; }));
        
        $sql = "INSERT INTO fortigate_devices_extended (" . implode(', ', $fields) . ")
                VALUES (" . implode(', ', $placeholders) . ")
                ON DUPLICATE KEY UPDATE " . implode(', ', $updateFields);
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute(array_values($data));
    }

    /**
     * Busca dados estendidos
     */
    private function getExtendedData($deviceId) {
        $stmt = $this->db->prepare("SELECT * FROM fortigate_devices_extended WHERE device_id = ?");
        $stmt->execute([$deviceId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Atualiza tabela principal de dispositivos
     */
    private function updateMainDeviceTable($deviceId, $data) {
        // Atualizar campos relevantes na tabela fortigate_devices
        // Isso pode incluir hostname, versão, etc.
        // Implementar conforme necessário
    }

    /**
     * Cria registro de histórico de sincronização
     */
    private function createSyncHistory($deviceId) {
        $stmt = $this->db->prepare("
            INSERT INTO fortigate_sync_history (device_id, sync_started_at, status)
            VALUES (?, NOW(), 'in_progress')
        ");
        $stmt->execute([$deviceId]);
        return $this->db->lastInsertId();
    }

    /**
     * Completa registro de histórico
     */
    private function completeSyncHistory($syncId, $status, $changes, $data, $duration, $error = null) {
        $stmt = $this->db->prepare("
            UPDATE fortigate_sync_history
            SET sync_completed_at = NOW(),
                status = ?,
                changes_detected = ?,
                data_synced = ?,
                duration_seconds = ?,
                error_message = ?
            WHERE id = ?
        ");
        
        return $stmt->execute([
            $status,
            json_encode($changes),
            json_encode($data),
            $duration,
            $error,
            $syncId
        ]);
    }

    /**
     * Atualiza status de sincronização na configuração
     */
    private function updateSyncStatus($deviceId, $status, $error) {
        $stmt = $this->db->prepare("
            UPDATE fortigate_api_config
            SET last_sync_at = NOW(),
                last_sync_status = ?,
                last_sync_error = ?
            WHERE device_id = ?
        ");
        
        return $stmt->execute([$status, $error, $deviceId]);
    }

    /**
     * Gera alertas baseado nos dados sincronizados
     */
    private function generateAlerts($deviceId, $data) {
        $licenseStatus = $data['license_status'] ?? [];
        $today = time();
        
        // Verificar licenças expirando
        foreach ($licenseStatus as $licenseType => $license) {
            if (isset($license['expiration'])) {
                $expiration = $license['expiration'];
                $daysUntilExpiry = ($expiration - $today) / 86400;
                
                if ($daysUntilExpiry < 0) {
                    $this->createAlert($deviceId, 'license_expired', 'critical',
                        "Licença {$licenseType} expirada",
                        "A licença {$licenseType} expirou em " . date('d/m/Y', $expiration));
                } elseif ($daysUntilExpiry <= 30) {
                    $this->createAlert($deviceId, 'license_expiring', 'warning',
                        "Licença {$licenseType} expirando",
                        "A licença {$licenseType} expira em " . ceil($daysUntilExpiry) . " dias");
                }
            }
        }
    }

    /**
     * Cria um alerta
     */
    private function createAlert($deviceId, $type, $severity, $title, $message) {
        // Verificar se alerta similar já existe e não foi resolvido
        $stmt = $this->db->prepare("
            SELECT id FROM fortigate_alerts
            WHERE device_id = ? AND alert_type = ? AND is_resolved = FALSE
            LIMIT 1
        ");
        $stmt->execute([$deviceId, $type]);
        
        if ($stmt->fetch()) {
            return; // Alerta já existe
        }
        
        // Criar novo alerta
        $stmt = $this->db->prepare("
            INSERT INTO fortigate_alerts (device_id, alert_type, severity, title, message)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        return $stmt->execute([$deviceId, $type, $severity, $title, $message]);
    }

    /**
     * Sincroniza todos os dispositivos com API habilitada
     */
    public function syncAllDevices() {
        $stmt = $this->db->query("
            SELECT device_id FROM fortigate_api_config
            WHERE api_enabled = TRUE
        ");
        
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[$row['device_id']] = $this->syncDevice($row['device_id']);
        }
        
        return $results;
    }
}
