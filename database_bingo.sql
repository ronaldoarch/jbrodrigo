-- ============================================
-- MÓDULO BINGO AUTOMÁTICO
-- Adicionar ao banco de dados existente
-- ============================================

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

