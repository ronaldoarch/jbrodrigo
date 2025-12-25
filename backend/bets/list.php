<?php
/**
 * Listar Apostas do Usuário
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../utils/auth-helper.php';

header('Content-Type: application/json');

$userId = requireAuth();

try {
    $db = getDB();
    
    // Parâmetros de paginação
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;
    
    // Filtros
    $status = isset($_GET['status']) ? $_GET['status'] : null;
    $betType = isset($_GET['bet_type']) ? $_GET['bet_type'] : null;
    
    // Query base
    $where = ["b.user_id = ?"];
    $params = [$userId];
    
    if ($status) {
        $where[] = "b.status = ?";
        $params[] = $status;
    }
    
    if ($betType) {
        $where[] = "b.bet_type = ?";
        $params[] = $betType;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Contar total
    $stmt = $db->prepare("SELECT COUNT(*) as total FROM bets b WHERE $whereClause");
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];
    
    // Buscar apostas
    $stmt = $db->prepare("
        SELECT b.*, e.description as extraction_description, e.status as extraction_status
        FROM bets b
        LEFT JOIN extractions e ON b.extraction_id = e.id
        WHERE $whereClause
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $bets = $stmt->fetchAll();
    
    // Buscar itens de cada aposta
    foreach ($bets as &$bet) {
        $stmt = $db->prepare("SELECT * FROM bet_items WHERE bet_id = ?");
        $stmt->execute([$bet['id']]);
        $bet['items'] = $stmt->fetchAll();
    }
    
    echo json_encode([
        'success' => true,
        'bets' => $bets,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao listar apostas: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao buscar apostas']);
}

