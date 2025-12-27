-- ============================================
-- BANCO DE DADOS - JOGO DO BICHO
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- TABELA: users (Usuários)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `cpf` VARCHAR(11) UNIQUE NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `referral_code` VARCHAR(20) UNIQUE,
    `referred_by` INT NULL,
    `is_admin` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_email` (`email`),
    INDEX `idx_cpf` (`cpf`),
    INDEX `idx_referral_code` (`referral_code`),
    FOREIGN KEY (`referred_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: wallets (Carteiras)
-- ============================================
CREATE TABLE IF NOT EXISTS `wallets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `balance` DECIMAL(12,2) DEFAULT 0.00,
    `bonus` DECIMAL(12,2) DEFAULT 0.00,
    `locked_balance` DECIMAL(12,2) DEFAULT 0.00,
    `total_deposited` DECIMAL(12,2) DEFAULT 0.00,
    `total_withdrawn` DECIMAL(12,2) DEFAULT 0.00,
    `total_wagered` DECIMAL(12,2) DEFAULT 0.00,
    `total_won` DECIMAL(12,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: extractions (Horários e Resultados dos Sorteios)
-- ============================================
CREATE TABLE IF NOT EXISTS `extractions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('normal', 'instant') NOT NULL DEFAULT 'normal',
    `loteria` VARCHAR(50) NULL COMMENT 'PT RIO, PT SP, LOOK, LOTECE, LOTEP, FEDERAL, NACIONAL, PARA TODOS',
    `description` VARCHAR(120) NOT NULL COMMENT 'PPT, PTM, PTSP, PTBA, etc.',
    `close_time` TIME NOT NULL COMMENT 'Horário de fechamento',
    `extraction_date` DATE NULL COMMENT 'Data do sorteio (NULL para horários recorrentes)',
    `extraction_time` TIME NULL COMMENT 'Horário do sorteio',
    `game_type` VARCHAR(50) NOT NULL COMMENT 'PPT, PTM, PT, PTV, PTN, COR, FED, INSTANTANEA',
    `position_1` VARCHAR(10) NULL COMMENT 'Número do 1º prêmio',
    `position_2` VARCHAR(10) NULL COMMENT 'Número do 2º prêmio',
    `position_3` VARCHAR(10) NULL COMMENT 'Número do 3º prêmio',
    `position_4` VARCHAR(10) NULL COMMENT 'Número do 4º prêmio',
    `position_5` VARCHAR(10) NULL COMMENT 'Número do 5º prêmio',
    `position_6` VARCHAR(10) NULL COMMENT 'Número do 6º prêmio',
    `position_7` VARCHAR(10) NULL COMMENT 'Número do 7º prêmio',
    `animal_1` INT NULL COMMENT 'Animal do 1º prêmio',
    `animal_2` INT NULL COMMENT 'Animal do 2º prêmio',
    `animal_3` INT NULL COMMENT 'Animal do 3º prêmio',
    `animal_4` INT NULL COMMENT 'Animal do 4º prêmio',
    `animal_5` INT NULL COMMENT 'Animal do 5º prêmio',
    `animal_6` INT NULL COMMENT 'Animal do 6º prêmio',
    `animal_7` INT NULL COMMENT 'Animal do 7º prêmio',
    `status` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 1,
    `days_of_week` VARCHAR(255) NOT NULL DEFAULT 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO',
    `max_points` INT DEFAULT 10,
    `real_close_time` TIME NULL COMMENT 'Horário real de fechamento',
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`),
    INDEX `idx_date` (`extraction_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_game_type` (`game_type`),
    INDEX `idx_loteria` (`loteria`),
    INDEX `idx_extractions_active` (`is_active`),
    INDEX `idx_extractions_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: games (Resultados Brutos do Scraper)
