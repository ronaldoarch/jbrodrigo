<?php
/**
 * Endpoint para adicionar colunas faltantes na tabela wallets via HTTP
 * Acessar: /backend/bingo/add-wallet-columns-via-http.php
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
// require_once __DIR__ . '/../utils/auth-helper.php'; // Descomente se quiser proteger o endpoint

header('Content-Type: application/json');

$response = ['success' => false, 'messages' => [], 'columns_added' => [], 'columns_skipped' => []];

try {
    $db = getDB();
    
    // Lista de colunas a adicionar
    $columns = [
        'locked_balance' => "DECIMAL(12,2) DEFAULT 0.00 AFTER `bonus_balance`",
        'total_deposited' => "DECIMAL(12,2) DEFAULT 0.00 AFTER `locked_balance`",
        'total_withdrawn' => "DECIMAL(12,2) DEFAULT 0.00 AFTER `total_deposited`",
        'total_wagered' => "DECIMAL(12,2) DEFAULT 0.00 AFTER `total_withdrawn`",
        'total_won' => "DECIMAL(12,2) DEFAULT 0.00 AFTER `total_wagered`",
    ];
    
    $added = 0;
    $skipped = 0;
    
    foreach ($columns as $columnName => $columnDef) {
        // Verificar se a coluna já existe
        $checkStmt = $db->prepare("
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'wallets' 
            AND COLUMN_NAME = ?
        ");
        $checkStmt->execute([$columnName]);
        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['count'] > 0) {
            $response['messages'][] = "Coluna '$columnName' já existe (pulando...)";
            $response['columns_skipped'][] = $columnName;
            $skipped++;
            continue;
        }
        
        // Adicionar coluna
        try {
            $alterSql = "ALTER TABLE `wallets` ADD COLUMN `{$columnName}` {$columnDef}";
            $db->exec($alterSql);
            $response['messages'][] = "✅ Coluna '$columnName' adicionada com sucesso";
            $response['columns_added'][] = $columnName;
            $added++;
        } catch (PDOException $e) {
            $response['messages'][] = "❌ Erro ao adicionar coluna '$columnName': " . $e->getMessage();
            error_log("Erro ao adicionar coluna $columnName: " . $e->getMessage());
        }
    }
    
    $response['success'] = true;
    $response['columns_added_count'] = $added;
    $response['columns_skipped_count'] = $skipped;
    $response['messages'][] = "🎉 Concluído! Adicionadas: $added, Já existiam: $skipped";

} catch (Exception $e) {
    $response['success'] = false;
    $response['messages'][] = "❌ Erro fatal: " . $e->getMessage();
    error_log("Erro fatal ao adicionar colunas: " . $e->getMessage());
    http_response_code(500);
}

echo json_encode($response, JSON_PRETTY_PRINT);

