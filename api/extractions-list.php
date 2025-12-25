<?php
/**
 * Lista de Extrações Disponíveis
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
    
    // Buscar extrações ativas
    $stmt = $db->prepare("
        SELECT id, type, description, close_time, game_type, status, 
               extraction_date, extraction_time, is_active, sort_order
        FROM extractions 
        WHERE is_active = TRUE
        ORDER BY sort_order ASC, close_time ASC
    ");
    $stmt->execute();
    $extractions = $stmt->fetchAll();
    
    // Formatar horários
    foreach ($extractions as &$extraction) {
        $extraction['close_time'] = substr($extraction['close_time'], 0, 5); // HH:MM
        if ($extraction['extraction_time']) {
            $extraction['extraction_time'] = substr($extraction['extraction_time'], 0, 5);
        }
    }
    
    echo json_encode([
        'success' => true,
        'extractions' => $extractions
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar extrações: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao buscar extrações']);
}

