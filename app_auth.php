<?php
// Set JSON header immediately to avoid HTML defaults
header('Content-Type: application/json; charset=UTF-8');

// Suppress errors and warnings that might corrupt JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'app_config.php';

@session_start();
error_log("auth.php called with action: " . ($action = $_GET['do'] ?? 'none'));

$action = $_GET['do'] ?? '';

if ($action === 'login') {
    // Handle both JSON and form-encoded data
    $email = '';
    $password = '';

    $input = file_get_contents('php://input');
    $jsonData = json_decode($input, true);

    if ($jsonData) {
        $email = $jsonData['email'] ?? '';
        $password = $jsonData['password'] ?? '';
    } else {
        // Fallback to $_POST or manual parse if $_POST is empty but input is present
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';

        if (empty($email) && !empty($input)) {
            parse_str($input, $parsedInput);
            $email = $parsedInput['email'] ?? '';
            $password = $parsedInput['password'] ?? '';
        }
    }

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    error_log("User found: " . ($user ? 'yes' : 'no') . " for email: " . $email);

    if ($user && password_verify($password, $user['password_hash'])) {
        // Check if user is active
        if (isset($user['is_active']) && !$user['is_active']) {
            http_response_code(403);
            echo json_encode(['error' => 'Account is inactive']);
            exit;
        }

        if ($user['two_factor_enabled']) {
            $_SESSION['pending_2fa_user_id'] = $user['id'];
            $_SESSION['pending_2fa_user_email'] = $user['email'];
            echo json_encode(['mfa_required' => true, 'message' => '2FA code required']);
            exit;
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];

        // Update last_login
        $stmt = $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);

        // Remove sensitive data
        unset($user['password_hash']);
        unset($user['two_factor_secret']);

        if (isset($user['permissions']) && $user['permissions']) {
            $user['permissions'] = json_decode($user['permissions'], true);
        }

        error_log("Login successful for user id: " . $user['id']);
        echo json_encode([
            'message' => 'Login successful',
            'user' => $user,
            'session_id' => session_id()
        ]);
    } else {
        error_log("Invalid credentials or user not found for email: " . $email);
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['message' => 'Logged out successfully']);
} elseif ($action === 'check') {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare('SELECT id, email, role, is_active, permissions FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();

        if ($user) {
            if (isset($user['permissions']) && $user['permissions']) {
                $user['permissions'] = json_decode($user['permissions'], true);
            }
            echo json_encode([
                'authenticated' => true,
                'user' => $user
            ]);
        } else {
            session_destroy();
            echo json_encode(['authenticated' => false]);
        }
    } else {
        echo json_encode(['authenticated' => false]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
