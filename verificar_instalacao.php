#!/usr/bin/env php
<?php
/**
 * Script de Verificação da Instalação FortiGate API
 * 
 * Este script verifica se todos os componentes necessários estão instalados
 * e configurados corretamente.
 */

echo "=================================================\n";
echo "  VERIFICAÇÃO DE INSTALAÇÃO - FortiGate API\n";
echo "=================================================\n\n";

$errors = [];
$warnings = [];
$success = [];

// 1. Verificar ENCRYPTION_KEY
echo "1. Verificando ENCRYPTION_KEY...\n";
$encryptionKey = getenv('ENCRYPTION_KEY');
if (!$encryptionKey) {
    $errors[] = "ENCRYPTION_KEY não está configurada!";
    echo "   ❌ ERRO: Variável não encontrada\n";
    echo "   Solução: Adicione ao .env ou configure como variável de ambiente\n";
} else {
    if (strlen($encryptionKey) < 32) {
        $warnings[] = "ENCRYPTION_KEY muito curta (mínimo 32 caracteres)";
        echo "   ⚠️  AVISO: Chave muito curta\n";
    } else {
        $success[] = "ENCRYPTION_KEY configurada corretamente";
        echo "   ✅ OK: Chave configurada (" . strlen($encryptionKey) . " caracteres)\n";
    }
}
echo "\n";

// 2. Verificar conexão com banco de dados
echo "2. Verificando conexão com banco de dados...\n";
try {
    require_once __DIR__ . '/srv/Database.php';
    $db = Database::getInstance()->getConnection();
    $success[] = "Conexão com banco de dados estabelecida";
    echo "   ✅ OK: Conectado ao banco de dados\n";
} catch (Exception $e) {
    $errors[] = "Erro ao conectar ao banco: " . $e->getMessage();
    echo "   ❌ ERRO: " . $e->getMessage() . "\n";
}
echo "\n";

// 3. Verificar tabelas
echo "3. Verificando tabelas no banco de dados...\n";
if (isset($db)) {
    $requiredTables = [
        'fortigate_api_config',
        'fortigate_devices_extended',
        'fortigate_sync_history',
        'fortigate_alerts'
    ];
    
    foreach ($requiredTables as $table) {
        try {
            $stmt = $db->query("SHOW TABLES LIKE '{$table}'");
            if ($stmt->rowCount() > 0) {
                $success[] = "Tabela {$table} existe";
                echo "   ✅ OK: {$table}\n";
            } else {
                $errors[] = "Tabela {$table} não encontrada";
                echo "   ❌ ERRO: {$table} não existe\n";
            }
        } catch (Exception $e) {
            $errors[] = "Erro ao verificar tabela {$table}: " . $e->getMessage();
            echo "   ❌ ERRO: {$table} - " . $e->getMessage() . "\n";
        }
    }
} else {
    echo "   ⏭️  PULADO: Sem conexão com banco\n";
}
echo "\n";

// 4. Verificar arquivos PHP
echo "4. Verificando arquivos PHP...\n";
$requiredFiles = [
    'srv/FortigateAPI.php',
    'srv/FortigateSync.php',
    'app_fortigate_api.php',
    'cron_fortigate_sync.php'
];

foreach ($requiredFiles as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        $success[] = "Arquivo {$file} existe";
        echo "   ✅ OK: {$file}\n";
    } else {
        $errors[] = "Arquivo {$file} não encontrado";
        echo "   ❌ ERRO: {$file} não existe\n";
    }
}
echo "\n";

// 5. Verificar frontend (dist)
echo "5. Verificando build do frontend...\n";
if (is_dir(__DIR__ . '/dist')) {
    $success[] = "Diretório dist existe";
    echo "   ✅ OK: Diretório dist encontrado\n";
    
    if (file_exists(__DIR__ . '/dist/index.html')) {
        $success[] = "index.html existe";
        echo "   ✅ OK: index.html encontrado\n";
    } else {
        $warnings[] = "index.html não encontrado em dist";
        echo "   ⚠️  AVISO: index.html não encontrado\n";
    }
} else {
    $warnings[] = "Diretório dist não encontrado - execute npm run build";
    echo "   ⚠️  AVISO: Diretório dist não encontrado\n";
    echo "   Solução: Execute 'npm run build'\n";
}
echo "\n";

