<?php
/**
 * Script para adicionar colunas faltantes na tabela wallets
 * Executar via terminal: php backend/bingo/add-wallet-columns-via-terminal.php
 */

require_once __DIR__ . '/../scraper/config/database.php';

echo "🔧 Adicionando colunas faltantes na tabela wallets...\n\n";

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
            echo "⏭️  Coluna '$columnName' já existe (pulando...)\n";
            $skipped++;
            continue;
        }
        
        // Adicionar coluna
        try {
            $afterClause = $column['after'] ? " AFTER `{$column['after']}`" : "";
            $alterSql = "ALTER TABLE `wallets` ADD COLUMN `{$columnName}` {$column['def']}{$afterClause}";
            echo "➕ Adicionando coluna '$columnName'...\n";
            $db->exec($alterSql);
            echo "✅ Coluna '$columnName' adicionada com sucesso!\n\n";
            $added++;
        } catch (PDOException $e) {
            // Se o erro for porque a coluna já existe (1060), considerar como sucesso
            if (strpos($e->getMessage(), 'Duplicate column name') !== false || $e->getCode() == 1060) {
                echo "⏭️  Coluna '$columnName' já existe (duplicada detectada)\n\n";
                $skipped++;
            } else {
                echo "❌ Erro ao adicionar coluna '$columnName': " . $e->getMessage() . "\n\n";
            }
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

