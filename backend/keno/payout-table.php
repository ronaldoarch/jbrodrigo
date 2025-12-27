<?php
/**
 * API: Retornar tabela de premiação do Keno
 * GET /backend/keno/payout-table.php
 */

require_once __DIR__ . '/KenoPayout.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $payoutTable = KenoPayout::getPayoutTable();
    
    echo json_encode([
        'success' => true,
        'payout_table' => $payoutTable
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

