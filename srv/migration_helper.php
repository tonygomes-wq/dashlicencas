<?php
// api/migration_helper.php - Script para importar CSVs do Supabase para MySQL
require_once 'config.php';

// Aumentar tempo de execução para imports grandes
set_time_limit(300);

echo "<h1>Iniciando Migração de Dados</h1>";

$files = [
    'bitdefender_licenses' => 'bitdefender_licenses.csv',
    'fortigate_devices'    => 'fortigate_devices.csv',
    'o365_clients'         => 'o365_clients.csv',
    'o365_licenses'        => 'o365_licenses.csv',
    'gmail_clients'        => 'gmail_clients.csv',
    'gmail_licenses'       => 'gmail_licenses.csv'
];

$userId = 1; // ID do usuário suporte@macip.com.br no MySQL

foreach ($files as $table => $filename) {
    $filePath = __DIR__ . '/' . $filename;

    if (!file_exists($filePath)) {
        echo "<p style='color: orange;'>Aviso: Arquivo <b>$filename</b> não encontrado na pasta /api. Pulando...</p>";
        continue;
    }

    echo "<p>Processando <b>$table</b>...</p>";

    if (($handle = fopen($filePath, "r")) !== FALSE) {
        // Ler cabeçalho
        $headers = fgetcsv($handle, 1000, ",");
        if (!$headers) {
            fclose($handle);
            continue;
        }

        // Limpar a tabela antes de importar (OPCIONAL - Cuidado!)
        // $pdo->exec("DELETE FROM $table");

        $count = 0;
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $row = array_combine($headers, $data);

            // Mapeamento e Limpeza
            $insertData = [];

            if ($table === 'bitdefender_licenses') {
                $sql = "INSERT INTO bitdefender_licenses (user_id, company, contact_person, email, expiration_date, total_licenses, license_key, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $insertData = [
                    $userId,
                    $row['company'] ?? null,
                    $row['contact_person'] ?? null,
                    $row['email'] ?? null,
                    $row['expiration_date'] ?? null,
                    $row['total_licenses'] ?? 0,
                    $row['license_key'] ?? null,
                    $row['renewal_status'] ?? 'Pendente'
                ];
            } elseif ($table === 'fortigate_devices') {
                $sql = "INSERT INTO fortigate_devices (user_id, serial, model, client, vencimento, registration_date, email, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $insertData = [
                    $userId,
                    $row['serial'] ?? null,
                    $row['model'] ?? null,
                    $row['client'] ?? null,
                    $row['vencimento'] ?? null,
                    $row['registration_date'] ?? null,
                    $row['email'] ?? null,
                    $row['renewal_status'] ?? 'Pendente'
                ];
            } elseif ($table === 'o365_clients' || $table === 'gmail_clients') {
                $sql = "INSERT INTO $table (id, user_id, client_name, contact_email) VALUES (?, ?, ?, ?)";
                $insertData = [
                    $row['id'] ?? null,
                    $userId,
                    $row['client_name'] ?? null,
                    $row['contact_email'] ?? null
                ];
            } elseif ($table === 'o365_licenses' || $table === 'gmail_licenses') {
                $sql = "INSERT INTO $table (client_id, user_id, username, email, password, license_type, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?)";
                $insertData = [
                    $row['client_id'] ?? null,
                    $userId,
                    $row['username'] ?? null,
                    $row['email'] ?? null,
                    $row['password'] ?? null,
                    $row['license_type'] ?? null,
                    $row['renewal_status'] ?? 'Pendente'
                ];
            }

            if (!empty($insertData)) {
                try {
                    $stmt = $pdo->prepare($sql);
                    $stmt->execute($insertData);
                    $count++;
                } catch (Exception $e) {
                    echo "<p style='color: red;'>Erro na linha $count de $table: " . $e->getMessage() . "</p>";
                }
            }
        }
        fclose($handle);
        echo "<p style='color: green;'>Sucesso: <b>$count</b> registros importados para <b>$table</b>.</p>";
    }
}

echo "<h2>Migração Concluída!</h2>";
echo "<p>Delete este arquivo (api/migration_helper.php) por segurança após o uso.</p>";
