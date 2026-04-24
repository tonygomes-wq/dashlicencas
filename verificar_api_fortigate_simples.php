<?php
// Script simples para verificar API FortiGate
session_start();

if (!isset($_SESSION['user_id'])) {
    die('❌ Não autenticado');
}

require_once 'srv/config.php';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Verificação API FortiGate</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .btn { background: #007cba; color: white; padding: 10px 15px; border: none; cursor: pointer; margin: 5px; }
        .btn-danger { background: #dc3545; }
        .btn-success { background: #28a745; }
    </style>
</head>
<body>

<h1>🔍 Verificação API FortiGate</h1>

<?php
try {
    // 1. Verificar tabelas
    echo "<h2>📋 Verificando Tabelas</h2>";
    
    $tables = [
        'fortigate_api_config' => 'Configurações de API',
        'fortigate_devices_extended' => 'Dados estendidos dos dispositivos',
        'fortigate_sync_history' => 'Histórico de sincronizações',
        'fortigate_alerts' => 'Alertas do sistema'
    ];
    
    $allTablesExist = true;
    
    echo "<table>";
    echo "<tr><th>Tabela</th><th>Descrição</th><th>Status</th></tr>";
    
    foreach ($tables as $tableName => $description) {
        $stmt = $pdo->query("SHOW TABLES LIKE '{$tableName}'");
        $exists = $stmt->rowCount() > 0;
        
        if (!$exists) $allTablesExist = false;
        
        echo "<tr>";
        echo "<td><code>{$tableName}</code></td>";
        echo "<td>{$description}</td>";
        echo "<td class='" . ($exists ? 'success' : 'error') . "'>";
        echo $exists ? "✅ EXISTE" : "❌ NÃO EXISTE";
        echo "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // 2. Se tabelas não existem, mostrar botão para criar
    if (!$allTablesExist) {
        echo "<div class='warning'>";
        echo "<h3>⚠️ Algumas tabelas estão faltando!</h3>";
        echo "<p>As tabelas da API FortiGate precisam ser criadas.</p>";
        
        if (isset($_POST['create_tables'])) {
            echo "<h4>🔧 Criando tabelas...</h4>";
            
            // SQL para criar tabelas
            $sql = "
            CREATE TABLE IF NOT EXISTS fortigate_api_config (
                device_id INT PRIMARY KEY,
                api_enabled BOOLEAN DEFAULT TRUE,
                api_ip VARCHAR(255) NOT NULL,
                api_port INT DEFAULT 443,
                api_token_encrypted TEXT NOT NULL,
                verify_ssl BOOLEAN DEFAULT TRUE,
                sync_interval_minutes INT DEFAULT 60,
                last_sync_at TIMESTAMP NULL,
                last_sync_status VARCHAR(50) NULL,
                last_sync_error TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS fortigate_devices_extended (
                device_id INT PRIMARY KEY,
                hostname VARCHAR(255),
                fortios_version VARCHAR(100),
                build_number VARCHAR(100),
                uptime_seconds BIGINT,
                cpu_usage DECIMAL(5,2),
                memory_usage DECIMAL(5,2),
                disk_usage DECIMAL(5,2),
                session_count INT,
                license_status VARCHAR(50),
                forticare_status VARCHAR(50),
                forticare_expiration DATETIME,
                antivirus_status VARCHAR(50),
                antivirus_expiration DATETIME,
                ips_status VARCHAR(50),
                ips_expiration DATETIME,
                web_filtering_status VARCHAR(50),
                web_filtering_expiration DATETIME,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS fortigate_sync_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                device_id INT NOT NULL,
                sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sync_completed_at TIMESTAMP NULL,
                status ENUM('in_progress', 'success', 'failed') DEFAULT 'in_progress',
                changes_detected JSON,
                data_synced JSON,
                duration_seconds DECIMAL(10,3),
                error_message TEXT,
                FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE,
                INDEX idx_device_date (device_id, sync_started_at)
            );

            CREATE TABLE IF NOT EXISTS fortigate_alerts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                device_id INT NOT NULL,
                alert_type VARCHAR(100) NOT NULL,
                severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
                title VARCHAR(255) NOT NULL,
                message TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                is_resolved BOOLEAN DEFAULT FALSE,
                resolved_at TIMESTAMP NULL,
                resolved_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (device_id) REFERENCES fortigate_devices(id) ON DELETE CASCADE,
                FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_device_status (device_id, is_resolved),
                INDEX idx_severity_date (severity, created_at)
            );
            ";
            
            try {
                $pdo->exec($sql);
                echo "<p class='success'>✅ Tabelas criadas com sucesso!</p>";
                echo "<p><a href='verificar_api_fortigate_simples.php'>🔄 Recarregar página</a></p>";
            } catch (Exception $e) {
                echo "<p class='error'>❌ Erro ao criar tabelas: " . $e->getMessage() . "</p>";
            }
        } else {
            echo "<form method='post'>";
            echo "<button type='submit' name='create_tables' value='1' class='btn btn-danger'>🔧 CRIAR TABELAS AUTOMATICAMENTE</button>";
            echo "</form>";
        }
        echo "</div>";
    } else {
        echo "<p class='success'>✅ Todas as tabelas necessárias existem!</p>";
        
        // 3. Verificar configurações existentes
        echo "<h2>⚙️ Configurações de API</h2>";
        
        $stmt = $pdo->query("
            SELECT d.id, d.client, d.serial, d.api_token, d.api_ip,
                   c.api_enabled, c.last_sync_at, c.last_sync_status
            FROM fortigate_devices d
            LEFT JOIN fortigate_api_config c ON d.id = c.device_id
            WHERE d.api_token IS NOT NULL AND d.api_ip IS NOT NULL
        ");
        
        $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($devices)) {
            echo "<p class='warning'>⚠️ Nenhum dispositivo com API configurada encontrado.</p>";
            echo "<p>Configure a API através do modal de detalhes do dispositivo.</p>";
        } else {
            echo "<table>";
            echo "<tr><th>ID</th><th>Cliente</th><th>Serial</th><th>API IP</th><th>API Configurada</th><th>Última Sync</th><th>Status</th><th>Ação</th></tr>";
            
            foreach ($devices as $device) {
                echo "<tr>";
                echo "<td>{$device['id']}</td>";
                echo "<td>{$device['client']}</td>";
                echo "<td>{$device['serial']}</td>";
                echo "<td>{$device['api_ip']}</td>";
                echo "<td>" . ($device['api_enabled'] ? '✅ SIM' : '❌ NÃO') . "</td>";
                echo "<td>" . ($device['last_sync_at'] ?: 'Nunca') . "</td>";
                echo "<td>" . ($device['last_sync_status'] ?: 'Não testado') . "</td>";
                echo "<td>";
                
                if ($device['api_enabled']) {
                    echo "<form method='post' style='display: inline;'>";
                    echo "<input type='hidden' name='test_device' value='{$device['id']}'>";
                    echo "<button type='submit' class='btn btn-success'>🧪 TESTAR</button>";
                    echo "</form>";
                } else {
                    echo "<span class='warning'>Configurar API</span>";
                }
                
                echo "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
        
        // 4. Testar sincronização
        if (isset($_POST['test_device'])) {
            $deviceId = (int)$_POST['test_device'];
            echo "<h3>🧪 Testando Dispositivo ID: {$deviceId}</h3>";
            
            // Fazer requisição para a API de sincronização
            $url = 'https://dashlicencas.macip.com.br/app_fortigate_api.php?action=sync_device';
            $data = json_encode(['device_id' => $deviceId]);
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Cookie: ' . ($_SERVER['HTTP_COOKIE'] ?? '')
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            echo "<div style='background: #f5f5f5; padding: 15px; border-radius: 5px;'>";
            echo "<h4>Resultado do Teste:</h4>";
            echo "<p><strong>HTTP Code:</strong> {$httpCode}</p>";
            
            if ($error) {
                echo "<p class='error'><strong>Erro cURL:</strong> {$error}</p>";
            }
            
            if ($response) {
                $result = json_decode($response, true);
                if ($result) {
                    if (isset($result['success']) && $result['success']) {
                        echo "<p class='success'>✅ <strong>Sucesso!</strong> {$result['message']}</p>";
                        if (isset($result['duration'])) {
                            echo "<p>⏱️ Duração: {$result['duration']} segundos</p>";
                        }
                    } else {
                        echo "<p class='error'>❌ <strong>Erro:</strong> " . ($result['message'] ?? 'Erro desconhecido') . "</p>";
                    }
                } else {
                    echo "<p class='error'>❌ Resposta inválida (não é JSON válido)</p>";
                }
                
                echo "<details>";
                echo "<summary>Ver resposta completa</summary>";
                echo "<pre>" . htmlspecialchars($response) . "</pre>";
                echo "</details>";
            } else {
                echo "<p class='error'>❌ Nenhuma resposta recebida</p>";
            }
            echo "</div>";
        }
    }
    
} catch (Exception $e) {
    echo "<h2 class='error'>❌ ERRO</h2>";
    echo "<p class='error'>" . $e->getMessage() . "</p>";
}
?>

<hr>
<p><a href="https://dashlicencas.macip.com.br">← Voltar ao Dashboard</a></p>

</body>
</html>