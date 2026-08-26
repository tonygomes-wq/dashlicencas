<?php
/**
 * Teste de criação de relatório - Debug detalhado
 */

// Ativar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🧪 Teste de Criação de Relatório</h1>";

require_once 'srv/config.php';

// Simular sessão de usuário
session_start();

// Buscar primeiro usuário para teste
$stmt = $pdo->query("SELECT id, email FROM users LIMIT 1");
$testUser = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$testUser) {
    die("<p style='color:red'>❌ Nenhum usuário encontrado no banco</p>");
}

$_SESSION['user_id'] = $testUser['id'];
echo "<p>✅ Simulando usuário: {$testUser['email']} (ID: {$testUser['id']})</p>";

// Buscar primeira licença Bitdefender
$stmt = $pdo->query("SELECT * FROM bitdefender_licenses WHERE client_api_key IS NOT NULL LIMIT 1");
$client = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$client) {
    echo "<p style='color:orange'>⚠️ Nenhuma licença com API Key configurada. Buscando qualquer licença...</p>";
    
    $stmt = $pdo->query("SELECT * FROM bitdefender_licenses LIMIT 1");
    $client = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        die("<p style='color:red'>❌ Nenhuma licença Bitdefender encontrada</p>");
    }
    
    echo "<p style='color:orange'>⚠️ Cliente sem API Key: {$client['company']} (ID: {$client['id']})</p>";
    echo "<p style='color:red'><strong>ERRO ESPERADO:</strong> 'Cliente não possui API Key configurada'</p>";
} else {
    echo "<p>✅ Cliente com API Key: {$client['company']} (ID: {$client['id']})</p>";
}

echo "<hr>";

// Preparar dados do relatório
$testData = [
    'action' => 'create_report',
    'client_id' => $client['id'],
    'report_type' => 12, // Malware Status
    'report_name' => 'Teste - ' . date('d/m/Y H:i:s'),
    'reporting_interval' => 'thisWeek',
    'filter_type' => 0,
    'detailed_export' => true
];

echo "<h2>📋 Dados do Teste</h2>";
echo "<pre>" . json_encode($testData, JSON_PRETTY_PRINT) . "</pre>";

echo "<hr>";
echo "<h2>🚀 Executando Criação de Relatório...</h2>";

