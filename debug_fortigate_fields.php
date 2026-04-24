<?php
// Debug simples para verificar campos da tabela FortiGate
require_once 'srv/config.php';

try {
    // Verificar estrutura da tabela
    $stmt = $pdo->prepare("DESCRIBE fortigate_devices");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h2>Estrutura da Tabela fortigate_devices:</h2>";
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    $hasApiToken = false;
    $hasApiIp = false;
    
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td>" . $column['Field'] . "</td>";
        echo "<td>" . $column['Type'] . "</td>";
        echo "<td>" . $column['Null'] . "</td>";
        echo "<td>" . $column['Key'] . "</td>";
        echo "<td>" . $column['Default'] . "</td>";
        echo "<td>" . $column['Extra'] . "</td>";
        echo "</tr>";
        
        if ($column['Field'] === 'api_token') $hasApiToken = true;
        if ($column['Field'] === 'api_ip') $hasApiIp = true;
    }
    echo "</table>";
    
    echo "<h3>Status dos Campos API:</h3>";
    echo "<p>api_token existe: " . ($hasApiToken ? "✅ SIM" : "❌ NÃO") . "</p>";
    echo "<p>api_ip existe: " . ($hasApiIp ? "✅ SIM" : "❌ NÃO") . "</p>";
    
    if (!$hasApiToken || !$hasApiIp) {
        echo "<h3>SQL para Adicionar Campos:</h3>";
        echo "<pre>";
        if (!$hasApiToken && !$hasApiIp) {
            echo "ALTER TABLE fortigate_devices \n";
            echo "ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status,\n";
            echo "ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token;";
        } elseif (!$hasApiToken) {
            echo "ALTER TABLE fortigate_devices ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status;";
        } elseif (!$hasApiIp) {
            echo "ALTER TABLE fortigate_devices ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token;";
        }
        echo "</pre>";
        
        echo "<h3>Executar Automaticamente:</h3>";
        echo "<form method='post'>";
        echo "<input type='hidden' name='add_fields' value='1'>";
        echo "<button type='submit' style='background: red; color: white; padding: 10px;'>ADICIONAR CAMPOS AUTOMATICAMENTE</button>";
        echo "</form>";
    }
    
    // Processar adição automática
    if (isset($_POST['add_fields'])) {
        echo "<h3>Executando SQL...</h3>";
        
        if (!$hasApiToken && !$hasApiIp) {
            $sql = "ALTER TABLE fortigate_devices 
                    ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status,
                    ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token";
        } elseif (!$hasApiToken) {
            $sql = "ALTER TABLE fortigate_devices ADD COLUMN api_token VARCHAR(500) NULL AFTER renewal_status";
        } elseif (!$hasApiIp) {
            $sql = "ALTER TABLE fortigate_devices ADD COLUMN api_ip VARCHAR(255) NULL AFTER api_token";
        }
        
        if (isset($sql)) {
            $pdo->exec($sql);
            echo "<p style='color: green;'>✅ Campos adicionados com sucesso!</p>";
            echo "<p><a href='debug_fortigate_fields.php'>Recarregar página para verificar</a></p>";
        }
    }
    
} catch (Exception $e) {
    echo "<h2>Erro:</h2>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?>