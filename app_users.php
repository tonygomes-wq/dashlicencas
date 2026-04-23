<?php
// Set JSON header immediately
header('Content-Type: application/json; charset=UTF-8');

// Suppress errors and warnings that might corrupt JSON output
ini_set('display_errors', 0);
error_reporting(E_ALL);

session_start();

require_once 'srv/config.php';
require_once 'srv/permissions.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check if user is admin
$stmt = $pdo->prepare('SELECT role FROM users WHERE id = ?');
$stmt->execute([$_SESSION['user_id']]);
$currentUser = $stmt->fetch();

if (!$currentUser || $currentUser['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden - Admin access required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['do'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            // List all users (excluding password_hash and 2FA secret)
            $stmt = $pdo->prepare('SELECT id, email, role, is_active, permissions, two_factor_enabled, last_login, created_at FROM users ORDER BY created_at DESC');
            $stmt->execute();
            $users = $stmt->fetchAll();

            // Deep decode permissions for each user
            foreach ($users as &$user) {
                if (isset($user['permissions']) && $user['permissions']) {
                    $user['permissions'] = json_decode($user['permissions'], true);
                }
            }
            echo json_encode($users);
        } elseif ($action === 'get') {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }
            $stmt = $pdo->prepare('SELECT id, email, role, is_active, permissions, two_factor_enabled, last_login, created_at FROM users WHERE id = ?');
            $stmt->execute([$id]);
            $user = $stmt->fetch();
            if (!$user) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit;
            }
            if (isset($user['permissions']) && $user['permissions']) {
                $user['permissions'] = json_decode($user['permissions'], true);
            }
            echo json_encode($user);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'POST':
        if ($action === 'create') {
            $data = json_decode(file_get_contents('php://input'), true);
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            $role = $data['role'] ?? 'user';
            $is_active = $data['is_active'] ?? true;
            $permissions = isset($data['permissions']) ? json_encode($data['permissions']) : null;

            if (empty($email) || empty($password)) {
                http_response_code(400);
                echo json_encode(['error' => 'Email and password are required']);
                exit;
            }

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid email format']);
                exit;
            }

            // Check if email already exists
            $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists']);
                exit;
            }

            // Hash password
            $password_hash = password_hash($password, PASSWORD_DEFAULT);

            // Insert new user
            $stmt = $pdo->prepare('INSERT INTO users (email, password_hash, role, is_active, permissions) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$email, $password_hash, $role, $is_active, $permissions]);
            $new_id = $pdo->lastInsertId();

            // Return created user
            $stmt = $pdo->prepare('SELECT id, email, role, is_active, permissions, two_factor_enabled, last_login, created_at FROM users WHERE id = ?');
            $stmt->execute([$new_id]);
            $user = $stmt->fetch();
            if (isset($user['permissions']) && $user['permissions']) {
                $user['permissions'] = json_decode($user['permissions'], true);
            }
            echo json_encode($user);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'PUT':
        if ($action === 'update') {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }

            // Prevent admin from modifying their own account
            if ($id == $_SESSION['user_id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Cannot modify your own account']);
                exit;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            $fields = [];
            $params = [];

            // Allowed fields to update
            $allowedFields = ['email', 'role', 'is_active', 'permissions'];

            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = ?";
                    if ($field === 'permissions') {
                        $params[] = json_encode($data[$field]);
                    } else {
                        $params[] = $data[$field];
                    }
                }
            }

            // Handle password update separately
            if (isset($data['password']) && !empty($data['password'])) {
                $fields[] = "password_hash = ?";
                $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid fields to update']);
                exit;
            }

            $params[] = $id;
            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            // Return updated user
            $stmt = $pdo->prepare('SELECT id, email, role, is_active, permissions, two_factor_enabled, last_login, created_at FROM users WHERE id = ?');
            $stmt->execute([$id]);
            $user = $stmt->fetch();
            if (isset($user['permissions']) && $user['permissions']) {
                $user['permissions'] = json_decode($user['permissions'], true);
            }
            echo json_encode($user);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;

    case 'DELETE':
        if ($action === 'delete') {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'ID is required']);
                exit;
            }

            // Prevent admin from deleting their own account
            if ($id == $_SESSION['user_id']) {
                http_response_code(403);
                echo json_encode(['error' => 'Cannot delete your own account']);
                exit;
            }

            $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
