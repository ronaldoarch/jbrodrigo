<?php
/**
 * API: Criar novo jogo de Keno
 * POST /backend/keno/create-game.php
 */

require_once __DIR__ . '/../utils/auth-helper.php';
require_once __DIR__ . '/KenoService.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Verificar autenticação
    $user = requireAuth();
    $userId = $user['id'];
    
    // Ler dados do POST
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Dados inválidos');
    }
    
    $chosenNumbers = $input['chosen_numbers'] ?? [];
    $betAmount = floatval($input['bet_amount'] ?? 0);
    
    if ($betAmount <= 0) {
        throw new Exception('Valor da aposta deve ser maior que zero');
    }
    
    // Criar jogo
    $service = new KenoService();
    $game = $service->createGame($userId, $chosenNumbers, $betAmount);
    
    // Buscar saldo atualizado
    require_once __DIR__ . '/../scraper/config/database.php';
    $db = getDB();
    $walletStmt = $db->prepare("SELECT balance FROM wallets WHERE user_id = ?");
    $walletStmt->execute([$userId]);
    $wallet = $walletStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'game' => $game,
        'balance' => floatval($wallet['balance'] ?? 0)
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