-- ============================================
CREATE TABLE IF NOT EXISTS `games` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `caption` VARCHAR(255) NOT NULL COMMENT 'Data formatada do resultado',
    `type` VARCHAR(50) NOT NULL COMMENT 'PPT, PTM, PTSP, etc.',
    `position` INT NOT NULL COMMENT 'Posição do prêmio (1-7)',
    `result` VARCHAR(10) NOT NULL COMMENT 'Número sorteado',
    `animal` INT NULL COMMENT 'Código do animal',
    `state` VARCHAR(2) NULL COMMENT 'Estado (SP, RJ, BA, etc.)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`),
    INDEX `idx_caption` (`caption`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: bets (Apostas)
-- ============================================
CREATE TABLE IF NOT EXISTS `bets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `extraction_id` INT NULL COMMENT 'NULL para instantânea até criar, depois preenchido',
    `bet_type` ENUM('normal', 'instant') NOT NULL DEFAULT 'normal',
    `game_type` VARCHAR(50) NOT NULL COMMENT 'PPT, PTM, PT, INSTANTANEA, etc',
    `total_amount` DECIMAL(12,2) NOT NULL COMMENT 'Valor total da aposta',
    `status` ENUM('pending', 'settling', 'settled_won', 'settled_lost', 'cancelled') DEFAULT 'pending',
    `prize_amount` DECIMAL(12,2) DEFAULT 0 COMMENT 'Prêmio total creditado',
    `settled_at` TIMESTAMP NULL COMMENT 'Quando foi liquidada',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_extraction_id` (`extraction_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_bet_type` (`bet_type`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_bets_user_status` (`user_id`, `status`),
    INDEX `idx_bets_extraction_status` (`extraction_id`, `status`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`extraction_id`) REFERENCES `extractions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: bet_items (Linhas da Aposta)
-- ============================================
CREATE TABLE IF NOT EXISTS `bet_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bet_id` INT NOT NULL,
    `modality` VARCHAR(50) NOT NULL COMMENT 'grupo, milhar, centena, dezena, milhar-centena, passe-vai, passe-vai-vem',
    `bet_value` VARCHAR(255) NOT NULL COMMENT 'Número(s) ou animal(is) apostado(s)',
    `positions` VARCHAR(50) NOT NULL COMMENT '1, 3, 5, 7 ou 1-2, 1-5 para passe',
    `value_per_unit` DECIMAL(12,4) NOT NULL COMMENT 'Valor por unidade calculado',
    `units` INT NOT NULL COMMENT 'Quantidade de unidades desta linha',
    `multiplier` DECIMAL(10,2) NOT NULL COMMENT 'Multiplicador/odds desta modalidade',
    `potential_prize` DECIMAL(12,2) DEFAULT 0 COMMENT 'Prêmio potencial desta linha',
    `actual_prize` DECIMAL(12,2) DEFAULT 0 COMMENT 'Prêmio real creditado',
    `won` BOOLEAN DEFAULT FALSE COMMENT 'Se esta linha ganhou',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_bet_id` (`bet_id`),
    INDEX `idx_modality` (`modality`),
    INDEX `idx_won` (`won`),
    INDEX `idx_bet_items_bet_won` (`bet_id`, `won`),
    FOREIGN KEY (`bet_id`) REFERENCES `bets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: wallet_transactions (Transações de Carteira)
-- ============================================
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `wallet_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `type` ENUM('bet', 'prize', 'deposit', 'withdraw', 'refund', 'bonus', 'fee') NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `balance_before` DECIMAL(12,2) NOT NULL,
    `balance_after` DECIMAL(12,2) NOT NULL,
    `description` TEXT,
    `reference_type` VARCHAR(50) COMMENT 'bet, extraction, payment, etc',
    `reference_id` INT COMMENT 'ID da referência (bet_id, extraction_id, etc)',
    `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    `metadata` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_wallet_id` (`wallet_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_reference` (`reference_type`, `reference_id`),
    INDEX `idx_created_at` (`created_at`),
    INDEX `idx_transactions_user_type` (`user_id`, `type`),
    FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: payments (Pagamentos/Depósitos)
-- ============================================
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `payment_method` ENUM('pix', 'credit_card', 'bank_transfer') NOT NULL,
    `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    `external_id` VARCHAR(255) NULL COMMENT 'ID do gateway de pagamento',
    `pix_key` VARCHAR(255) NULL COMMENT 'Chave PIX gerada',
    `pix_qr_code` TEXT NULL COMMENT 'QR Code PIX',
    `gateway` VARCHAR(50) NULL COMMENT 'vizzionpay, cashtime, etc',
    `metadata` JSON,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_external_id` (`external_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: withdrawals (Saques)
-- ============================================
CREATE TABLE IF NOT EXISTS `withdrawals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `pix_key` VARCHAR(255) NOT NULL COMMENT 'Chave PIX para saque',
    `status` ENUM('pending', 'processing', 'completed', 'rejected', 'cancelled') DEFAULT 'pending',
    `external_id` VARCHAR(255) NULL COMMENT 'ID do gateway de pagamento',
    `gateway` VARCHAR(50) NULL COMMENT 'vizzionpay, cashtime, etc',
    `rejection_reason` TEXT NULL,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: settings (Configurações do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` TEXT NOT NULL,
    `description` TEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: banners (Banners Promocionais)
-- ============================================
CREATE TABLE IF NOT EXISTS `banners` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500) NULL,
    `position` VARCHAR(50) NOT NULL COMMENT 'home, top, sidebar, etc',
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_position` (`position`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: promotions (Promoções)
-- ============================================
CREATE TABLE IF NOT EXISTS `promotions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL COMMENT 'first_deposit, bonus, rollover, etc',
    `bonus_percentage` DECIMAL(5,2) NULL COMMENT 'Percentual de bônus',
    `min_deposit` DECIMAL(12,2) NULL COMMENT 'Depósito mínimo',
    `max_bonus` DECIMAL(12,2) NULL,
    `rollover_multiplier` DECIMAL(5,2) DEFAULT 1.00 COMMENT 'Multiplicador de rollover',
    `is_active` BOOLEAN DEFAULT TRUE,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`),
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: stories (Stories/Notícias)
-- ============================================
CREATE TABLE IF NOT EXISTS `stories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERIR CONFIGURAÇÕES INICIAIS
-- ============================================
INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) VALUES
('site_name', 'Jogo do Bicho', 'Nome do site'),
('site_url', 'https://seudominio.com.br', 'URL do site'),
('min_deposit', '10.00', 'Depósito mínimo'),
('min_withdraw', '20.00', 'Saque mínimo'),
('max_withdraw', '5000.00', 'Saque máximo'),
('pix_fee', '0.00', 'Taxa PIX'),
('timezone', 'America/Sao_Paulo', 'Timezone do sistema');

-- ============================================
-- INSERIR EXTRAÇÕES PADRÃO
-- ============================================
INSERT INTO `extractions` (`type`, `description`, `close_time`, `game_type`, `days_of_week`, `sort_order`, `is_active`) VALUES
('normal', 'PPT RIO 11:20', '11:20:00', 'PPT', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 1, TRUE),
('normal', 'PTM MANAUS 11:30', '11:30:00', 'PTM', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 2, TRUE),
('normal', 'PTSP SÃO PAULO 12:00', '12:00:00', 'PTSP', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 3, TRUE),
('normal', 'PTBA BAHIA 13:00', '13:00:00', 'PTBA', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 4, TRUE),
('normal', 'COR CORUJINHA 14:00', '14:00:00', 'COR', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 5, TRUE),
('normal', 'FED FEDERAL 15:00', '15:00:00', 'FED', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 6, TRUE),
('instant', 'INSTANTÂNEA', '23:59:59', 'INSTANTANEA', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO,DOMINGO', 99, TRUE);

