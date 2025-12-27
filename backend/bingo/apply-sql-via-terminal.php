<?php
/**
 * Script para aplicar SQL do Bingo via terminal do Coolify
 * 
 * Uso: php backend/bingo/apply-sql-via-terminal.php
 * 
 * Este script lê as variáveis de ambiente do Coolify/Railway
 * e aplica o SQL do módulo Bingo
 */

require_once __DIR__ . '/../scraper/config/database.php';

echo "🎲 Aplicando estrutura do módulo Bingo...\n\n";

try {
    $db = getDB();
    
    $executed = 0;
    $errors = 0;
    
    // SQL da tabela bingo_games (PRIMEIRO - não depende de outras)
    $sql_bingo_games = "CREATE TABLE IF NOT EXISTS `bingo_games` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `seed` VARCHAR(255) NOT NULL,
        `numbers_drawn` TEXT NOT NULL,
        `status` ENUM('active', 'finished') DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_status` (`status`),
        INDEX `idx_created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    // Criar bingo_games primeiro
    echo "📝 Criando tabela bingo_games...\n";
    try {
        $db->exec($sql_bingo_games);
        $executed++;
        echo "✅ Tabela bingo_games criada com sucesso\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate table') !== false) {
            echo "⚠️  Tabela bingo_games já existe (continuando...)\n\n";
        } else {
            $errors++;
            echo "❌ Erro ao criar bingo_games: " . $e->getMessage() . "\n\n";
            throw $e; // Parar execução se não conseguir criar bingo_games
        }
    }
    
    // Verificar se bingo_games existe antes de criar bingo_cards
    $stmt = $db->query("SHOW TABLES LIKE 'bingo_games'");
    if ($stmt->rowCount() == 0) {
        throw new Exception("Tabela bingo_games não foi criada. Não é possível criar bingo_cards.");
    }
    
    // SQL da tabela bingo_cards (SEGUNDO - depende de bingo_games e users)
    $sql_bingo_cards = "CREATE TABLE IF NOT EXISTS `bingo_cards` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `game_id` INT NOT NULL,
        `card_numbers` TEXT NOT NULL,
        `numbers_matched` TEXT NULL,
        `win_pattern` VARCHAR(50) NULL,
        `result` ENUM('win', 'lose', 'pending') DEFAULT 'pending',
        `prize_amount` DECIMAL(12,2) DEFAULT 0.00,
        `bet_amount` DECIMAL(12,2) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_user_id` (`user_id`),
        INDEX `idx_game_id` (`game_id`),
        INDEX `idx_result` (`result`),
        INDEX `idx_created_at` (`created_at`),
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`game_id`) REFERENCES `bingo_games`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    // Criar bingo_cards depois
    echo "📝 Criando tabela bingo_cards...\n";
    try {
        $db->exec($sql_bingo_cards);
        $executed++;
        echo "✅ Tabela bingo_cards criada com sucesso\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate table') !== false) {
            echo "⚠️  Tabela bingo_cards já existe (continuando...)\n\n";
        } else {
            $errors++;
            echo "❌ Erro ao criar bingo_cards: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
    
    echo "\n📊 Resultado:\n";
    echo "   Executados: $executed comandos\n";
    if ($errors > 0) {
        echo "   Erros: $errors\n";
    }
    
    // Verificar se tabelas foram criadas
    echo "\n🔍 Verificando tabelas...\n";
    $stmt = $db->query("SHOW TABLES LIKE 'bingo%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "✅ Tabelas encontradas:\n";
        foreach ($tables as $table) {
            echo "   - $table\n";
        }
    } else {
        echo "❌ Nenhuma tabela bingo encontrada\n";
    }
    
    echo "\n🎉 Concluído!\n";
    
} catch (Exception $e) {
    echo "❌ Erro fatal: " . $e->getMessage() . "\n";
    exit(1);
}