try {
    // Incluir as funções necessárias
    require_once 'app_auth.php';
    
    // Verificar autenticação
    $auth = check_auth();
    
    echo "<p>✅ Autenticação: " . ($auth['authenticated'] ? 'OK' : 'FALHOU') . "</p>";
    
    if (!$auth['authenticated']) {
        die("<p style='color:red'>❌ Falha na autenticação</p>");
    }
    
    echo "<p>✅ Usuário autenticado: {$auth['user']['email']}</p>";
    
    // Simular requisição POST
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $_POST = $testData;
    
    // Capturar output
    ob_start();
    
    // Incluir o arquivo de relatórios
    try {
        // Preparar input para simular JSON POST
        $jsonInput = json_encode($testData);
        
        // Criar stream temporário
        $tmpfile = tmpfile();
        fwrite($tmpfile, $jsonInput);
        rewind($tmpfile);
        
        // Simular entrada PHP
        $originalInput = 'php://input';
        
        // Executar função diretamente
        require_once 'app_bitdefender_reports.php';
        
        // Capturar resposta
        $response = ob_get_clean();
        
        echo "<h2>📤 Resposta do Servidor</h2>";
        
        // Tentar decodificar JSON
        $decoded = json_decode($response, true);
        
        if ($decoded) {
            echo "<pre>" . json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
            
            if (isset($decoded['success']) && $decoded['success']) {
                echo "<p style='color:green; font-size:18px; font-weight:bold'>✅ SUCESSO! Relatório criado!</p>";
                
                if (isset($decoded['data'])) {
                    echo "<h3>Detalhes do Relatório:</h3>";
                    echo "<ul>";
                    echo "<li><strong>ID:</strong> {$decoded['data']['id']}</li>";
                    echo "<li><strong>Nome:</strong> {$decoded['data']['report_name']}</li>";
                    echo "<li><strong>Status:</strong> {$decoded['data']['status']}</li>";
                    echo "<li><strong>Tipo:</strong> {$decoded['data']['report_type_name']}</li>";
                    echo "</ul>";
                }
            } else {
                echo "<p style='color:red; font-size:18px; font-weight:bold'>❌ ERRO!</p>";
                
                if (isset($decoded['error'])) {
                    echo "<p><strong>Erro:</strong> {$decoded['error']}</p>";
                }
                
                if (isset($decoded['trace'])) {
                    echo "<h3>Stack Trace:</h3>";
                    echo "<pre style='background:#f5f5f5;padding:10px;overflow:auto'>{$decoded['trace']}</pre>";
                }
            }
        } else {
            echo "<p style='color:orange'>⚠️ Resposta não é JSON válido</p>";
            echo "<pre>" . htmlspecialchars($response) . "</pre>";
        }
        
        fclose($tmpfile);
        
    } catch (Exception $e) {
        $output = ob_get_clean();
        echo "<p style='color:red'>❌ EXCEÇÃO CAPTURADA!</p>";
        echo "<p><strong>Mensagem:</strong> {$e->getMessage()}</p>";
        echo "<p><strong>Arquivo:</strong> {$e->getFile()} (linha {$e->getLine()})</p>";
        echo "<h3>Stack Trace:</h3>";
        echo "<pre style='background:#f5f5f5;padding:10px;overflow:auto'>{$e->getTraceAsString()}</pre>";
        
        if ($output) {
            echo "<h3>Output capturado:</h3>";
            echo "<pre>" . htmlspecialchars($output) . "</pre>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>❌ ERRO GERAL!</p>";
    echo "<p><strong>Mensagem:</strong> {$e->getMessage()}</p>";
    echo "<p><strong>Arquivo:</strong> {$e->getFile()} (linha {$e->getLine()})</p>";
    echo "<h3>Stack Trace:</h3>";
    echo "<pre style='background:#f5f5f5;padding:10px;overflow:auto'>{$e->getTraceAsString()}</pre>";
}

echo "<hr>";
echo "<h2>📊 Relatórios Existentes</h2>";

try {
    $stmt = $pdo->query("
        SELECT br.*, bl.company 
        FROM bitdefender_reports br 
        LEFT JOIN bitdefender_licenses bl ON br.client_id = bl.id 
        ORDER BY br.created_at DESC 
        LIMIT 10
    ");
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($reports) {
        echo "<table border='1' cellpadding='5' cellspacing='0'>";
        echo "<tr><th>ID</th><th>Cliente</th><th>Nome</th><th>Status</th><th>Criado</th><th>Erro</th></tr>";
        foreach ($reports as $r) {
            $statusColor = $r['status'] === 'failed' ? 'red' : ($r['status'] === 'ready' ? 'green' : 'orange');
            echo "<tr>";
            echo "<td>{$r['id']}</td>";
            echo "<td>{$r['company']}</td>";
            echo "<td>{$r['report_name']}</td>";
            echo "<td style='color:$statusColor'><strong>{$r['status']}</strong></td>";
            echo "<td>" . date('d/m/Y H:i', strtotime($r['created_at'])) . "</td>";
            echo "<td>" . ($r['error_message'] ? "<span style='color:red'>{$r['error_message']}</span>" : '-') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p>Nenhum relatório encontrado.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'>Erro ao listar relatórios: {$e->getMessage()}</p>";
}

?>

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
}
pre {
    background: #fff;
    padding: 15px;
    border-left: 4px solid #4CAF50;
    overflow-x: auto;
}
table {
    width: 100%;
    background: white;
    margin: 20px 0;
}
table th {
    background: #4CAF50;
    color: white;
    padding: 10px;
    text-align: left;
}
</style>
