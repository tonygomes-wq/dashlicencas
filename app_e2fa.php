<?php
// api/2fa_enroll.php - Endpoint for 2FA Setup
require_once 'app_config.php';
require_once 'app_OTPHelper.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['do'] ?? '';
$user_id = $_SESSION['user_id'];

if ($method === 'GET' && $action === 'setup') {
    // Generate temporary secret
    $secret = OTPHelper::generateSecret();
    $qrCodeUrl = OTPHelper::getQRCodeUrl($_SESSION['user_email'], $secret);

    // Store temporarily in session until confirmed
    $_SESSION['temp_2fa_secret'] = $secret;

    echo json_encode([
        'secret' => $secret,
        'qr_code_url' => $qrCodeUrl
    ]);
} elseif ($method === 'POST' && $action === 'confirm') {
    $jsonData = json_decode(file_get_contents('php://input'), true);
    $code = $jsonData['code'] ?? $_POST['code'] ?? '';
    $secret = $_SESSION['temp_2fa_secret'] ?? '';

    if (empty($code) || empty($secret)) {
        http_response_code(400);
        echo json_encode(['error' => 'Code and setup required']);
        exit;
    }

    if (OTPHelper::verifyCode($secret, $code)) {
        try {
            // Enable 2FA in DB
            $stmt = $pdo->prepare('UPDATE users SET two_factor_secret = ?, two_factor_enabled = TRUE WHERE id = ?');
            $stmt->execute([$secret, $user_id]);

            unset($_SESSION['temp_2fa_secret']);
            echo json_encode(['message' => '2FA enabled successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid verification code']);
    }
} elseif ($method === 'POST' && $action === 'disable') {
    // Optional: Disable 2FA
    $stmt = $pdo->prepare('UPDATE users SET two_factor_secret = NULL, two_factor_enabled = FALSE WHERE id = ?');
    $stmt->execute([$user_id]);
    echo json_encode(['message' => '2FA disabled successfully']);
} else {
    http_response_code(405);
}
