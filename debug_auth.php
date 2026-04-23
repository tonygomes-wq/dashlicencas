<?php
// debug_auth.php - Debug completo do sistema de autenticação

header('Content-Type: text/html; charset=UTF-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Debug do Sistema de Autenticação</h1>";
echo "<hr>";

// 1. Verificar se srv/config.php existe
echo "<h2>1. Verificar arquivo srv/config.php</h2>";
if (file_exists('srv/config.php')) {
    echo "✅ Arquivo srv/config.php existe<br>";
    echo "Caminho completo: " . realpath('srv/config.php') . "<br>";
} else {
    echo "❌ Arquivo srv/config.php NÃO existe<br>";
    echo "Diretório atual: " . getcwd() . "<br>";
}

echo "<hr>";

// 2. Tentar incluir srv/config.php
echo "<h2>2. Tentar incluir srv/config.php</h2>";
try {
    require_once 'srv/config.php';
    echo "✅ srv/config.php incluído com sucesso<br>";
} catch (Exception $e) {
    echo "❌ Erro ao incluir srv/config.php: " . $e->getMessage() . "<br>";
    exit;
}

echo "<hr>";

// 3. Verificar variável $pdo
echo "<h2>3. Verificar conexão PDO</h2>";
if (isset($pdo)) {
    echo "✅ Variável \$pdo existe<br>";
    echo "Tipo: " . get_class($pdo) . "<br>";
} else {
    echo "❌ Variável \$pdo NÃO existe<br>";
    exit;
}

echo "<hr>";

// 4. Testar query no banco
echo "<h2>4. Testar query no banco</h2>";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Query executada com sucesso<br>";
    echo "Total de usuários: " . $result['count'] . "<br>";
} catch (Exception $e) {
    echo "❌ Erro na query: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// 5. Listar usuários
echo "<h2>5. Listar usuários</h2>";
try {
    $stmt = $pdo->query("SELECT id, email, role, is_active FROM users");
    $users = $stmt->fetchAll();
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Email</th><th>Role</th><th>Ativo</th></tr>";
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td>" . $user['id'] . "</td>";
        echo "<td>" . $user['email'] . "</td>";
        echo "<td>" . $user['role'] . "</td>";
        echo "<td>" . ($user['is_active'] ? 'Sim' : 'Não') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} catch (Exception $e) {
    echo "❌ Erro ao listar usuários: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// 6. Testar login
echo "<h2>6. Testar login (suporte@macip.com.br)</h2>";
try {
    $email = 'suporte@macip.com.br';
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "✅ Usuário encontrado<br>";
        echo "ID: " . $user['id'] . "<br>";
        echo "Email: " . $user['email'] . "<br>";
        echo "Role: " . $user['role'] . "<br>";
        echo "Ativo: " . ($user['is_active'] ? 'Sim' : 'Não') . "<br>";
        echo "Hash da senha existe: " . (isset($user['password_hash']) ? 'Sim' : 'Não') . "<br>";
        
        // Testar senha
        $testPassword = 'dash@123@macip'; // Senha padrão
        if (password_verify($testPassword, $user['password_hash'])) {
            echo "✅ Senha 'dash@123@macip' está correta!<br>";
        } else {
            echo "❌ Senha 'dash@123@macip' está incorreta<br>";
            echo "Tente resetar a senha no banco de dados<br>";
        }
    } else {
        echo "❌ Usuário não encontrado<br>";
    }
} catch (Exception $e) {
    echo "❌ Erro ao testar login: " . $e->getMessage() . "<br>";
}

echo "<hr>";

// 7. Verificar sessão
echo "<h2>7. Verificar sessão PHP</h2>";
session_start();
echo "Session ID: " . session_id() . "<br>";
echo "Session save path: " . session_save_path() . "<br>";
echo "Session status: " . session_status() . "<br>";

echo "<hr>";
echo "<h2>✅ Debug completo!</h2>";
echo "<p>Se todos os testes passaram, o problema pode estar no frontend ou nas permissões de sessão.</p>";
