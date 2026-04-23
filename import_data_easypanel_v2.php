<?php
// import_data_easypanel_v2.php - Versão corrigida com tratamento de erros

require_once 'srv/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json; charset=UTF-8');
    
    try {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['tables'])) {
            throw new Exception('JSON inválido ou sem dados');
        }
        
        $pdo->beginTransaction();
        
        // Desabilitar foreign key checks temporariamente
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');
        
        $results = [
            'imported' => [],
            'errors' => [],
            'warnings' => []
        ];
        
        // Ordem correta de importação (clientes antes de licenças)
        $importOrder = [
            'o365_clients',
            'gmail_clients',
            'bitdefender_licenses',
            'fortigate_devices',
            'o365_licenses',
            'gmail_licenses'
        ];
        
        foreach ($importOrder as $table) {
            if (!isset($data['tables'][$table])) {
                continue;
            }
            
            $tableData = $data['tables'][$table];
            
            try {
                // Limpar tabela
                $pdo->exec("DELETE FROM $table");
                
                $imported = 0;
                $skipped = 0;
                
                foreach ($tableData['data'] as $row) {
                    try {
                        // Corrigir datas inválidas
                        foreach ($row as $key => $value) {
                            if (strpos($key, 'date') !== false || $key === 'expiration_date' || $key === 'created_at' || $key === 'updated_at') {
                                if ($value === '0000-00-00' || $value === '0000-00-00 00:00:00' || empty($value)) {
                                    $row[$key] = null;
                                }
                            }
                        }
                        
                        // Construir INSERT
                        $columns = array_keys($row);
                        $placeholders = array_fill(0, count($columns), '?');
                        
                        $sql = "INSERT INTO $table (" . implode(', ', $columns) . ") 
                                VALUES (" . implode(', ', $placeholders) . ")";
                        
                        $stmt = $pdo->prepare($sql);
                        $stmt->execute(array_values($row));
                        $imported++;
                        
                    } catch (Exception $e) {
                        $skipped++;
                        $results['warnings'][] = "$table row skipped: " . $e->getMessage();
                    }
                }
                
                $results['imported'][$table] = $imported;
                if ($skipped > 0) {
                    $results['imported'][$table] .= " ($skipped skipped)";
                }
                
            } catch (Exception $e) {
                $results['errors'][$table] = $e->getMessage();
            }
        }
        
        // Reabilitar foreign key checks
        $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Dados importados com sucesso',
            'results' => $results
        ], JSON_PRETTY_PRINT);
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
    
} else {
    // GET - Mostrar formulário
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Importar Dados - DashLicenças v2</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
            }
            .container {
                border: 2px solid #007bff;
                border-radius: 8px;
                padding: 30px;
                background: #f8f9fa;
            }
            h1 {
                color: #007bff;
                margin-top: 0;
            }
            .version {
                background: #28a745;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                display: inline-block;
                margin-left: 10px;
            }
            .step {
                background: white;
                padding: 15px;
                margin: 15px 0;
                border-left: 4px solid #28a745;
                border-radius: 4px;
            }
            .warning {
                background: #fff3cd;
                border-left-color: #ffc107;
                color: #856404;
            }
            .info {
                background: #d1ecf1;
                border-left-color: #17a2b8;
                color: #0c5460;
            }
            button {
                background: #007bff;
                color: white;
                border: none;
                padding: 12px 24px;
                font-size: 16px;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
            }
            button:hover {
                background: #0056b3;
            }
            #result {
                margin-top: 20px;
                padding: 15px;
                border-radius: 4px;
                display: none;
            }
            .success {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            .error {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            input[type="file"] {
                margin: 15px 0;
                padding: 10px;
                border: 2px dashed #007bff;
                border-radius: 4px;
                width: 100%;
            }
            pre {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
                overflow: auto;
                max-height: 400px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔄 Importar Dados da Hostgator <span class="version">v2 - Corrigido</span></h1>
            
            <div class="step info">
                <strong>✨ Melhorias nesta versão:</strong><br>
                • Corrige datas inválidas (0000-00-00)<br>
                • Ordem correta de importação (clientes antes de licenças)<br>
                • Desabilita foreign keys temporariamente<br>
                • Continua importação mesmo com erros individuais
            </div>
            
            <div class="step warning">
                <strong>⚠️ ATENÇÃO:</strong> Esta operação irá substituir todos os dados atuais 
                (exceto usuários). Faça backup antes de continuar!
            </div>
            
            <div class="step">
                <strong>Passo 1:</strong> Baixe o arquivo de exportação da Hostgator<br>
                Acesse: <code>https://macip.com.br/dashlicencas/export_data_hostgator.php</code>
            </div>
            
            <div class="step">
                <strong>Passo 2:</strong> Selecione o arquivo JSON baixado
                <input type="file" id="fileInput" accept=".json">
            </div>
            
            <div class="step">
                <strong>Passo 3:</strong> Clique em importar
                <button onclick="importData()">🚀 Importar Dados</button>
            </div>
            
            <div id="result"></div>
        </div>
        
        <script>
            function importData() {
                const fileInput = document.getElementById('fileInput');
                const resultDiv = document.getElementById('result');
                
                if (!fileInput.files.length) {
                    alert('Selecione um arquivo JSON primeiro!');
                    return;
                }
                
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const data = e.target.result;
                    
                    resultDiv.innerHTML = '⏳ Importando dados...';
                    resultDiv.className = '';
                    resultDiv.style.display = 'block';
                    
                    fetch('/import_data_easypanel_v2.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: data
                    })
                    .then(r => r.json())
                    .then(result => {
                        if (result.success) {
                            resultDiv.className = 'success';
                            let html = '<h3>✅ Importação Concluída!</h3>';
                            html += '<h4>Registros Importados:</h4>';
                            html += '<pre>' + JSON.stringify(result.results.imported, null, 2) + '</pre>';
                            
                            if (Object.keys(result.results.errors).length > 0) {
                                html += '<h4 style="color: #856404;">⚠️ Erros:</h4>';
                                html += '<pre>' + JSON.stringify(result.results.errors, null, 2) + '</pre>';
                            }
                            
                            if (result.results.warnings && result.results.warnings.length > 0) {
                                html += '<h4 style="color: #856404;">⚠️ Avisos (' + result.results.warnings.length + '):</h4>';
                                html += '<pre>' + result.results.warnings.slice(0, 10).join('\n') + '</pre>';
                                if (result.results.warnings.length > 10) {
                                    html += '<p>... e mais ' + (result.results.warnings.length - 10) + ' avisos</p>';
                                }
                            }
                            
                            html += '<p><strong>Próximo passo:</strong> Faça logout e login novamente.</p>';
                            resultDiv.innerHTML = html;
                        } else {
                            resultDiv.className = 'error';
                            resultDiv.innerHTML = `
                                <h3>❌ Erro na Importação</h3>
                                <p>${result.error}</p>
                                <pre>${result.trace || ''}</pre>
                            `;
                        }
                    })
                    .catch(error => {
                        resultDiv.className = 'error';
                        resultDiv.innerHTML = `
                            <h3>❌ Erro</h3>
                            <p>${error.message}</p>
                        `;
                    });
                };
                
                reader.readAsText(file);
            }
        </script>
    </body>
    </html>
    <?php
}
