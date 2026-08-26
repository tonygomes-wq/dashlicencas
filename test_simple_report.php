<?php
/**
 * Teste SIMPLES de criação de relatório
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🧪 Teste Simples de Relatório</h1>";

require_once 'srv/config.php';
session_start();

// 1. Verificar se usuário está logado
echo "<h2>1. Verificar Sessão</h2>";
if (!isset($_SESSION['user_id'])) {
    echo "<p style='color:red'>❌ Usuário NÃO está logado</p>";
    echo "<p>Faça login primeiro no sistema principal</p>";
    exit;
}

$userId = $_SESSION['user_id'];
echo "<p>✅ Usuário logado: ID {$userId}</p>";

// 2. Buscar cliente
echo "<h2>2. Buscar Cliente Bitdefender</h2>";
$stmt = $pdo->query("SELECT * FROM bitdefender_licenses LIMIT 1");
$client = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$client) {
    die("<p style='color:red'>❌ Nenhum cliente encontrado</p>");
}

echo "<p>✅ Cliente: {$client['company']} (ID: {$client['id']})</p>";

if (!$client['client_api_key']) {
    echo "<p style='color:orange'>⚠️ Cliente NÃO tem API Key configurada</p>";
    echo "<p><strong>Configure a API Key no campo 'client_api_key' da tabela 'bitdefender_licenses'</strong></p>";
} else {
    echo "<p>✅ API Key configurada</p>";
}

// 3. Tentar inserir relatório direto no banco
echo "<h2>3. Inserir Relatório no Banco (Teste Direto)</h2>";

try {
    $reportName = "Teste Manual - " . date('d/m/Y H:i:s');
    
    $stmt = $pdo->prepare("
        INSERT INTO bitdefender_reports (
            client_id, user_id, report_name, report_type, report_type_name,
            status, generation_mode, reporting_interval, filter_type, 
            detailed_export, custom_params, generation_started_at
        ) VALUES (?, ?, ?, 12, 'Malware Status', 'pending', 'instant', 'thisWeek', 0, 1, '{}', NOW())
    ");
    
    $result = $stmt->execute([
        $client['id'],
        $userId,
        $reportName
    ]);
    
    if ($result) {
        $reportId = $pdo->lastInsertId();
        echo "<p style='color:green; font-weight:bold'>✅ SUCESSO! Relatório inserido no banco!</p>";
        echo "<p>ID do relatório: {$reportId}</p>";
        
        // Buscar o relatório criado
        $stmt = $pdo->prepare("SELECT * FROM bitdefender_reports WHERE id = ?");
        $stmt->execute([$reportId]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<h3>Dados do Relatório:</h3>";
        echo "<pre>" . print_r($report, true) . "</pre>";
        
    } else {
        echo "<p style='color:red'>❌ Falha ao inserir</p>";
        print_r($stmt->errorInfo());
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ ERRO: {$e->getMessage()}</p>";
    echo "<pre>{$e->getTraceAsString()}</pre>";
}

// 4. Listar relatórios existentes
echo "<h2>4. Relatórios Existentes</h2>";

try {
    $stmt = $pdo->query("
        SELECT br.id, br.report_name, br.status, br.error_message, br.created_at, bl.company
        FROM bitdefender_reports br
        LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id
        ORDER BY br.created_at DESC
        LIMIT 5
    ");
    
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($reports) {
        echo "<table border='1' cellpadding='8'>";
        echo "<tr><th>ID</th><th>Cliente</th><th>Nome</th><th>Status</th><th>Erro</th><th>Data</th></tr>";
        
        foreach ($reports as $r) {
            $statusColors = [
                'pending' => 'orange',
                'generating' => 'blue',
                'ready' => 'green',
                'failed' => 'red',
                'downloaded' => 'purple'
            ];
            $color = $statusColors[$r['status']] ?? 'black';
            
            echo "<tr>";
            echo "<td>{$r['id']}</td>";
            echo "<td>{$r['company']}</td>";
            echo "<td>{$r['report_name']}</td>";
            echo "<td style='color:{$color}; font-weight:bold'>{$r['status']}</td>";
            echo "<td style='color:red; font-size:11px'>" . ($r['error_message'] ?: '-') . "</td>";
            echo "<td>" . date('d/m/Y H:i', strtotime($r['created_at'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<p>Nenhum relatório encontrado</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>Erro: {$e->getMessage()}</p>";
}

// 5. Teste de chamada ao endpoint via JavaScript
echo "<hr>";
echo "<h2>5. Teste via JavaScript (Simular Frontend)</h2>";
echo "<button onclick='testarAPI()' style='padding:10px 20px; font-size:16px; cursor:pointer'>🚀 Testar API de Relatórios</button>";
echo "<div id='resultado' style='margin-top:20px'></div>";

?>

<script>
async function testarAPI() {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '<p>⏳ Enviando requisição...</p>';
    
    try {
        const response = await fetch('/app_bitdefender_reports.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'create_report',
                client_id: <?php echo $client['id']; ?>,
                report_type: 12,
                report_name: 'Teste via JS - ' + new Date().toLocaleString('pt-BR'),
                reporting_interval: 'thisWeek',
                filter_type: 0,
                detailed_export: true
            })
        });
        
        console.log('Status:', response.status);
        console.log('Headers:', response.headers);
        
        const text = await response.text();
        console.log('Response text:', text);
        
        try {
            const data = JSON.parse(text);
            console.log('Response JSON:', data);
            
            if (data.success) {
                resultado.innerHTML = `
                    <div style="background:#d4edda; border:1px solid #c3e6cb; padding:15px; border-radius:4px">
                        <h3 style="color:#155724; margin:0 0 10px 0">✅ SUCESSO!</h3>
                        <p><strong>Relatório criado:</strong> ${data.data.report_name}</p>
                        <p><strong>ID:</strong> ${data.data.id}</p>
                        <p><strong>Status:</strong> ${data.data.status}</p>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;
            } else {
                resultado.innerHTML = `
                    <div style="background:#f8d7da; border:1px solid #f5c6cb; padding:15px; border-radius:4px">
                        <h3 style="color:#721c24; margin:0 0 10px 0">❌ ERRO</h3>
                        <p><strong>Mensagem:</strong> ${data.error}</p>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;
            }
        } catch (e) {
            resultado.innerHTML = `
                <div style="background:#fff3cd; border:1px solid #ffeeba; padding:15px; border-radius:4px">
                    <h3 style="color:#856404; margin:0 0 10px 0">⚠️ Resposta não é JSON</h3>
                    <p><strong>Status HTTP:</strong> ${response.status}</p>
                    <pre style="background:white; padding:10px; overflow:auto">${text}</pre>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Erro:', error);
        resultado.innerHTML = `
            <div style="background:#f8d7da; border:1px solid #f5c6cb; padding:15px; border-radius:4px">
                <h3 style="color:#721c24; margin:0 0 10px 0">❌ ERRO DE REDE</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}
</script>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    background: #f5f5f5;
}
h1 {
    color: #333;
    border-bottom: 3px solid #4CAF50;
    padding-bottom: 10px;
}
h2 {
    color: #555;
    margin-top: 30px;
    background: #e8f5e9;
    padding: 10px;
    border-left: 4px solid #4CAF50;
}
pre {
    background: #fff;
    padding: 10px;
    border: 1px solid #ddd;
    overflow-x: auto;
    font-size: 12px;
}
table {
    width: 100%;
    background: white;
    border-collapse: collapse;
}
table th {
    background: #4CAF50;
    color: white;
    padding: 10px;
    text-align: left;
}
table td {
    padding: 8px;
    border-bottom: 1px solid #ddd;
}
</style>