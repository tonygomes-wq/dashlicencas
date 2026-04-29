<?php
/**
 * Script para verificar e corrigir permissões do usuário suporte01
 */

require_once __DIR__ . '/app_config.php';

try {
    echo "🔍 Verificando usuário suporte01...\n\n";
    
    // Buscar usuário suporte01
    $stmt = $pdo->prepare("SELECT id, email, role, is_active FROM users WHERE email = 'suporte01@macip.com.br'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "❌ Usuário suporte01@macip.com.br não encontrado!\n";
        exit(1);
    }
    
    echo "📋 Dados atuais do usuário:\n";
    echo "   ID: {$user['id']}\n";
    echo "   Email: {$user['email']}\n";
    echo "   Role: {$user['role']}\n";
    echo "   Ativo: " . ($user['is_active'] ? 'Sim' : 'Não') . "\n\n";
    
    // Verificar se precisa atualizar
    if ($user['role'] !== 'admin') {
        echo "⚠️  Usuário não é admin. Atualizando...\n";
        
        $stmt = $pdo->prepare("UPDATE users SET role = 'admin' WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        echo "✅ Role atualizado para 'admin'\n\n";
    } else {
        echo "✅ Usuário já é admin\n\n";
    }
    
    // Verificar se está ativo
    if (!$user['is_active']) {
        echo "⚠️  Usuário está inativo. Ativando...\n";
        
        $stmt = $pdo->prepare("UPDATE users SET is_active = TRUE WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        echo "✅ Usuário ativado\n\n";
    } else {
        echo "✅ Usuário está ativo\n\n";
    }
    
    // Mostrar dados finais
    $stmt = $pdo->prepare("SELECT id, email, role, is_active FROM users WHERE email = 'suporte01@macip.com.br'");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "📋 Dados finais do usuário:\n";
    echo "   ID: {$user['id']}\n";
    echo "   Email: {$user['email']}\n";
    echo "   Role: {$user['role']}\n";
    echo "   Ativo: " . ($user['is_active'] ? 'Sim' : 'Não') . "\n\n";
    
    echo "🎉 CONCLUÍDO!\n\n";
    echo "📝 PRÓXIMOS PASSOS:\n";
    echo "   1. Fazer logout do usuário suporte01\n";
    echo "   2. Limpar cache do navegador (Ctrl+Shift+Delete)\n";
    echo "   3. Fazer login novamente\n";
    echo "   4. Testar criação/edição de registros\n";
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}
