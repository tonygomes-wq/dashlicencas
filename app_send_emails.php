<?php
// api/send_emails.php - Email Notification API Placeholder
require_once 'app_config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_SESSION['user_id'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $itemIds = $data['itemIds'] ?? [];
    $subject = $data['subject'] ?? '';
    $body = $data['body'] ?? '';

    // Logic to send emails would go here.
    // Since this varies heavily based on SMTP settings, we provide a placeholder.

    // Log the request to email_history table
    foreach ($itemIds as $fullId) {
        // fullId is like 'bitdefender-123'
        $parts = explode('-', $fullId);
        if (count($parts) < 2) continue;

        $type = $parts[0];
        $id = $parts[1];

        $stmt = $pdo->prepare('INSERT INTO email_history (user_id, recipient_email, subject, body_preview, product_type, item_id) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $user_id,
            'log@macip.com.br', // Placeholder recipient for historical log
            $subject,
            substr($body, 0, 100),
            $type,
            $id
        ]);
    }

    echo json_encode([
        'message' => 'Processo de envio iniciado (Simulado). Verifique os logs do servidor para envio real.',
        'count' => count($itemIds)
    ]);
} else {
    http_response_code(405);
}
