<?php
/**
 * Verificar estrutura da tabela bitdefender_endpoints
 */

require_once 'srv/config.php';

try {
    // Verificar se tabela existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'bitdefender_endpoints'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo "❌ Tabela bitdefender_endpoints NÃO existe\n";
        echo "Criando tabela...\n";
        
        $createTable = "
        CREATE TABLE bitdefender_endpoints (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            endpoint_id VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45),
            mac_address VARCHAR(17),
            operating_system VARCHAR(255),
            agent_version VARCHAR(50),
            protection_status ENUM('protected', 'at_risk', 'offline', 'unknown') DEFAULT 'unknown',
            last_seen DATETIME,
            hardware_id INT NULL,
            is_managed BOOLEAN DEFAULT FALSE,
            last_sync DATETIME,
            sync_status ENUM('synced', 'pending', 'error') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES bitdefender_licenses(id) ON DELETE CASCADE,
            FOREIGN KEY (hardware_id) REFERENCES hardware_devices(id) ON DELETE SET NULL,
            INDEX idx_client_id (client_id),
            INDEX idx_protection_status (protection_status),
            INDEX idx_last_seen (last_seen)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $pdo->exec($createTable);
        echo "✅ Tabela bitdefender_endpoints criada com sucesso!\n";
    } else {
        echo "✅ Tabela bitdefender_endpoints existe\n";
    }
    
    // Mostrar estrutura
    echo "\n📋 Estrutura da tabela:\n";
    $stmt = $pdo->query('DESCRIBE bitdefender_endpoints');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']} ({$row['Type']}) {$row['Null']} {$row['Key']}\n";
    }
    
    // Contar registros
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM bitdefender_endpoints');
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "\n📊 Total de registros: {$count['total']}\n";
    
    // Verificar clientes com API configurada
    $stmt = $pdo->query("
        SELECT id, company, 
               CASE WHEN client_api_key IS NOT NULL AND client_api_key != '' THEN 'SIM' ELSE 'NÃO' END as api_configurada
        FROM bitdefender_licenses 
        ORDER BY company
    ");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n👥 Clientes Bitdefender:\n";
    foreach ($clients as $client) {
        echo "- {$client['company']} (ID: {$client['id']}) - API: {$client['api_configurada']}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}
?>