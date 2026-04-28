<?php
/**
 * Verificar tipo de API Bitdefender
 */

header('Content-Type: text/plain');
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
        die("Cliente não encontrado ou sem API Key\n");
    }

    $apiKey = $client['client_api_key'];
    $accessUrl = $client['client_access_url'] ?: 'https://cloud.gravityzone.bitdefender.com/api';

    echo "=== INFORMAÇÕES DO CLIENTE ===\n";
    echo "Cliente: {$client['company']}\n";
    echo "API Key Length: " . strlen($apiKey) . "\n";
    echo "API Key Preview: " . substr($apiKey, 0, 20) . "...\n";
    echo "Access URL: $accessUrl\n\n";

    echo "=== ONDE VOCÊ OBTEVE ESTA API KEY? ===\n";
    echo "1. Bitdefender GravityZone Control Center (on-premise)\n";
    echo "2. Bitdefender GravityZone Cloud Console\n";
    echo "3. Bitdefender GravityZone MSP (Managed Service Provider)\n";
    echo "4. Bitdefender Central (consumidor)\n\n";

    echo "=== INSTRUÇÕES PARA OBTER A API KEY CORRETA ===\n\n";
    
    echo "📋 PASSO 1: Acessar o GravityZone\n";
    echo "   Acesse: https://cloud.gravityzone.bitdefender.com\n";
    echo "   Faça login com suas credenciais\n\n";
    
    echo "📋 PASSO 2: Ir em API Keys\n";
    echo "   1. Clique no seu nome (canto superior direito)\n";
    echo "   2. Clique em 'API Keys' ou 'Chaves de API'\n";
    echo "   3. Ou vá direto em: My Account > API Keys\n\n";
    
    echo "📋 PASSO 3: Criar Nova API Key\n";
    echo "   1. Clique em 'Add' ou 'Adicionar'\n";
    echo "   2. Dê um nome: 'Dashboard Licenças'\n";
    echo "   3. Selecione as permissões:\n";
    echo "      ✅ Network Inventory\n";
    echo "      ✅ Computers and Groups\n";
    echo "      ✅ Reports\n";
    echo "   4. Clique em 'Save' ou 'Salvar'\n";
    echo "   5. COPIE a API Key gerada\n\n";
    
    echo "📋 PASSO 4: Atualizar no Sistema\n";
    echo "   1. Vá na página Bitdefender do dashboard\n";
    echo "   2. Edite o cliente '{$client['company']}'\n";
    echo "   3. Cole a nova API Key\n";
    echo "   4. Salve\n\n";
    
    echo "=== TESTANDO CONEXÃO BÁSICA ===\n";
    
    // Testar conexão básica
    $ch = curl_init($accessUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    
    if ($httpCode === 200 || $httpCode === 405) {
        echo "✅ URL acessível\n";
    } else {
        echo "❌ URL não acessível (HTTP $httpCode)\n";
    }
    
    echo "\n=== ALTERNATIVA: DESABILITAR SINCRONIZAÇÃO ===\n";
    echo "Se você não precisa da sincronização automática com a API Bitdefender,\n";
    echo "você pode desabilitar esta funcionalidade e usar apenas o gerenciamento\n";
    echo "manual de licenças.\n\n";
    
    echo "Para desabilitar:\n";
    echo "1. Remova as API Keys dos clientes\n";
    echo "2. O card 'Estatísticas Bitdefender API' ficará oculto\n";
    echo "3. Você continuará gerenciando licenças normalmente\n\n";

} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
}
