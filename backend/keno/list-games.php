<?php
/**
 * API: Listar jogos de Keno do usuário
 * GET /backend/keno/list-games.php?limit=20&offset=0
 */

require_once __DIR__ . '/../utils/auth-helper.php';
require_once __DIR__ . '/KenoService.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Verificar autenticação
    $user = requireAuth();
    $userId = $user['id'];
    
    $limit = intval($_GET['limit'] ?? 20);
    $offset = intval($_GET['offset'] ?? 0);
    
    if ($limit > 100) {
        $limit = 100; // Limite máximo
    }
    
    // Buscar jogos
    $service = new KenoService();
    $games = $service->getUserGames($userId, $limit, $offset);
    
    echo json_encode([
        'success' => true,
        'games' => $games,
        'count' => count($games)
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

