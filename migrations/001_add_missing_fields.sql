-- ============================================
-- MIGRAÇÃO 001: Adicionar campos faltantes e tabelas
-- Data: 2025-01-XX
-- ============================================

-- 1. Adicionar campos faltantes na tabela wallets
ALTER TABLE `wallets`
    ADD COLUMN IF NOT EXISTS `locked_balance` DECIMAL(12,2) DEFAULT 0.00 AFTER `bonus_balance`,
    ADD COLUMN IF NOT EXISTS `total_deposited` DECIMAL(12,2) DEFAULT 0.00 AFTER `locked_balance`,
    ADD COLUMN IF NOT EXISTS `total_withdrawn` DECIMAL(12,2) DEFAULT 0.00 AFTER `total_deposited`,
    ADD COLUMN IF NOT EXISTS `total_wagered` DECIMAL(12,2) DEFAULT 0.00 AFTER `total_withdrawn`,
    ADD COLUMN IF NOT EXISTS `total_won` DECIMAL(12,2) DEFAULT 0.00 AFTER `total_wagered`;

-- 2. Adicionar campo loteria na tabela extractions
ALTER TABLE `extractions`
    ADD COLUMN IF NOT EXISTS `loteria` VARCHAR(50) NULL COMMENT 'PT RIO, PT SP, LOOK, LOTECE, LOTEP, FEDERAL, NACIONAL, PARA TODOS' AFTER `description`,
    ADD INDEX IF NOT EXISTS `idx_loteria` (`loteria`);

-- Atualizar loteria baseado em description e game_type existentes
UPDATE `extractions` SET `loteria` = CASE
    WHEN `game_type` = 'PPT' OR `description` LIKE '%PPT%' OR `description` LIKE '%RIO%' THEN 'PT RIO'
    WHEN `game_type` = 'PTSP' OR `description` LIKE '%PTSP%' OR `description` LIKE '%SÃO PAULO%' THEN 'PT SP'
    WHEN `game_type` = 'PTM' OR `description` LIKE '%PTM%' OR `description` LIKE '%MANAUS%' THEN 'PT RIO'
    WHEN `game_type` = 'PTBA' OR `description` LIKE '%PTBA%' OR `description` LIKE '%BAHIA%' THEN 'PT RIO'
    WHEN `game_type` = 'COR' OR `description` LIKE '%COR%' THEN 'PT RIO'
    WHEN `game_type` = 'FED' OR `description` LIKE '%FEDERAL%' THEN 'FEDERAL'
    WHEN `game_type` = 'INSTANTANEA' THEN 'PARA TODOS'
    ELSE 'PT RIO'
END WHERE `loteria` IS NULL;

-- 3. Criar tabela odds (Cotações/Multiplicadores)
CREATE TABLE IF NOT EXISTS `odds` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `game_type` VARCHAR(50) NULL COMMENT 'PT RIO, PT SP, LOOK, etc ou NULL para todos',
    `bet_type` VARCHAR(50) NOT NULL COMMENT 'grupo, milhar, centena, etc',
    `position` INT NULL COMMENT 'Posição específica (1-7) ou NULL para geral',
    `multiplier` DECIMAL(10,2) NOT NULL COMMENT 'Multiplicador do prêmio',
    `min_bet` DECIMAL(10,2) DEFAULT 1.00,
    `max_bet` DECIMAL(10,2) DEFAULT 10000.00,
    `is_active` BOOLEAN DEFAULT TRUE,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_game_bet` (`game_type`, `bet_type`),
    INDEX `idx_active` (`is_active`),
    INDEX `idx_bet_type` (`bet_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Criar tabela modalities (Modalidades Ativas/Inativas)
CREATE TABLE IF NOT EXISTS `modalities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `modality_id` VARCHAR(50) UNIQUE NOT NULL COMMENT 'grupo, milhar, centena, etc',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Popular tabela odds com valores padrão (se ainda não existir dados)
INSERT INTO `odds` (`bet_type`, `position`, `multiplier`, `description`, `is_active`) VALUES
    ('grupo', 1, 20.00, 'Grupo - 1º Prêmio', TRUE),
    ('grupo', NULL, 20.00, 'Grupo - Geral', TRUE),
    ('milhar', 1, 6000.00, 'Milhar - 1º Prêmio', TRUE),
    ('milhar', NULL, 6000.00, 'Milhar - Geral', TRUE),
    ('centena', 1, 800.00, 'Centena - 1º Prêmio', TRUE),
    ('centena', NULL, 800.00, 'Centena - Geral', TRUE),
    ('dezena', 1, 80.00, 'Dezena - 1º Prêmio', TRUE),
    ('dezena', NULL, 80.00, 'Dezena - Geral', TRUE),
    ('milhar-centena', 1, 3300.00, 'Milhar/Centena - 1º Prêmio', TRUE),
    ('milhar-centena', NULL, 3300.00, 'Milhar/Centena - Geral', TRUE),
    ('dupla-grupo', NULL, 21.75, 'Dupla de Grupo', TRUE),
    ('terno-grupo', NULL, 150.00, 'Terno de Grupo', TRUE),
    ('quadra-grupo', NULL, 1000.00, 'Quadra de Grupo', TRUE),
    ('milhar-invertida', 1, 6000.00, 'Milhar Invertida - 1º Prêmio', TRUE),
    ('milhar-invertida', NULL, 6000.00, 'Milhar Invertida - Geral', TRUE),
    ('centena-invertida', 1, 800.00, 'Centena Invertida - 1º Prêmio', TRUE),
    ('centena-invertida', NULL, 800.00, 'Centena Invertida - Geral', TRUE),
    ('dezena-invertida', 1, 80.00, 'Dezena Invertida - 1º Prêmio', TRUE),
    ('dezena-invertida', NULL, 80.00, 'Dezena Invertida - Geral', TRUE),
    ('duque-dezena', NULL, 350.00, 'Duque de Dezena', TRUE),
    ('terno-dezena', NULL, 3500.00, 'Terno de Dezena', TRUE),
    ('passe-vai-1-2', NULL, 180.00, 'Passe Vai 1-2', TRUE),
    ('passe-vai-1-5', NULL, 90.00, 'Passe Vai 1-5', TRUE),
    ('passe-vai-vem-1-2', NULL, 90.00, 'Passe Vai-e-Vem 1-2', TRUE),
    ('passe-vai-vem-1-5', NULL, 45.00, 'Passe Vai-e-Vem 1-5', TRUE)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- 6. Popular tabela modalities com todas as modalidades (se ainda não existir dados)
INSERT INTO `modalities` (`modality_id`, `is_active`) VALUES
    ('grupo', TRUE),
    ('dupla-grupo', TRUE),
    ('terno-grupo', TRUE),
    ('quadra-grupo', TRUE),
    ('dezena', TRUE),
    ('dezena-invertida', TRUE),
    ('centena', TRUE),
    ('centena-invertida', TRUE),
    ('milhar', TRUE),
    ('milhar-invertida', TRUE),
    ('milhar-centena', TRUE),
    ('duque-dezena', TRUE),
    ('terno-dezena', TRUE),
    ('passe-vai', TRUE),
    ('passe-vai-vem', TRUE)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- 7. Adicionar campo animal como VARCHAR na tabela games (para compatibilidade)
-- Nota: O campo animal já existe como INT, vamos manter assim mas documentar
-- Se necessário converter para VARCHAR no futuro, usar: ALTER TABLE `games` MODIFY `animal` VARCHAR(50);

