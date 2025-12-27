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
    
    // Ordem das colunas a adicionar (devem ser adicionadas nesta ordem devido ao AFTER)
    $columns = [
        ['name' => 'locked_balance', 'def' => "DECIMAL(12,2) DEFAULT 0.00", 'after' => 'bonus_balance'],
        ['name' => 'total_deposited', 'def' => "DECIMAL(12,2) DEFAULT 0.00", 'after' => 'locked_balance'],
        ['name' => 'total_withdrawn', 'def' => "DECIMAL(12,2) DEFAULT 0.00", 'after' => 'total_deposited'],
        ['name' => 'total_wagered', 'def' => "DECIMAL(12,2) DEFAULT 0.00", 'after' => 'total_withdrawn'],
        ['name' => 'total_won', 'def' => "DECIMAL(12,2) DEFAULT 0.00", 'after' => 'total_wagered'],
    ];
    
    $added = 0;
    $skipped = 0;
    
    foreach ($columns as $column) {
        $columnName = $column['name'];
        
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
            $afterClause = $column['after'] ? " AFTER `{$column['after']}`" : "";
            $alterSql = "ALTER TABLE `wallets` ADD COLUMN `{$columnName}` {$column['def']}{$afterClause}";
            $db->exec($alterSql);
            $response['messages'][] = "✅ Coluna '$columnName' adicionada com sucesso";
            $response['columns_added'][] = $columnName;
            $added++;
        } catch (PDOException $e) {
            // Se o erro for porque a coluna já existe (1060), considerar como sucesso
            if (strpos($e->getMessage(), 'Duplicate column name') !== false || $e->getCode() == 1060) {
                $response['messages'][] = "Coluna '$columnName' já existe (duplicada detectada)";
                $response['columns_skipped'][] = $columnName;
                $skipped++;
            } else {
                $response['messages'][] = "❌ Erro ao adicionar coluna '$columnName': " . $e->getMessage();
                error_log("Erro ao adicionar coluna $columnName: " . $e->getMessage());
            }
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

