<?php
/**
 * Transações da Carteira
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
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    
    // Query base
    $where = ["wt.user_id = ?"];
    $params = [$userId];
    
    if ($type) {
        $where[] = "wt.type = ?";
        $params[] = $type;
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Contar total
    $stmt = $db->prepare("
        SELECT COUNT(*) as total 
        FROM wallet_transactions wt 
        WHERE $whereClause
    ");
    $stmt->execute($params);
    $total = $stmt->fetch()['total'];
    
    // Buscar transações
    $stmt = $db->prepare("
        SELECT wt.* 
        FROM wallet_transactions wt
        WHERE $whereClause
        ORDER BY wt.created_at DESC
        LIMIT ? OFFSET ?
    ");
    $params[] = $limit;
    $params[] = $offset;
    $stmt->execute($params);
    $transactions = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'transactions' => $transactions,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar transações: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao buscar transações']);
}

