<?php
/**
 * Cron Job Principal: Buscar Resultados e Liquidar Apostas
 * Executar a cada 5 minutos
 * 
 * Uso: php scheduled-fetch-and-verify.php?token=SEU_TOKEN_SECRETO
 */

set_time_limit(180);
date_default_timezone_set('America/Sao_Paulo');

// Verificar token de segurança
$token = isset($_GET['token']) ? $_GET['token'] : '';
$expectedToken = '2403Auror@'; // ALTERAR EM PRODUÇÃO

if ($token !== $expectedToken) {
    error_log("SCHEDULED-FETCH: Token inválido");
    http_response_code(403);
    exit("Acesso negado");
}

require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../bets/BetSettlement.php';

error_log("SCHEDULED-FETCH: Iniciando execução em " . date('Y-m-d H:i:s'));

try {
    $db = getDB();
    
    // 1. Buscar extrações que devem ter resultados agora
    $now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
    $currentTime = $now->format('H:i:s');
    
    // Buscar extrações que já passaram do horário de sorteio (com margem de 5 minutos)
    $stmt = $db->prepare("
        SELECT id, game_type, close_time, real_close_time, status
        FROM extractions 
        WHERE is_active = TRUE 
        AND status = 'pending'
        AND type = 'normal'
        AND (
            (real_close_time IS NOT NULL AND real_close_time <= ?)
            OR (real_close_time IS NULL AND close_time <= ?)
        )
    ");
    
    $fiveMinutesAgo = date('H:i:s', strtotime('-5 minutes'));
    $stmt->execute([$currentTime, $fiveMinutesAgo]);
    $extractionsToProcess = $stmt->fetchAll();
    
    error_log("SCHEDULED-FETCH: Encontradas " . count($extractionsToProcess) . " extrações para processar");
    
    // 2. Para cada extração, buscar resultados (se ainda não tiver)
    foreach ($extractionsToProcess as $extraction) {
        // Verificar se já tem resultados
        if ($extraction['status'] === 'completed') {
            continue;
        }
        
        error_log("SCHEDULED-FETCH: Processando extração ID {$extraction['id']} - {$extraction['game_type']}");
        
        // Aqui você pode chamar o scraper específico para buscar resultados
        // Por enquanto, vamos apenas verificar se já existem resultados em 'games'
        $stmt = $db->prepare("
            SELECT * FROM games 
            WHERE type = ? 
            AND DATE(created_at) = CURDATE()
            ORDER BY created_at DESC
            LIMIT 7
        ");
        $stmt->execute([$extraction['game_type']]);
        $games = $stmt->fetchAll();
        
        if (count($games) >= 7) {
            // Sincronizar resultados para extração
            $positions = [];
            $animals = [];
            
            foreach ($games as $game) {
                $pos = (int)$game['position'];
                $positions[$pos] = $game['result'];
                $animals[$pos] = $game['animal'];
            }
            
            // Atualizar extração
            $stmt = $db->prepare("
                UPDATE extractions 
                SET position_1 = ?, position_2 = ?, position_3 = ?, position_4 = ?,
                    position_5 = ?, position_6 = ?, position_7 = ?,
                    animal_1 = ?, animal_2 = ?, animal_3 = ?, animal_4 = ?,
                    animal_5 = ?, animal_6 = ?, animal_7 = ?,
                    status = 'completed', processed_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $positions[1] ?? null, $positions[2] ?? null, $positions[3] ?? null,
                $positions[4] ?? null, $positions[5] ?? null, $positions[6] ?? null,
                $positions[7] ?? null,
                $animals[1] ?? null, $animals[2] ?? null, $animals[3] ?? null,
                $animals[4] ?? null, $animals[5] ?? null, $animals[6] ?? null,
                $animals[7] ?? null,
                $extraction['id']
            ]);
            
            error_log("SCHEDULED-FETCH: Extração {$extraction['id']} atualizada com resultados");
        }
    }
    
    // 3. Buscar apostas pendentes para liquidar
    $stmt = $db->prepare("
        SELECT b.id 
        FROM bets b
        INNER JOIN extractions e ON b.extraction_id = e.id
        WHERE b.status IN ('pending', 'settling')
        AND e.status = 'completed'
        AND e.position_1 IS NOT NULL
        LIMIT 50
    ");
    $stmt->execute();
    $betsToSettle = $stmt->fetchAll();
    
    error_log("SCHEDULED-FETCH: Encontradas " . count($betsToSettle) . " apostas para liquidar");
    
    // 4. Liquidar cada aposta
    foreach ($betsToSettle as $bet) {
        try {
            BetSettlement::settleBet($bet['id']);
            error_log("SCHEDULED-FETCH: Aposta {$bet['id']} liquidada com sucesso");
        } catch (Exception $e) {
            error_log("SCHEDULED-FETCH: Erro ao liquidar aposta {$bet['id']}: " . $e->getMessage());
        }
    }
    
    error_log("SCHEDULED-FETCH: Execução concluída em " . date('Y-m-d H:i:s'));
    
} catch (Exception $e) {
    error_log("SCHEDULED-FETCH: Erro fatal: " . $e->getMessage());
    http_response_code(500);
    exit("Erro: " . $e->getMessage());
}

echo "OK\n";

