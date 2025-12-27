<?php
/**
 * Endpoint: Criar nova cartela de bingo
 * POST /backend/bingo/create-card.php
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../utils/auth-helper.php';
require_once __DIR__ . '/BingoService.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    // Verificar autenticação (retorna o user_id diretamente, não um array)
    $userId = requireAuth();
    
    // Obter dados
    $data = json_decode(file_get_contents('php://input'), true);
    $betAmount = isset($data['bet_amount']) ? (float)$data['bet_amount'] : 1.00;
    
    if ($betAmount <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Valor da aposta inválido']);
        exit;
    }
    
    // Criar cartela
    $bingoService = new BingoService();
    $card = $bingoService->createCard($userId, $betAmount);
    
    echo json_encode([
        'success' => true,
        'card' => $card
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao criar cartela de bingo: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

