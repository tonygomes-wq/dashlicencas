<?php
// app_hr.php - API para Gestão de Recursos Humanos
session_start();

require_once 'srv/config.php';
require_once 'srv/permissions.php';

header('Content-Type: application/json; charset=UTF-8');

// Verificar autenticação
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Verificar permissão de acesso ao dashboard RH
if (!hasPermission('hr')) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden: You do not have access to HR module']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['type'] ?? 'employees'; // employees, vacations, leaves, benefits, documents, stats
$user_id = $_SESSION['user_id'];

// ============================================================================
// MÉTODOS GET
// ============================================================================
if ($method === 'GET') {
    
    // --------------------------------------------------------------------
    // EMPLOYEES - Listar ou buscar funcionários
    // --------------------------------------------------------------------
    if ($type === 'employees') {
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            // Buscar funcionário específico
            $stmt = $pdo->prepare('SELECT * FROM hr_employees WHERE id = ?');
            $stmt->execute([$id]);
            $employee = $stmt->fetch();
            
            if (!$employee) {
                http_response_code(404);
                echo json_encode(['error' => 'Employee not found']);
                exit;
            }
            
            echo json_encode($employee);
        } else {
            // Listar todos os funcionários
            $sql = 'SELECT * FROM hr_employees ORDER BY full_name ASC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            echo json_encode($stmt->fetchAll());
        }
    }
    
    // --------------------------------------------------------------------
    // VACATIONS - Listar férias
    // --------------------------------------------------------------------
    elseif ($type === 'vacations') {
        $employeeId = $_GET['employee_id'] ?? null;
        
        if ($employeeId) {
            // Férias de um funcionário específico
            $sql = 'SELECT v.*, e.full_name as employee_name 
                    FROM hr_vacations v
                    LEFT JOIN hr_employees e ON v.employee_id = e.id
                    WHERE v.employee_id = ?
                    ORDER BY v.vacation_start DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$employeeId]);
        } else {
            // Todas as férias
            $sql = 'SELECT v.*, e.full_name as employee_name 
                    FROM hr_vacations v
                    LEFT JOIN hr_employees e ON v.employee_id = e.id
                    ORDER BY v.vacation_start DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        }
        
        echo json_encode($stmt->fetchAll());
    }
    
    // --------------------------------------------------------------------
    // LEAVES - Listar afastamentos
    // --------------------------------------------------------------------
    elseif ($type === 'leaves') {
        $employeeId = $_GET['employee_id'] ?? null;
        
        if ($employeeId) {
            // Afastamentos de um funcionário específico
            $sql = 'SELECT l.*, e.full_name as employee_name 
                    FROM hr_leaves l
                    LEFT JOIN hr_employees e ON l.employee_id = e.id
                    WHERE l.employee_id = ?
                    ORDER BY l.start_date DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$employeeId]);
        } else {
            // Todos os afastamentos
            $sql = 'SELECT l.*, e.full_name as employee_name 
                    FROM hr_leaves l
                    LEFT JOIN hr_employees e ON l.employee_id = e.id
                    ORDER BY l.start_date DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        }
        
        echo json_encode($stmt->fetchAll());
    }
    
    // --------------------------------------------------------------------
    // BENEFITS - Listar benefícios
    // --------------------------------------------------------------------
    elseif ($type === 'benefits') {
        $employeeId = $_GET['employee_id'] ?? null;
        
        if ($employeeId) {
            // Benefícios de um funcionário específico
            $sql = 'SELECT b.*, e.full_name as employee_name 
                    FROM hr_benefits b
                    LEFT JOIN hr_employees e ON b.employee_id = e.id
                    WHERE b.employee_id = ?
                    ORDER BY b.start_date DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$employeeId]);
        } else {
            // Todos os benefícios
            $sql = 'SELECT b.*, e.full_name as employee_name 
                    FROM hr_benefits b
                    LEFT JOIN hr_employees e ON b.employee_id = e.id
                    ORDER BY b.start_date DESC';
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        }
        
        echo json_encode($stmt->fetchAll());
    }
    
    // --------------------------------------------------------------------
    // DOCUMENTS - Listar documentos
    // --------------------------------------------------------------------
    elseif ($type === 'documents') {
        $employeeId = $_GET['employee_id'] ?? null;
        
        if (!$employeeId) {
            http_response_code(400);
            echo json_encode(['error' => 'employee_id is required']);
            exit;
        }
        
        $sql = 'SELECT d.*, u.username as uploaded_by_name
                FROM hr_documents d
                LEFT JOIN users u ON d.uploaded_by = u.id
                WHERE d.employee_id = ?
                ORDER BY d.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$employeeId]);
        
        echo json_encode($stmt->fetchAll());
    }
    
    // --------------------------------------------------------------------
    // STATS - Estatísticas do dashboard
    // --------------------------------------------------------------------
    elseif ($type === 'stats') {
        $stats = [];
        
        // Total de funcionários
        $stmt = $pdo->query('SELECT COUNT(*) as total FROM hr_employees');
        $stats['total_employees'] = $stmt->fetch()['total'];
        
        // Por status
        $stmt = $pdo->query('SELECT status, COUNT(*) as count FROM hr_employees GROUP BY status');
        $stats['by_status'] = $stmt->fetchAll();
        
        // Por departamento
        $stmt = $pdo->query('SELECT department, COUNT(*) as count FROM hr_employees WHERE department IS NOT NULL GROUP BY department ORDER BY count DESC');
        $stats['by_department'] = $stmt->fetchAll();
        
        // Por tipo de contrato
        $stmt = $pdo->query('SELECT contract_type, COUNT(*) as count FROM hr_employees GROUP BY contract_type');
        $stats['by_contract'] = $stmt->fetchAll();
        
        // Aniversariantes do mês
        $stmt = $pdo->query('SELECT id, full_name, birth_date FROM hr_employees WHERE MONTH(birth_date) = MONTH(CURDATE()) ORDER BY DAY(birth_date)');
        $stats['birthdays_this_month'] = $stmt->fetchAll();
        
        // Férias programadas (próximos 30 dias)
        $stmt = $pdo->query('SELECT v.*, e.full_name as employee_name 
                            FROM hr_vacations v
                            LEFT JOIN hr_employees e ON v.employee_id = e.id
                            WHERE v.vacation_start BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                            AND v.status IN ("Aprovada", "Solicitada")
                            ORDER BY v.vacation_start');
        $stats['upcoming_vacations'] = $stmt->fetchAll();
        
        // Afastamentos ativos
        $stmt = $pdo->query('SELECT l.*, e.full_name as employee_name 
                            FROM hr_leaves l
                            LEFT JOIN hr_employees e ON l.employee_id = e.id
                            WHERE l.status = "Ativo"
                            ORDER BY l.start_date DESC');
        $stats['active_leaves'] = $stmt->fetchAll();
        
        echo json_encode($stats);
    }
    
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type parameter']);
    }
}

