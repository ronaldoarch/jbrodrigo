<?php
/**
 * Processar Prêmios de Apostas Pendentes
 * Executar a cada 2 minutos
 */

set_time_limit(120);
date_default_timezone_set('America/Sao_Paulo');

require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../bets/BetSettlement.php';

error_log("PROCESS-BET-PRIZES: Iniciando em " . date('Y-m-d H:i:s'));

try {
    $db = getDB();
    
    // Buscar apostas pendentes com extrações completadas
    $stmt = $db->prepare("
        SELECT b.id 
        FROM bets b
        INNER JOIN extractions e ON b.extraction_id = e.id
        WHERE b.status IN ('pending', 'settling')
        AND e.status = 'completed'
        AND e.position_1 IS NOT NULL
        LIMIT 100
    ");
    $stmt->execute();
    $bets = $stmt->fetchAll();
    
    $processed = 0;
    $errors = 0;
    
    foreach ($bets as $bet) {
        try {
            BetSettlement::settleBet($bet['id']);
            $processed++;
        } catch (Exception $e) {
            error_log("PROCESS-BET-PRIZES: Erro ao processar aposta {$bet['id']}: " . $e->getMessage());
            $errors++;
        }
    }
    
    error_log("PROCESS-BET-PRIZES: Processadas: $processed, Erros: $errors");
    
} catch (Exception $e) {
    error_log("PROCESS-BET-PRIZES: Erro fatal: " . $e->getMessage());
}

echo "OK\n";

