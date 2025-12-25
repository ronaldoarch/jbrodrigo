<?php
/**
 * Saldo da Carteira
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../utils/auth-helper.php';

header('Content-Type: application/json');

$userId = requireAuth();

try {
    $db = getDB();
    $stmt = $db->prepare("SELECT balance, bonus_balance FROM wallets WHERE user_id = ?");
    $stmt->execute([$userId]);
    $wallet = $stmt->fetch();
    
    if (!$wallet) {
        // Criar carteira se não existir
        $stmt = $db->prepare("INSERT INTO wallets (user_id) VALUES (?)");
        $stmt->execute([$userId]);
        $wallet = ['balance' => 0, 'bonus_balance' => 0];
    }
    
    echo json_encode([
        'success' => true,
        'balance' => (float)$wallet['balance'],
        'bonus_balance' => (float)$wallet['bonus_balance'],
        'total_balance' => (float)$wallet['balance'] + (float)$wallet['bonus_balance']
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar saldo: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao buscar saldo']);
}

