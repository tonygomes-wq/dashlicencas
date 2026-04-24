<?php
/**
 * Cron Job - Envio de Emails de Notificação
 * 
 * Envia emails para notificações pendentes baseado nas configurações do usuário
 * Exemplo de configuração no crontab:
 * */30 * * * * /usr/bin/php /path/to/cron_send_notification_emails.php >> /var/log/dashlicencas_emails.log 2>&1
 * 
 * Executa a cada 30 minutos
 */

// Permitir execução apenas via CLI ou com token secreto
if (php_sapi_name() !== 'cli') {
    $token = $_GET['token'] ?? '';
    $expectedToken = getenv('CRON_SECRET_TOKEN') ?: 'change_this_secret_token';
    
    if ($token !== $expectedToken) {
        http_response_code(403);
        die('Acesso negado');
    }
}

require_once __DIR__ . '/srv/config.php';

echo "[" . date('Y-m-d H:i:s') . "] Iniciando envio de emails de notificação...\n";

try {
    $sent = 0;
    $failed = 0;
    
    // Buscar notificações não enviadas de usuários com email habilitado
    $stmt = $pdo->query("
        SELECT 
            n.*,
            u.email as user_email,
            u.id as user_id,
            COALESCE(ns.email_enabled, TRUE) as email_enabled,
            COALESCE(ns.email_frequency, 'immediate') as email_frequency
        FROM notifications n
        INNER JOIN users u ON n.user_id = u.id
        LEFT JOIN notification_settings ns ON u.id = ns.user_id
        WHERE n.is_email_sent = FALSE
          AND u.is_active = TRUE
          AND COALESCE(ns.email_enabled, TRUE) = TRUE
        ORDER BY n.created_at ASC
        LIMIT 100
    ");
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Agrupar por usuário e frequência
    $grouped = [];
    foreach ($notifications as $notification) {
        $userId = $notification['user_id'];
        $frequency = $notification['email_frequency'];
        
        if (!isset($grouped[$userId])) {
            $grouped[$userId] = [
                'email' => $notification['user_email'],
                'frequency' => $frequency,
                'notifications' => []
            ];
        }
        
        $grouped[$userId]['notifications'][] = $notification;
    }
    
    // Processar cada usuário
    foreach ($grouped as $userId => $data) {
        $userEmail = $data['email'];
        $frequency = $data['frequency'];
        $userNotifications = $data['notifications'];
        
        // Verificar se deve enviar baseado na frequência
        if ($frequency === 'daily') {
            // Enviar apenas uma vez por dia (verificar se já enviou hoje)
            $stmt = $pdo->prepare("
                SELECT COUNT(*) FROM notifications 
                WHERE user_id = ? 
                  AND is_email_sent = TRUE 
                  AND DATE(created_at) = CURDATE()
            ");
            $stmt->execute([$userId]);
            $sentToday = $stmt->fetchColumn();
            
            if ($sentToday > 0) {
                echo "  - Usuário $userEmail: Aguardando frequência diária\n";
                continue;
            }
        } elseif ($frequency === 'weekly') {
            // Enviar apenas uma vez por semana
            $stmt = $pdo->prepare("
                SELECT COUNT(*) FROM notifications 
                WHERE user_id = ? 
                  AND is_email_sent = TRUE 
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ");
            $stmt->execute([$userId]);
            $sentThisWeek = $stmt->fetchColumn();
            
            if ($sentThisWeek > 0) {
                echo "  - Usuário $userEmail: Aguardando frequência semanal\n";
                continue;
            }
        }
        
        // Enviar email
        try {
            $emailSent = sendNotificationEmail($userEmail, $userNotifications);
            
            if ($emailSent) {
                // Marcar notificações como enviadas
                $notificationIds = array_column($userNotifications, 'id');
                $placeholders = implode(',', array_fill(0, count($notificationIds), '?'));
                
                $stmt = $pdo->prepare("
                    UPDATE notifications 
                    SET is_email_sent = TRUE 
                    WHERE id IN ($placeholders)
                ");
                $stmt->execute($notificationIds);
                
                $sent += count($userNotifications);
                echo "  - Enviado para $userEmail: " . count($userNotifications) . " notificações\n";
            } else {
                $failed += count($userNotifications);
                echo "  - Falha ao enviar para $userEmail\n";
            }
        } catch (Exception $e) {
            $failed += count($userNotifications);
            echo "  - Erro ao enviar para $userEmail: {$e->getMessage()}\n";
        }
    }
    
    echo "[" . date('Y-m-d H:i:s') . "] Envio concluído!\n";
    echo "  - Enviadas: $sent\n";
    echo "  - Falhas: $failed\n";
    
} catch (Exception $e) {
    echo "[" . date('Y-m-d H:i:s') . "] ERRO: " . $e->getMessage() . "\n";
}

/**
 * Enviar email de notificação
 */
function sendNotificationEmail($toEmail, $notifications) {
    // Buscar configurações do sistema
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
    $stmt->execute(['notification_email_from']);
    $fromEmail = $stmt->fetchColumn() ?: 'noreply@macip.com.br';
    
    $stmt->execute(['company_name']);
    $companyName = $stmt->fetchColumn() ?: 'Macip Tecnologia';
    
    // Agrupar por prioridade
    $critical = [];
    $high = [];
    $normal = [];
    
    foreach ($notifications as $notification) {
        switch ($notification['priority']) {
            case 'critical':
                $critical[] = $notification;
                break;
            case 'high':
                $high[] = $notification;
                break;
            default:
                $normal[] = $notification;
        }
    }
    
    // Gerar HTML do email
    $html = generateEmailHTML($companyName, $critical, $high, $normal);
    
    // Enviar email
    $subject = count($notifications) === 1 
        ? $notifications[0]['title']
        : "Você tem " . count($notifications) . " notificações - $companyName";
    
    return sendEmail($toEmail, $fromEmail, $subject, $html);
}

/**
 * Gerar HTML do email
 */
function generateEmailHTML($companyName, $critical, $high, $normal) {
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .notification { border-left: 4px solid #ddd; padding: 15px; margin: 15px 0; background: #f9f9f9; }
            .notification.critical { border-color: #dc2626; background: #fee2e2; }
            .notification.high { border-color: #f59e0b; background: #fef3c7; }
            .notification.normal { border-color: #3b82f6; background: #dbeafe; }
            .notification-title { font-weight: bold; margin-bottom: 5px; }
            .notification-message { color: #666; }
            .notification-time { font-size: 12px; color: #999; margin-top: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>' . htmlspecialchars($companyName) . '</h1>
                <p>Dashboard de Licenças - Notificações</p>
            </div>
            
            <div style="padding: 20px;">';
    
    if (!empty($critical)) {
        $html .= '<h2 style="color: #dc2626;">🚨 Críticas</h2>';
        foreach ($critical as $n) {
            $html .= formatNotification($n, 'critical');
        }
    }
    
    if (!empty($high)) {
        $html .= '<h2 style="color: #f59e0b;">⚠️ Alta Prioridade</h2>';
        foreach ($high as $n) {
            $html .= formatNotification($n, 'high');
        }
    }
    
    if (!empty($normal)) {
        $html .= '<h2 style="color: #3b82f6;">ℹ️ Informações</h2>';
        foreach ($normal as $n) {
            $html .= formatNotification($n, 'normal');
        }
    }
    
    $html .= '
            </div>
            
            <div class="footer">
                <p>Este é um email automático. Por favor, não responda.</p>
                <p>Para gerenciar suas notificações, acesse o dashboard.</p>
            </div>
        </div>
    </body>
    </html>';
    
    return $html;
}

/**
 * Formatar notificação individual
 */
function formatNotification($notification, $priority) {
    $time = date('d/m/Y H:i', strtotime($notification['created_at']));
    
    return '
    <div class="notification ' . $priority . '">
        <div class="notification-title">' . htmlspecialchars($notification['title']) . '</div>
        <div class="notification-message">' . htmlspecialchars($notification['message'] ?? '') . '</div>
        <div class="notification-time">' . $time . '</div>
    </div>';
}

/**
 * Enviar email usando PHP mail() ou SMTP
 */
function sendEmail($to, $from, $subject, $htmlBody) {
    // Verificar se deve usar SMTP ou mail()
    $useSmtp = getenv('SMTP_HOST') !== false;
    
    if ($useSmtp) {
        return sendEmailSMTP($to, $from, $subject, $htmlBody);
    } else {
        return sendEmailPHP($to, $from, $subject, $htmlBody);
    }
}

/**
 * Enviar email via PHP mail()
 */
function sendEmailPHP($to, $from, $subject, $htmlBody) {
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . $from,
        'Reply-To: ' . $from,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    return mail($to, $subject, $htmlBody, implode("\r\n", $headers));
}

/**
 * Enviar email via SMTP (usando PHPMailer se disponível)
 */
function sendEmailSMTP($to, $from, $subject, $htmlBody) {
    // Verificar se PHPMailer está disponível
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        // Fallback para mail()
        return sendEmailPHP($to, $from, $subject, $htmlBody);
    }
    
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    
    try {
        // Configurações SMTP
        $mail->isSMTP();
        $mail->Host = getenv('SMTP_HOST');
        $mail->SMTPAuth = true;
        $mail->Username = getenv('SMTP_USER');
        $mail->Password = getenv('SMTP_PASS');
        $mail->SMTPSecure = getenv('SMTP_SECURE') ?: 'tls';
        $mail->Port = getenv('SMTP_PORT') ?: 587;
        $mail->CharSet = 'UTF-8';
        
        // Remetente e destinatário
        $mail->setFrom($from);
        $mail->addAddress($to);
        
        // Conteúdo
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Erro ao enviar email SMTP: {$mail->ErrorInfo}");
        return false;
    }
}
