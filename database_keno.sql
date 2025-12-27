-- ============================================
-- MÓDULO KENO
-- Adicionar ao banco de dados existente
-- ============================================

-- Tabela de Jogos de Keno
CREATE TABLE IF NOT EXISTS `keno_games` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `seed` VARCHAR(255) NOT NULL COMMENT 'Seed para o sorteio determinístico',
    `chosen_numbers` TEXT NOT NULL COMMENT 'JSON com números escolhidos pelo usuário (2-10 números)',
    `drawn_numbers` TEXT NOT NULL COMMENT 'JSON com 20 números sorteados',
    `hits` INT NOT NULL DEFAULT 0 COMMENT 'Quantidade de acertos',
    `prize` DECIMAL(12,2) DEFAULT 0.00 COMMENT 'Valor do prêmio creditado',
    `bet_amount` DECIMAL(12,2) NOT NULL COMMENT 'Valor apostado',
    `status` ENUM('finished') DEFAULT 'finished',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

