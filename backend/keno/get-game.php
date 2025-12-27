<?php
/**
 * API: Buscar jogo de Keno por ID
 * GET /backend/keno/get-game.php?id=123
 */

require_once __DIR__ . '/../utils/auth-helper.php';
require_once __DIR__ . '/KenoService.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Verificar autenticação
    $user = requireAuth();
    $userId = $user['id'];
    
    $gameId = intval($_GET['id'] ?? 0);
    
    if ($gameId <= 0) {
        throw new Exception('ID do jogo inválido');
    }
    
    // Buscar jogo
    $service = new KenoService();
    $game = $service->getGameById($gameId);
    
    if (!$game) {
        throw new Exception('Jogo não encontrado');
    }
    
    // Verificar se o jogo pertence ao usuário (exceto admin)
    if ($game['user_id'] != $userId && $user['is_admin'] != 1) {
        throw new Exception('Acesso negado');
    }
    
    echo json_encode([
        'success' => true,
        'game' => $game
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

