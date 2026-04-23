<?php
// api/2fa_verify.php - Endpoint to verify 2FA during login
require_once 'config.php';
require_once 'OTPHelper.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $jsonData = json_decode(file_get_contents('php://input'), true);
    $code = $jsonData['code'] ?? $_POST['code'] ?? '';
    $user_id = $_SESSION['pending_2fa_user_id'] ?? null;

    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'No login attempt in progress']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if ($user && OTPHelper::verifyCode($user['two_factor_secret'], $code)) {
        // Finalize Login
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        unset($_SESSION['pending_2fa_user_id']);
        unset($_SESSION['pending_2fa_user_email']);

        // Remove sensitive data
        unset($user['password_hash']);
        unset($user['two_factor_secret']);

        echo json_encode([
            'message' => 'Login successful',
            'user' => $user,
            'session_id' => session_id()
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid 2FA code']);
    }
} else {
    http_response_code(405);
}