// ============================================================================
// MÉTODOS POST
// ============================================================================
elseif ($method === 'POST') {
    
    // Verificar permissão de edição
    if (!hasPermission('hr', 'edit')) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have permission to create records']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // --------------------------------------------------------------------
    // EMPLOYEES - Criar funcionário
    // --------------------------------------------------------------------
    if ($type === 'employees') {
        // Validar campos obrigatórios
        if (empty($data['full_name']) || empty($data['cpf']) || empty($data['position']) || empty($data['hire_date']) || empty($data['contract_type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: full_name, cpf, position, hire_date, contract_type']);
            exit;
        }
        
        // Verificar se CPF já existe
        $stmt = $pdo->prepare('SELECT id FROM hr_employees WHERE cpf = ?');
        $stmt->execute([$data['cpf']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'CPF already exists']);
            exit;
        }
        
        $sql = "INSERT INTO hr_employees (
            user_id, full_name, cpf, rg, rg_issuer, rg_issue_date, birth_date, gender, marital_status, nationality,
            personal_email, corporate_email, phone, mobile_phone,
            zip_code, street, number, complement, neighborhood, city, state,
            position, department, hire_date, termination_date, contract_type, status, salary, work_hours,
            notes, photo_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $user_id,
            $data['full_name'],
            $data['cpf'],
            $data['rg'] ?? null,
            $data['rg_issuer'] ?? null,
            $data['rg_issue_date'] ?? null,
            $data['birth_date'] ?? null,
            $data['gender'] ?? null,
            $data['marital_status'] ?? null,
            $data['nationality'] ?? 'Brasileira',
            $data['personal_email'] ?? null,
            $data['corporate_email'] ?? null,
            $data['phone'] ?? null,
            $data['mobile_phone'] ?? null,
            $data['zip_code'] ?? null,
            $data['street'] ?? null,
            $data['number'] ?? null,
            $data['complement'] ?? null,
            $data['neighborhood'] ?? null,
            $data['city'] ?? null,
            $data['state'] ?? null,
            $data['position'],
            $data['department'] ?? null,
            $data['hire_date'],
            $data['termination_date'] ?? null,
            $data['contract_type'],
            $data['status'] ?? 'Ativo',
            $data['salary'] ?? null,
            $data['work_hours'] ?? null,
            $data['notes'] ?? null,
            $data['photo_url'] ?? null
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM hr_employees WHERE id = ?');
        $stmt->execute([$newId]);
        echo json_encode($stmt->fetch());
    }
    
    // --------------------------------------------------------------------
    // VACATIONS - Solicitar férias
    // --------------------------------------------------------------------
    elseif ($type === 'vacations') {
        // Validar campos obrigatórios
        if (empty($data['employee_id']) || empty($data['vacation_start']) || empty($data['vacation_end']) || empty($data['days_requested'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        $sql = "INSERT INTO hr_vacations (
            employee_id, acquisition_start, acquisition_end, vacation_start, vacation_end, 
            days_requested, cash_bonus_days, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['employee_id'],
            $data['acquisition_start'] ?? null,
            $data['acquisition_end'] ?? null,
            $data['vacation_start'],
            $data['vacation_end'],
            $data['days_requested'],
            $data['cash_bonus_days'] ?? 0,
            $data['status'] ?? 'Solicitada',
            $data['notes'] ?? null
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM hr_vacations WHERE id = ?');
        $stmt->execute([$newId]);
        echo json_encode($stmt->fetch());
    }
    
    // --------------------------------------------------------------------
    // LEAVES - Registrar afastamento
    // --------------------------------------------------------------------
    elseif ($type === 'leaves') {
        // Validar campos obrigatórios
        if (empty($data['employee_id']) || empty($data['leave_type']) || empty($data['start_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        $sql = "INSERT INTO hr_leaves (
            employee_id, leave_type, start_date, expected_return_date, actual_return_date,
            reason, notes, document_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['employee_id'],
            $data['leave_type'],
            $data['start_date'],
            $data['expected_return_date'] ?? null,
            $data['actual_return_date'] ?? null,
            $data['reason'] ?? null,
            $data['notes'] ?? null,
            $data['document_url'] ?? null,
            $data['status'] ?? 'Ativo'
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM hr_leaves WHERE id = ?');
        $stmt->execute([$newId]);
        echo json_encode($stmt->fetch());
    }
    
    // --------------------------------------------------------------------
    // BENEFITS - Adicionar benefício
    // --------------------------------------------------------------------
    elseif ($type === 'benefits') {
        // Validar campos obrigatórios
        if (empty($data['employee_id']) || empty($data['benefit_type']) || empty($data['start_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }
        
        $sql = "INSERT INTO hr_benefits (
            employee_id, benefit_type, description, monthly_value, start_date, end_date, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['employee_id'],
            $data['benefit_type'],
            $data['description'] ?? null,
            $data['monthly_value'] ?? null,
            $data['start_date'],
            $data['end_date'] ?? null,
            $data['status'] ?? 'Ativo',
            $data['notes'] ?? null
        ]);
        
        $newId = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM hr_benefits WHERE id = ?');
        $stmt->execute([$newId]);
        echo json_encode($stmt->fetch());
    }
    
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type parameter']);
    }
}

// ============================================================================
// MÉTODOS PUT
// ============================================================================
elseif ($method === 'PUT') {
    
    // Verificar permissão de edição
    if (!hasPermission('hr', 'edit')) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have permission to update records']);
        exit;
    }
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Determinar a tabela baseada no tipo
    $tables = [
        'employees' => 'hr_employees',
        'vacations' => 'hr_vacations',
        'leaves' => 'hr_leaves',
        'benefits' => 'hr_benefits'
    ];
    
    if (!isset($tables[$type])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type parameter']);
        exit;
    }
    
    $table = $tables[$type];
    
    // Construir query dinamicamente
    $fields = [];
    $params = [];
    
    foreach ($data as $key => $value) {
        // Não permitir atualização desses campos
        if (in_array($key, ['id', 'user_id', 'created_at', 'uploaded_by'])) {
            continue;
        }
        $fields[] = "$key = ?";
        $params[] = $value;
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        exit;
    }
    
    $params[] = $id;
    $sql = "UPDATE $table SET " . implode(', ', $fields) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Retornar registro atualizado
    $stmt = $pdo->prepare("SELECT * FROM $table WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
}

// ============================================================================
// MÉTODOS DELETE
// ============================================================================
elseif ($method === 'DELETE') {
    
    // Verificar permissão de exclusão
    if (!hasPermission('hr', 'delete')) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: You do not have permission to delete records']);
        exit;
    }
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        exit;
    }
    
    // Determinar a tabela baseada no tipo
    $tables = [
        'employees' => 'hr_employees',
        'vacations' => 'hr_vacations',
        'leaves' => 'hr_leaves',
        'benefits' => 'hr_benefits',
        'documents' => 'hr_documents'
    ];
    
    if (!isset($tables[$type])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type parameter']);
        exit;
    }
    
    $table = $tables[$type];
    
    $stmt = $pdo->prepare("DELETE FROM $table WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'deleted' => $stmt->rowCount()]);
}

// ============================================================================
// MÉTODO NÃO PERMITIDO
// ============================================================================
else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

