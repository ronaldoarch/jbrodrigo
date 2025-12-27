<?php
/**
 * Endpoint: Listar cartelas do usuário
 * GET /backend/bingo/list-cards.php?limit=20&offset=0
 */

require_once __DIR__ . '/../cors.php';
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
    
    // Obter parâmetros
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    $limit = max(1, min(100, $limit)); // Limitar entre 1 e 100
    $offset = max(0, $offset);
    
    // Buscar cartelas
    $bingoService = new BingoService();
    $cards = $bingoService->getUserCards($userId, $limit, $offset);
    
    echo json_encode([
        'success' => true,
        'cards' => $cards,
        'count' => count($cards)
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao listar cartelas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

