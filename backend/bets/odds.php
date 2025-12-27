<?php
/**
 * Listar Cotações/Odds
 * Agora busca do banco de dados
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/OddsManager.php';

header('Content-Type: application/json');

try {
    // Buscar tipo de jogo da query string (opcional)
    $gameType = isset($_GET['game_type']) ? $_GET['game_type'] : null;
    
    // Buscar cotações do banco
    $odds = OddsManager::getAllOdds($gameType);
    
    echo json_encode([
        'success' => true,
        'odds' => $odds
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar cotações: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar cotações',
        'odds' => [] // Retornar array vazio em caso de erro
    ]);
}
        'multiplier' => 90,
        'description' => 'Aposta do 1º ao 2º prêmio (ida e volta)'
    ],
    'passe-vai-vem-1-5' => [
        'name' => 'Passe-Vai-Vem 1-5',
        'multiplier' => 45,
        'description' => 'Aposta do 1º ao 5º prêmio (ida e volta)'
    ]
];

echo json_encode([
    'success' => true,
    'odds' => $odds
]);

