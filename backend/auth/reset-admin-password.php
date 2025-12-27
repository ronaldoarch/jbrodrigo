<?php
/**
 * Script para resetar senha de admin
 * USO TEMPORÁRIO - Remover após uso
 */

require_once __DIR__ . '/../scraper/config/database.php';

header('Content-Type: application/json');

// Permitir apenas em desenvolvimento ou com token de segurança
// Para produção, adicione uma verificação de token aqui

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['new_password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email e nova senha são obrigatórios']);
        exit;
    }
    
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $newPassword = $data['new_password'];
    
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Senha deve ter no mínimo 6 caracteres']);
        exit;
    }
    
    $db = getDB();
    
    // Verificar se usuário existe
    $stmt = $db->prepare("SELECT id, email, is_admin FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Usuário não encontrado']);
        exit;
    }
    
    // Hash da nova senha
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Atualizar senha
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->execute([$hashedPassword, $email]);
    
    // Definir como admin se necessário
    if (isset($data['set_admin']) && $data['set_admin']) {
        $stmt = $db->prepare("UPDATE users SET is_admin = 1 WHERE email = ?");
        $stmt->execute([$email]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Senha atualizada com sucesso',
        'user' => [
            'email' => $email,
            'is_admin' => $data['set_admin'] ?? $user['is_admin']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao resetar senha: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro interno do servidor: ' . $e->getMessage()]);
}