// 6. Verificar permissões do cron
echo "6. Verificando permissões do cron job...\n";
if (file_exists(__DIR__ . '/cron_fortigate_sync.php')) {
    if (is_executable(__DIR__ . '/cron_fortigate_sync.php')) {
        $success[] = "cron_fortigate_sync.php é executável";
        echo "   ✅ OK: Script é executável\n";
    } else {
        $warnings[] = "cron_fortigate_sync.php não é executável";
        echo "   ⚠️  AVISO: Script não é executável\n";
        echo "   Solução: Execute 'chmod +x cron_fortigate_sync.php'\n";
    }
} else {
    echo "   ⏭️  PULADO: Arquivo não encontrado\n";
}
echo "\n";

// 7. Testar classes PHP
echo "7. Testando classes PHP...\n";
try {
    require_once __DIR__ . '/srv/FortigateAPI.php';
    $success[] = "FortigateAPI.php carregada com sucesso";
    echo "   ✅ OK: FortigateAPI.php\n";
} catch (Exception $e) {
    $errors[] = "Erro ao carregar FortigateAPI.php: " . $e->getMessage();
    echo "   ❌ ERRO: FortigateAPI.php - " . $e->getMessage() . "\n";
}

try {
    require_once __DIR__ . '/srv/FortigateSync.php';
    $success[] = "FortigateSync.php carregada com sucesso";
    echo "   ✅ OK: FortigateSync.php\n";
} catch (Exception $e) {
    $errors[] = "Erro ao carregar FortigateSync.php: " . $e->getMessage();
    echo "   ❌ ERRO: FortigateSync.php - " . $e->getMessage() . "\n";
}
echo "\n";

// 8. Verificar extensões PHP necessárias
echo "8. Verificando extensões PHP...\n";
$requiredExtensions = ['pdo', 'pdo_mysql', 'openssl', 'curl', 'json'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        $success[] = "Extensão {$ext} carregada";
        echo "   ✅ OK: {$ext}\n";
    } else {
        $errors[] = "Extensão {$ext} não está carregada";
        echo "   ❌ ERRO: {$ext} não está carregada\n";
    }
}
echo "\n";

// Resumo
echo "=================================================\n";
echo "  RESUMO DA VERIFICAÇÃO\n";
echo "=================================================\n\n";

echo "✅ Sucessos: " . count($success) . "\n";
echo "⚠️  Avisos: " . count($warnings) . "\n";
echo "❌ Erros: " . count($errors) . "\n\n";

if (count($errors) > 0) {
    echo "ERROS ENCONTRADOS:\n";
    foreach ($errors as $i => $error) {
        echo "  " . ($i + 1) . ". {$error}\n";
    }
    echo "\n";
}

if (count($warnings) > 0) {
    echo "AVISOS:\n";
    foreach ($warnings as $i => $warning) {
        echo "  " . ($i + 1) . ". {$warning}\n";
    }
    echo "\n";
}

// Conclusão
echo "=================================================\n";
if (count($errors) === 0) {
    echo "✅ INSTALAÇÃO OK - Sistema pronto para uso!\n";
    echo "\nPróximos passos:\n";
    echo "1. Acessar o sistema no navegador\n";
    echo "2. Limpar cache (Ctrl+Shift+R)\n";
    echo "3. Configurar primeiro dispositivo FortiGate\n";
    echo "4. Testar sincronização\n";
    exit(0);
} else {
    echo "❌ INSTALAÇÃO INCOMPLETA - Corrija os erros acima\n";
    echo "\nConsulte a documentação:\n";
    echo "- GUIA_INSTALACAO_FORTIGATE_API.md\n";
    echo "- CHECKLIST_DEPLOY_FORTIGATE_API.md\n";
    exit(1);
}
