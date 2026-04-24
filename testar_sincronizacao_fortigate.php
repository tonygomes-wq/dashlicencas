<?php
// Script para testar a sincronização FortiGate
session_start();

// Verificar se está logado
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Não autenticado']);
    exit;
}

require_once 'srv/config.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    // 1. Verificar se as tabelas existem
    echo "<h2>🔍 VERIFICANDO ESTRUTURA DO BANCO</h2>";
    
    $tables = ['fortigate_api_config', 'fortigate_devices_extended', 'fortigate_sync_history', 'fortigate_alerts'];
    $tablesStatus = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '{$table}'");
        $exists = $stmt->fetch() !== false;
        $tablesStatus[$table] = $exists;
        
        echo "<p>Tabela <strong>{$table}</strong>: " . ($exists ? "✅ EXISTE" : "❌ NÃO EXISTE") . "</p>";
    }
    
    // 2. Verificar se há dispositivos com API configurada
    echo "<h2>📋 VERIFICANDO CONFIGURAÇÕES DE API</h2>";
    
    if ($tablesStatus['fortigate_api_config']) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM fortigate_api_config WHERE api_enabled = TRUE");
        $apiCount = $stmt->fetch()['total'];
        echo "<p>Dispositivos com API habilitada: <strong>{$apiCount}</strong></p>";
        
        if ($apiCount > 0) {
            $stmt = $pdo->query("
                SELECT d.id, d.client, d.serial, c.api_ip, c.last_sync_at, c.last_sync_status
                FROM fortigate_devices d
                JOIN fortigate_api_config c ON d.id = c.device_id
                WHERE c.api_enabled = TRUE
            ");
            $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
            echo "<tr><th>ID</th><th>Cliente</th><th>Serial</th><th>API IP</th><th>Última Sync</th><th>Status</th></tr>";
            
            foreach ($devices as $device) {
                echo "<tr>";
                echo "<td>{$device['id']}</td>";
                echo "<td>{$device['client']}</td>";
                echo "<td>{$device['serial']}</td>";
                echo "<td>{$device['api_ip']}</td>";
                echo "<td>" . ($device['last_sync_at'] ?: 'Nunca') . "</td>";
                echo "<td>" . ($device['last_sync_status'] ?: 'Não testado') . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
    } else {
        echo "<p>❌ Tabela fortigate_api_config não existe</p>";
    }
    
    // 3. Testar sincronização se possível
    echo "<h2>🧪 TESTE DE SINCRONIZAÇÃO</h2>";
    
    if (isset($_POST['test_sync']) && $_POST['device_id']) {
        $deviceId = $_POST['device_id'];
        
        echo "<p>🔄 Testando sincronização do dispositivo ID: {$deviceId}</p>";
        
        // Simular chamada para a API
        $testUrl = "https://dashlicencas.macip.com.br/app_fortigate_api.php?action=sync_device";
        $postData = json_encode(['device_id' => $deviceId]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $testUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Cookie: ' . $_SERVER['HTTP_COOKIE'] // Passar cookies de sessão
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "<h4>Resultado do Teste:</h4>";
        echo "<p><strong>HTTP Code:</strong> {$httpCode}</p>";
        echo "<pre>" . htmlspecialchars($response) . "</pre>";
    }
    
    // 4. Formulário para testar sincronização
    if ($tablesStatus['fortigate_api_config'] && isset($devices) && count($devices) > 0) {
        echo "<h3>🚀 Testar Sincronização</h3>";
        echo "<form method='post'>";
        echo "<select name='device_id' required>";
        echo "<option value=''>Selecione um dispositivo</option>";
        foreach ($devices as $device) {
            echo "<option value='{$device['id']}'>{$device['client']} - {$device['serial']}</option>";
        }
        echo "</select>";
        echo "<input type='hidden' name='test_sync' value='1'>";
        echo "<button type='submit' style='background: green; color: white; padding: 10px; margin-left: 10px;'>TESTAR SINCRONIZAÇÃO</button>";
        echo "</form>";
    }
    
    // 5. SQL para criar tabelas se não existirem
    echo "<h2>🔧 CRIAR TABELAS (se necessário)</h2>";
    
    $missingTables = array_filter($tablesStatus, function($exists) { return !$exists; });
    
    if (!empty($missingTables)) {
        echo "<p>❌ Algumas tabelas estão faltando. Execute o SQL abaixo no phpMyAdmin:</p>";
        echo "<textarea style='width: 100%; height: 200px;'>";
        include 'db_init/create_fortigate_api_tables.sql';
        echo "</textarea>";
        
        echo "<h3>Executar Automaticamente:</h3>";
        echo "<form method='post'>";
        echo "<input type='hidden' name='create_tables' value='1'>";
        echo "<button type='submit' style='background: red; color: white; padding: 10px;'>CRIAR TABELAS AUTOMATICAMENTE</button>";
        echo "</form>";
        
        if (isset($_POST['create_tables'])) {
            echo "<h4>Criando tabelas...</h4>";
            $sql = file_get_contents('db_init/create_fortigate_api_tables.sql');
            
            try {
                $pdo->exec($sql);
                echo "<p style='color: green;'>✅ Tabelas criadas com sucesso!</p>";
                echo "<p><a href='testar_sincronizacao_fortigate.php'>Recarregar página</a></p>";
            } catch (Exception $e) {
                echo "<p style='color: red;'>❌ Erro ao criar tabelas: " . $e->getMessage() . "</p>";
            }
        }
    } else {
        echo "<p>✅ Todas as tabelas necessárias existem!</p>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERRO</h2>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?>