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
    // Verificar autenticação (retorna o user_id diretamente)
    $userId = requireAuth();
    
    // Buscar dados completos do usuário para verificar se é admin
    $db = getDB();
    $userStmt = $db->prepare("SELECT id, is_admin FROM users WHERE id = ?");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Usuário não encontrado']);
        exit;
    }
    
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
    if ($card['user_id'] != $userId && !$user['is_admin']) {
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

