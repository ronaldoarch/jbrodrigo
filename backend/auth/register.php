<?php
/**
 * Registro de Usuário
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../session-config.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../utils/auth-helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validações
    if (!isset($data['name']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nome é obrigatório']);
        exit;
    }
    
    if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email inválido']);
        exit;
    }
    
    if (!isset($data['password']) || strlen($data['password']) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Senha deve ter no mínimo 6 caracteres']);
        exit;
    }
    
    if (!isset($data['cpf']) || !validateCPF($data['cpf'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF inválido']);
        exit;
    }
    
    if (!isset($data['phone']) || empty($data['phone'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Telefone é obrigatório']);
        exit;
    }
    
    $name = trim($data['name']);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = password_hash($data['password'], PASSWORD_DEFAULT);
    $cpf = preg_replace('/[^0-9]/', '', $data['cpf']);
    $phone = preg_replace('/[^0-9]/', '', $data['phone']);
    $referredBy = isset($data['referral_code']) ? $data['referral_code'] : null;
    
    $db = getDB();
    
    // Verificar se email já existe
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email já cadastrado']);
        exit;
    }
    
    // Verificar se CPF já existe
    $stmt = $db->prepare("SELECT id FROM users WHERE cpf = ?");
    $stmt->execute([$cpf]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF já cadastrado']);
        exit;
    }
    
    // Buscar referrer se fornecido
    $referredById = null;
    if ($referredBy) {
        $stmt = $db->prepare("SELECT id FROM users WHERE referral_code = ?");
        $stmt->execute([$referredBy]);
        $referrer = $stmt->fetch();
        if ($referrer) {
            $referredById = $referrer['id'];
        }
    }
    
    // Criar usuário
    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, cpf, phone, referred_by) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $email, $password, $cpf, $phone, $referredById]);
    $userId = $db->lastInsertId();
    
    // Gerar código de referência
    $referralCode = generateReferralCode($userId);
    $stmt = $db->prepare("UPDATE users SET referral_code = ? WHERE id = ?");
    $stmt->execute([$referralCode, $userId]);
    
    // Criar carteira
    $stmt = $db->prepare("INSERT INTO wallets (user_id) VALUES (?)");
    $stmt->execute([$userId]);
    
    // Iniciar sessão
    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_name'] = $name;
    $_SESSION['is_admin'] = false;
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'name' => $name,
            'email' => $email,
            'cpf' => $cpf,
            'phone' => $phone,
            'referral_code' => $referralCode,
            'is_admin' => false
        ],
        'message' => 'Registro realizado com sucesso'
    ]);
    
} catch (PDOException $e) {
    error_log("Erro no registro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao criar conta']);
} catch (Exception $e) {
    error_log("Erro no registro: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}

