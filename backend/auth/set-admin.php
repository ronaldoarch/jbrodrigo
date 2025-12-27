<?php
/**
 * Script para definir usuário como admin e resetar senha
 * USO TEMPORÁRIO - Remover após uso
 */

require_once __DIR__ . '/../scraper/config/database.php';

header('Content-Type: application/json');

try {
    $email = 'midasreidoblack@gmail.com';
    $password = 'Admin123';
    
    // Hash da senha
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $db = getDB();
    
    // Verificar se usuário existe
    $stmt = $db->prepare("SELECT id, email FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Criar usuário se não existir
        $name = 'Admin';
        $cpf = '00000000000'; // CPF temporário
        $phone = '00000000000'; // Telefone temporário
        
        $stmt = $db->prepare("
            INSERT INTO users (name, email, password, cpf, phone, is_admin) 
            VALUES (?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([$name, $email, $hashedPassword, $cpf, $phone]);
        $userId = $db->lastInsertId();
        
        // Criar carteira
        $stmt = $db->prepare("INSERT INTO wallets (user_id) VALUES (?)");
        $stmt->execute([$userId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Usuário admin criado com sucesso',
            'user' => [
                'id' => $userId,
                'email' => $email,
                'is_admin' => true
            ]
        ]);
    } else {
        // Atualizar senha e definir como admin
        $stmt = $db->prepare("UPDATE users SET password = ?, is_admin = 1 WHERE email = ?");
        $stmt->execute([$hashedPassword, $email]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Senha atualizada e usuário definido como admin',
            'user' => [
                'id' => $user['id'],
                'email' => $email,
                'is_admin' => true
            ]
        ]);
    }
    
} catch (Exception $e) {
    error_log("Erro ao definir admin: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erro interno do servidor: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

