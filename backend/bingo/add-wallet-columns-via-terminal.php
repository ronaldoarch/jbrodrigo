<?php
/**
 * Script para adicionar colunas faltantes na tabela wallets
 * Executar via terminal: php backend/bingo/add-wallet-columns-via-terminal.php
 */

require_once __DIR__ . '/../scraper/config/database.php';

echo "🔧 Adicionando colunas faltantes na tabela wallets...\n\n";

try {
    $db = getDB();
    
    // Lista de colunas a adicionar (com verificação)
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
            echo "⏭️  Coluna '$columnName' já existe (pulando...)\n";
            $skipped++;
            continue;
        }
        
        // Adicionar coluna
        try {
            $alterSql = "ALTER TABLE `wallets` ADD COLUMN `{$columnName}` {$columnDef}";
            echo "➕ Adicionando coluna '$columnName'...\n";
            $db->exec($alterSql);
            echo "✅ Coluna '$columnName' adicionada com sucesso!\n\n";
            $added++;
        } catch (PDOException $e) {
            echo "❌ Erro ao adicionar coluna '$columnName': " . $e->getMessage() . "\n\n";
        }
    }
    
    echo "\n📊 Resultado:\n";
    echo "   ✅ Adicionadas: $added colunas\n";
    echo "   ⏭️  Já existiam: $skipped colunas\n";
    
    // Verificar estrutura final
    echo "\n🔍 Verificando estrutura da tabela wallets...\n";
    $stmt = $db->query("DESCRIBE wallets");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nColunas na tabela wallets:\n";
    foreach ($columns as $col) {
        echo "   - {$col['Field']} ({$col['Type']})\n";
    }
    
    echo "\n🎉 Concluído!\n";

} catch (Exception $e) {
    echo "❌ Erro fatal: " . $e->getMessage() . "\n";
    exit(1);
}

