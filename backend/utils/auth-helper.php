<?php
/**
 * Helpers de Autenticação
 */

require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../session-config.php';

/**
 * Requer autenticação do usuário
 * Retorna o ID do usuário autenticado
 */
function requireAuth() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Não autenticado']);
        exit;
    }
    
    return $_SESSION['user_id'];
}

/**
 * Requer que o usuário seja administrador
 * Retorna o ID do usuário administrador
 */
function requireAdmin() {
    $userId = requireAuth();
    
    $db = getDB();
    $stmt = $db->prepare("SELECT is_admin FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user || !$user['is_admin']) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Acesso negado']);
        exit;
    }
    
    return $userId;
}

/**
 * Retorna os dados do usuário autenticado atual
 */
function getCurrentUser() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT id, name, email, cpf, phone, is_admin FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

/**
 * Gera código de referência único
 */
function generateReferralCode($userId) {
    return 'REF' . str_pad($userId, 6, '0', STR_PAD_LEFT) . strtoupper(substr(md5($userId . time()), 0, 4));
}

/**
 * Valida CPF
 */
function validateCPF($cpf) {
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    if (strlen($cpf) != 11) {
        return false;
    }
    
    if (preg_match('/(\d)\1{10}/', $cpf)) {
        return false;
    }
    
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) {
            return false;
        }
    }
    
    return true;
}

