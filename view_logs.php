<?php
/**
 * Visualizador de Logs do PHP
 */

// Verificar se está logado como admin
session_start();
if (!isset($_SESSION['user_id'])) {
    die("Acesso negado. Faça login primeiro.");
}

$logFile = '/var/log/apache2/error.log';
$lines = isset($_GET['lines']) ? (int)$_GET['lines'] : 100;

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Logs do Sistema</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            margin: 0;
        }
        h1 {
            color: #4ec9b0;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
        }
        .controls {
            background: #252526;
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #3e3e42;
        }
        .controls a {
            color: #4fc3f7;
            text-decoration: none;
            padding: 8px 15px;
            background: #0e639c;
            border-radius: 3px;
            margin-right: 10px;
            display: inline-block;
        }
        .controls a:hover {
            background: #1177bb;
        }
        .log-container {
            background: #1e1e1e;
            border: 1px solid #3e3e42;
            padding: 15px;
            max-height: 600px;
            overflow-y: auto;
            font-size: 12px;
            line-height: 1.5;
        }
        .log-line {
            margin: 3px 0;
            padding: 5px;
            border-left: 3px solid transparent;
        }
        .log-line:hover {
            background: #2d2d2d;
        }
        .error {
            color: #f48771;
            border-left-color: #f48771;
            background: #2d1f1f;
        }
        .warning {
            color: #dcdcaa;
            border-left-color: #dcdcaa;
        }
        .info {
            color: #4ec9b0;
        }
        .bitdefender {
            background: #1f2d2d;
            border-left-color: #4ec9b0;
        }
        .timestamp {
            color: #858585;
        }
    </style>
</head>
<body>
    <h1>📋 Logs do Sistema</h1>
    
    <div class="controls">
        <a href="?lines=50">50 linhas</a>
        <a href="?lines=100">100 linhas</a>
        <a href="?lines=200">200 linhas</a>
        <a href="?lines=500">500 linhas</a>
        <a href="?refresh=1" onclick="location.reload(); return false;">🔄 Atualizar</a>
    </div>

    <div class="log-container">
        <?php
        if (file_exists($logFile)) {
            $command = "tail -n $lines $logFile 2>&1";
            $output = shell_exec($command);
            
            if ($output) {
                $logLines = explode("\n", $output);
                $logLines = array_reverse($logLines); // Mais recentes primeiro
                
                foreach ($logLines as $line) {
                    if (empty(trim($line))) continue;
                    
                    // Classificar linha
                    $class = 'log-line';
                    
                    if (stripos($line, 'error') !== false || stripos($line, 'fatal') !== false) {
                        $class .= ' error';
                    } elseif (stripos($line, 'warning') !== false) {
                        $class .= ' warning';
                    } elseif (stripos($line, 'bitdefender') !== false || stripos($line, 'report') !== false) {
                        $class .= ' bitdefender';
                    }
                    
                    // Escapar HTML
                    $line = htmlspecialchars($line);
                    
                    // Highlight timestamps
                    $line = preg_replace('/\[([\d\-\s:]+)\]/', '<span class="timestamp">[$1]</span>', $line);
                    
                    echo "<div class='$class'>$line</div>";
                }
            } else {
                echo "<div class='warning'>⚠️ Não foi possível ler o log</div>";
            }
        } else {
            echo "<div class='error'>❌ Arquivo de log não encontrado: $logFile</div>";
            echo "<div class='warning'>⚠️ Tentando localizar logs alternativos...</div>";
            
            // Tentar outros locais
            $altLogs = [
                '/var/log/php_errors.log',
                '/var/log/php/error.log',
                '/var/www/html/storage/logs/error.log',
                ini_get('error_log')
            ];
            
            foreach ($altLogs as $alt) {
                if ($alt && file_exists($alt)) {
                    echo "<div class='info'>✅ Encontrado: $alt</div>";
                    echo "<a href='?logfile=" . urlencode($alt) . "'>Ver este log</a><br>";
                }
            }
        }
        ?>
    </div>

    <div class="controls" style="margin-top: 20px;">
        <strong>Legenda:</strong>
        <div style="margin-top: 10px;">
            <div class="log-line error" style="display: inline-block; margin-right: 15px;">Erros</div>
            <div class="log-line warning" style="display: inline-block; margin-right: 15px;">Avisos</div>
            <div class="log-line bitdefender" style="display: inline-block; margin-right: 15px;">Bitdefender</div>
        </div>
    </div>

    <script>
        // Auto-scroll para o topo (logs mais recentes)
        window.scrollTo(0, 0);
    </script>
</body>
</html>
