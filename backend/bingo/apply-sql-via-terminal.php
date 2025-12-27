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
    
    // SQL das tabelas
    $sql = "
    -- Tabela de Jogos de Bingo
    CREATE TABLE IF NOT EXISTS `bingo_games` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `seed` VARCHAR(255) NOT NULL COMMENT 'Seed usada para gerar o sorteio',
        `numbers_drawn` TEXT NOT NULL COMMENT 'JSON com sequência completa de números sorteados',
        `status` ENUM('active', 'finished') DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_status` (`status`),
        INDEX `idx_created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Tabela de Cartelas de Bingo
    CREATE TABLE IF NOT EXISTS `bingo_cards` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `game_id` INT NOT NULL,
        `card_numbers` TEXT NOT NULL COMMENT 'JSON com números da cartela (5x5)',
        `numbers_matched` TEXT NULL COMMENT 'JSON com números que foram acertados',
        `win_pattern` VARCHAR(50) NULL COMMENT 'linha, coluna, diagonal, cheia, nenhum',
        `result` ENUM('win', 'lose', 'pending') DEFAULT 'pending',
        `prize_amount` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Prêmio creditado',
        `bet_amount` DECIMAL(12,2) NOT NULL COMMENT 'Valor apostado',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_user_id` (`user_id`),
        INDEX `idx_game_id` (`game_id`),
        INDEX `idx_result` (`result`),
        INDEX `idx_created_at` (`created_at`),
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`game_id`) REFERENCES `bingo_games`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    // Separar comandos SQL
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function($stmt) {
            return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
        }
    );
    
    $executed = 0;
    $errors = 0;
    
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) continue;
        
        try {
            $db->exec($statement);
            $executed++;
            echo "✅ Comando executado com sucesso\n";
        } catch (PDOException $e) {
            // Ignorar erros de "table already exists"
            if (strpos($e->getMessage(), 'already exists') !== false) {
                echo "⚠️  Tabela já existe (ignorando)\n";
            } else {
                $errors++;
                echo "❌ Erro: " . $e->getMessage() . "\n";
            }
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

