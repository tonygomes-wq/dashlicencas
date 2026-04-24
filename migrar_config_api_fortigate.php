<?php
// Script para migrar configurações de API da tabela fortigate_devices para fortigate_api_config
session_start();

if (!isset($_SESSION['user_id'])) {
    die('❌ Não autenticado');
}

require_once 'srv/config.php';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Migrar Configurações API FortiGate</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .btn { background: #007cba; color: white; padding: 10px 15px; border: none; cursor: pointer; margin: 5px; }
        .btn-success { background: #28a745; }
    </style>
</head>
<body>

<h1>🔄 Migrar Configurações API FortiGate</h1>

<?php
try {
    // 1. Verificar dispositivos com API configurada na tabela principal
    echo "<h2>📋 Dispositivos com API Configurada</h2>";
    
    $stmt = $pdo->query("
        SELECT id, client, serial, api_token, api_ip
        FROM fortigate_devices 
        WHERE api_token IS NOT NULL AND api_ip IS NOT NULL
    ");
    
    $devices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($devices)) {
        echo "<p class='warning'>⚠️ Nenhum dispositivo com API configurada encontrado na tabela fortigate_devices.</p>";
    } else {
        echo "<table>";
        echo "<tr><th>ID</th><th>Cliente</th><th>Serial</th><th>API IP</th><th>Token</th><th>Status na API Config</th></tr>";
        
        foreach ($devices as $device) {
            // Verificar se já existe na tabela de configuração
            $stmt2 = $pdo->prepare("SELECT api_enabled FROM fortigate_api_config WHERE device_id = ?");
            $stmt2->execute([$device['id']]);
            $apiConfig = $stmt2->fetch();
            
            echo "<tr>";
            echo "<td>{$device['id']}</td>";
            echo "<td>{$device['client']}</td>";
            echo "<td>{$device['serial']}</td>";
            echo "<td>{$device['api_ip']}</td>";
            echo "<td>" . (strlen($device['api_token']) > 10 ? substr($device['api_token'], 0, 10) . '...' : $device['api_token']) . "</td>";
            
            if ($apiConfig) {
                echo "<td class='success'>✅ JÁ MIGRADO</td>";
            } else {
                echo "<td class='error'>❌ PRECISA MIGRAR</td>";
            }
            
            echo "</tr>";
        }
        echo "</table>";
        
        // 2. Botão para migrar
        if (isset($_POST['migrate'])) {
            echo "<h3>🔄 Executando Migração...</h3>";
            
            $migrated = 0;
            $errors = 0;
            
            foreach ($devices as $device) {
                try {
                    // Verificar se já existe
                    $stmt = $pdo->prepare("SELECT device_id FROM fortigate_api_config WHERE device_id = ?");
                    $stmt->execute([$device['id']]);
                    
                    if ($stmt->fetch()) {
                        echo "<p class='warning'>⚠️ Dispositivo {$device['client']} (ID: {$device['id']}) já existe na configuração</p>";
                        continue;
                    }
                    
                    // Criptografar o token (usando a mesma lógica da classe FortigateSync)
                    $encryptionKey = 'ca043add73ede2a40b3a51e99d1debf5257c129a11eb5fa1f01e458476ae387c'; // Chave do projeto
                    $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
                    $encrypted = openssl_encrypt($device['api_token'], 'aes-256-cbc', $encryptionKey, 0, $iv);
                    $encryptedToken = base64_encode($encrypted . '::' . $iv);
                    
                    // Inserir na tabela de configuração
                    $stmt = $pdo->prepare("
                        INSERT INTO fortigate_api_config 
                        (device_id, api_enabled, api_ip, api_port, api_token_encrypted, verify_ssl, sync_interval_minutes)
                        VALUES (?, TRUE, ?, 443, ?, TRUE, 60)
                    ");
                    
                    $result = $stmt->execute([
                        $device['id'],
                        $device['api_ip'],
                        $encryptedToken
                    ]);
                    
                    if ($result) {
                        echo "<p class='success'>✅ Migrado: {$device['client']} (ID: {$device['id']})</p>";
                        $migrated++;
                    } else {
                        echo "<p class='error'>❌ Erro ao migrar: {$device['client']} (ID: {$device['id']})</p>";
                        $errors++;
                    }
                    
                } catch (Exception $e) {
                    echo "<p class='error'>❌ Erro ao migrar {$device['client']}: " . $e->getMessage() . "</p>";
                    $errors++;
                }
            }
            
            echo "<hr>";
            echo "<h4>📊 Resultado da Migração:</h4>";
            echo "<p class='success'>✅ Migrados com sucesso: <strong>{$migrated}</strong></p>";
            if ($errors > 0) {
                echo "<p class='error'>❌ Erros: <strong>{$errors}</strong></p>";
            }
            
            if ($migrated > 0) {
                echo "<p><a href='verificar_api_fortigate_simples.php' class='btn btn-success'>🔍 VERIFICAR RESULTADO</a></p>";
            }
            
        } else {
            // Verificar quantos precisam ser migrados
            $needMigration = 0;
            foreach ($devices as $device) {
                $stmt = $pdo->prepare("SELECT device_id FROM fortigate_api_config WHERE device_id = ?");
                $stmt->execute([$device['id']]);
                if (!$stmt->fetch()) {
                    $needMigration++;
                }
            }
            
            if ($needMigration > 0) {
                echo "<div class='warning'>";
                echo "<h3>⚠️ {$needMigration} dispositivo(s) precisam ser migrados</h3>";
                echo "<p>A migração irá:</p>";
                echo "<ul>";
                echo "<li>✅ Copiar configurações de API para a tabela correta</li>";
                echo "<li>✅ Criptografar tokens de segurança</li>";
                echo "<li>✅ Habilitar sincronização automática</li>";
                echo "<li>✅ Manter dados originais intactos</li>";
                echo "</ul>";
                
                echo "<form method='post'>";
                echo "<button type='submit' name='migrate' value='1' class='btn btn-success'>🔄 MIGRAR CONFIGURAÇÕES</button>";
                echo "</form>";
                echo "</div>";
            } else {
                echo "<p class='success'>✅ Todos os dispositivos já estão migrados!</p>";
                echo "<p><a href='verificar_api_fortigate_simples.php' class='btn'>🔍 VERIFICAR API</a></p>";
            }
        }
    }
    
} catch (Exception $e) {
    echo "<h2 class='error'>❌ ERRO</h2>";
    echo "<p class='error'>" . $e->getMessage() . "</p>";
}
?>

<hr>
<p><a href="verificar_api_fortigate_simples.php">← Voltar à Verificação</a></p>

</body>
</html>