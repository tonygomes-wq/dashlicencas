<?php
// api/gmail.php - CRUD for Gmail Clients and Licenses
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['type'] ?? 'clients'; // 'clients' or 'licenses'
$user_id = $_SESSION['user_id'];

switch ($method) {
    case 'GET':
        if ($type === 'clients') {
            $stmt = $pdo->prepare('SELECT * FROM gmail_clients');
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        } else {
            $stmt = $pdo->prepare('SELECT * FROM gmail_licenses');
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $_GET['do'] ?? '';

        // Handle bulk insert for licenses
        if ($action === 'bulk_create' && $type === 'licenses') {
            $licenses = $data['licenses'] ?? [];
            if (empty($licenses)) {
                http_response_code(400);
                echo json_encode(['error' => 'No licenses provided']);
                exit;
            }

            $pdo->beginTransaction();
            try {
                $insertedLicenses = [];
                $sql = "INSERT INTO gmail_licenses (client_id, user_id, username, email, password, license_type, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);

                foreach ($licenses as $license) {
                    $stmt->execute([
                        $license['client_id'],
                        $user_id,
                        $license['username'] ?? null,
                        $license['email'] ?? null,
                        $license['password'] ?? null,
                        $license['license_type'] ?? null,
                        $license['renewal_status'] ?? 'Pendente'
                    ]);
                    $new_id = $pdo->lastInsertId();
                    $selectStmt = $pdo->prepare('SELECT * FROM gmail_licenses WHERE id = ?');
                    $selectStmt->execute([$new_id]);
                    $insertedLicenses[] = $selectStmt->fetch();
                }

                $pdo->commit();
                echo json_encode($insertedLicenses);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to insert licenses: ' . $e->getMessage()]);
            }
            break;
        }

        // Handle bulk insert for client with licenses
        if ($action === 'create_with_licenses' && $type === 'clients') {
            $clientData = $data['client'] ?? null;
            $licenses = $data['licenses'] ?? [];

            if (!$clientData) {
                http_response_code(400);
                echo json_encode(['error' => 'Client data is required']);
                exit;
            }

            $pdo->beginTransaction();
            try {
                // Insert client
                $id = $clientData['id'] ?? bin2hex(random_bytes(16));
                $sql = "INSERT INTO gmail_clients (id, user_id, client_name, contact_email) VALUES (?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $id,
                    $user_id,
                    $clientData['client_name'] ?? null,
                    $clientData['contact_email'] ?? null
                ]);

                // Insert licenses if provided
                $insertedLicenses = [];
                if (!empty($licenses)) {
                    $licenseSql = "INSERT INTO gmail_licenses (client_id, user_id, username, email, password, license_type, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    $licenseStmt = $pdo->prepare($licenseSql);

                    foreach ($licenses as $license) {
                        $licenseStmt->execute([
                            $id,
                            $user_id,
                            $license['username'] ?? null,
                            $license['email'] ?? null,
                            $license['password'] ?? null,
                            $license['license_type'] ?? null,
                            $license['renewal_status'] ?? 'Pendente'
                        ]);
                        $license_id = $pdo->lastInsertId();
                        $selectStmt = $pdo->prepare('SELECT * FROM gmail_licenses WHERE id = ?');
                        $selectStmt->execute([$license_id]);
                        $insertedLicenses[] = $selectStmt->fetch();
                    }
                }

                $pdo->commit();

                // Return client and licenses
                $stmt = $pdo->prepare('SELECT * FROM gmail_clients WHERE id = ?');
                $stmt->execute([$id]);
                $client = $stmt->fetch();

                echo json_encode([
                    'client' => $client,
                    'licenses' => $insertedLicenses
                ]);
            } catch (Exception $e) {
                $pdo->rollBack();
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create client: ' . $e->getMessage()]);
            }
            break;
        }

        // Regular single insert
        if ($type === 'clients') {
            $id = $data['id'] ?? bin2hex(random_bytes(16));
            $sql = "INSERT INTO gmail_clients (id, user_id, client_name, contact_email) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $id,
                $user_id,
                $data['client_name'] ?? null,
                $data['contact_email'] ?? null
            ]);
            $stmt = $pdo->prepare('SELECT * FROM gmail_clients WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode($stmt->fetch());
        } else {
            $sql = "INSERT INTO gmail_licenses (client_id, user_id, username, email, password, license_type, renewal_status) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['client_id'],
                $user_id,
                $data['username'] ?? null,
                $data['email'] ?? null,
                $data['password'] ?? null,
                $data['license_type'] ?? null,
                $data['renewal_status'] ?? 'Pendente'
            ]);
            $new_id = $pdo->lastInsertId();
            $stmt = $pdo->prepare('SELECT * FROM gmail_licenses WHERE id = ?');
            $stmt->execute([$new_id]);
            echo json_encode($stmt->fetch());
        }
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        $params = [];
        foreach ($data as $key => $value) {
            if ($key === 'id' || $key === 'user_id' || $key === 'created_at') continue;
            $fields[] = "$key = ?";
            $params[] = $value;
        }
        $params[] = $id;
        $table = ($type === 'clients') ? 'gmail_clients' : 'gmail_licenses';
        $sql = "UPDATE $table SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $stmt = $pdo->prepare("SELECT * FROM $table WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode($stmt->fetch());
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        $table = ($type === 'clients') ? 'gmail_clients' : 'gmail_licenses';
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            $data = json_decode(file_get_contents('php://input'), true);
            $ids = $data['ids'] ?? null;
            if (!$ids || !is_array($ids)) {
                http_response_code(400);
                echo json_encode(['error' => 'IDs are required']);
                exit;
            }
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "DELETE FROM $table WHERE id IN ($placeholders)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($ids);
            echo json_encode(['success' => true, 'count' => $stmt->rowCount()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
