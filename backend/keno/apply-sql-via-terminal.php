<?php
/**
 * Script para aplicar SQL do Keno via terminal do Coolify
 * 
 * Uso: php backend/keno/apply-sql-via-terminal.php
 */

require_once __DIR__ . '/../scraper/config/database.php';

echo "🎲 Aplicando estrutura do módulo Keno...\n\n";

try {
    $db = getDB();
    
    $executed = 0;
    $errors = 0;
    
    // SQL da tabela keno_games
    $sql_keno_games = "CREATE TABLE IF NOT EXISTS `keno_games` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `seed` VARCHAR(255) NOT NULL,
        `chosen_numbers` TEXT NOT NULL,
        `drawn_numbers` TEXT NOT NULL,
        `hits` INT NOT NULL DEFAULT 0,
        `prize` DECIMAL(12,2) DEFAULT 0.00,
        `bet_amount` DECIMAL(12,2) NOT NULL,
        `status` ENUM('finished') DEFAULT 'finished',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_user_id` (`user_id`),
        INDEX `idx_status` (`status`),
        INDEX `idx_created_at` (`created_at`),
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    // Criar keno_games
    echo "📝 Criando tabela keno_games...\n";
    try {
        $db->exec($sql_keno_games);
        $executed++;
        echo "✅ Tabela keno_games criada com sucesso\n\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate table') !== false) {
            echo "⚠️  Tabela keno_games já existe (continuando...)\n\n";
        } else {
            $errors++;
            echo "❌ Erro ao criar keno_games: " . $e->getMessage() . "\n\n";
            throw $e;
        }
    }
    
    // Verificar se tabelas foram criadas
    echo "🔍 Verificando tabelas...\n";
    $stmt = $db->query("SHOW TABLES LIKE 'keno%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "✅ Tabelas encontradas:\n";
        foreach ($tables as $table) {
            echo "   - $table\n";
        }
    } else {
        echo "❌ Nenhuma tabela keno encontrada\n";
    }
    
    echo "\n🎉 Concluído!\n";
    
} catch (Exception $e) {
    echo "❌ Erro fatal: " . $e->getMessage() . "\n";
    exit(1);
}

