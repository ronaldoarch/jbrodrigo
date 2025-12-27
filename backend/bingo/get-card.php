<?php
/**
 * Endpoint: Buscar cartela específica
 * GET /backend/bingo/get-card.php?id=123
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../utils/auth-helper.php';
require_once __DIR__ . '/BingoService.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    // Verificar autenticação
    $user = requireAuth();
    
    // Obter ID da cartela
    $cardId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($cardId <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID da cartela inválido']);
        exit;
    }
    
    // Buscar cartela
    $bingoService = new BingoService();
    $card = $bingoService->getCardById($cardId);
    
    if (!$card) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Cartela não encontrada']);
        exit;
    }
    
    // Verificar se cartela pertence ao usuário
    if ($card['user_id'] != $user['id'] && $user['is_admin'] != 1) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Acesso negado']);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'card' => $card
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar cartela: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

