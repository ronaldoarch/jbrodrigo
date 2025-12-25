<?php
/**
 * API de Banners
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../backend/scraper/config/database.php';

try {
    $db = getDB();
    
    $position = isset($_GET['position']) ? $_GET['position'] : 'home';
    
    $stmt = $db->prepare("
        SELECT id, title, image_url, link_url, position, sort_order
        FROM banners 
        WHERE is_active = TRUE AND position = ?
        ORDER BY sort_order ASC
    ");
    $stmt->execute([$position]);
    $banners = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'banners' => $banners
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar banners: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao buscar banners']);
}

