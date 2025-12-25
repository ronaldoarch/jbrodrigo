<?php
/**
 * Endpoint para calcular apostas (opcional)
 * Pode ser usado pelo frontend para pré-visualizar cálculos
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/BetCalculator.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['modality']) || !isset($data['bet_value']) || 
        !isset($data['positions']) || !isset($data['value'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados incompletos']);
        exit;
    }
    
    $modality = $data['modality'];
    $betValue = $data['bet_value'];
    $positions = $data['positions'];
    $value = (float)$data['value'];
    $divisionType = isset($data['division_type']) ? $data['division_type'] : 'todos';
    
    // Calcular unidades
    $units = BetCalculator::calculateUnits($modality, $betValue, $positions, $divisionType);
    
    // Calcular valor por unidade
    $valuePerUnit = BetCalculator::calculateValuePerUnit($value, $units, $divisionType);
    
    // Calcular valor total
    $totalValue = BetCalculator::calculateTotalValue($valuePerUnit, $units, $divisionType);
    
    // Obter multiplicador
    $multiplier = BetCalculator::getMultiplier($modality, $positions);
    
    // Calcular prêmio potencial
    $potentialPrize = BetCalculator::calculatePotentialPrize($valuePerUnit, $units, $multiplier);
    
    echo json_encode([
        'success' => true,
        'calculation' => [
            'units' => $units,
            'value_per_unit' => $valuePerUnit,
            'total_value' => $totalValue,
            'multiplier' => $multiplier,
            'potential_prize' => $potentialPrize
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao calcular aposta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao calcular']);
}

