<?php
/**
 * Login de Usuário
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
    
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email e senha são obrigatórios']);
        exit;
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, password, cpf, phone, is_admin FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        error_log("Login falhou: Usuário não encontrado - Email: " . $email);
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciais inválidas']);
        exit;
    }
    
    // Log para debug (remover em produção)
    error_log("Login tentativa - Email: " . $email . " - Hash no banco existe: " . (!empty($user['password']) ? 'sim' : 'não'));
    
    // Verificar senha
    if (empty($user['password']) || !password_verify($password, $user['password'])) {
        error_log("Login falhou: Senha incorreta ou hash inválido - Email: " . $email);
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciais inválidas']);
        exit;
    }
    
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['is_admin'] = $user['is_admin'];
    
    unset($user['password']);
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'Login realizado com sucesso'
    ]);
    
} catch (Exception $e) {
    error_log("Erro no login: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor']);
}

