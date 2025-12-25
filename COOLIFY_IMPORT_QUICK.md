# ⚡ Importação Rápida do Banco - Coolify

## 🎯 Método Mais Simples: Via MySQL Direto

### No Terminal do Coolify:

```bash
# 1. Instalar mysql-client
apt-get update && apt-get install -y mysql-client

# 2. Criar arquivo SQL temporário
cat > /tmp/import.sql << 'ENDOFSQL'
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

CREATE TABLE IF NOT EXISTS `wallets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `balance` DECIMAL(12,2) DEFAULT 0.00,
    `bonus_balance` DECIMAL(12,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `extractions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('normal', 'instant') NOT NULL DEFAULT 'normal',
    `description` VARCHAR(120) NOT NULL,
    `close_time` TIME NOT NULL,
    `extraction_date` DATE NULL,
    `extraction_time` TIME NULL,
    `game_type` VARCHAR(50) NOT NULL,
    `position_1` VARCHAR(10) NULL,
    `position_2` VARCHAR(10) NULL,
    `position_3` VARCHAR(10) NULL,
    `position_4` VARCHAR(10) NULL,
    `position_5` VARCHAR(10) NULL,
    `position_6` VARCHAR(10) NULL,
    `position_7` VARCHAR(10) NULL,
    `animal_1` INT NULL,
    `animal_2` INT NULL,
    `animal_3` INT NULL,
    `animal_4` INT NULL,
    `animal_5` INT NULL,
    `animal_6` INT NULL,
    `animal_7` INT NULL,
    `status` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 1,
    `days_of_week` VARCHAR(255) NOT NULL DEFAULT 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO',
    `max_points` INT DEFAULT 10,
    `real_close_time` TIME NULL,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`),
    INDEX `idx_date` (`extraction_date`),
    INDEX `idx_status` (`status`),
    INDEX `idx_game_type` (`game_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `games` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `caption` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `position` INT NOT NULL,
    `result` VARCHAR(10) NOT NULL,
    `animal` INT NULL,
    `state` VARCHAR(2) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`),
    INDEX `idx_caption` (`caption`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `extraction_id` INT NULL,
    `bet_type` ENUM('normal', 'instant') NOT NULL DEFAULT 'normal',
    `game_type` VARCHAR(50) NOT NULL,
    `total_amount` DECIMAL(12,2) NOT NULL,
    `status` ENUM('pending', 'settling', 'settled_won', 'settled_lost', 'cancelled') DEFAULT 'pending',
    `prize_amount` DECIMAL(12,2) DEFAULT 0,
    `settled_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_extraction_id` (`extraction_id`),
    INDEX `idx_status` (`status`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`extraction_id`) REFERENCES `extractions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bet_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `bet_id` INT NOT NULL,
    `modality` VARCHAR(50) NOT NULL,
    `bet_value` VARCHAR(255) NOT NULL,
    `positions` VARCHAR(50) NOT NULL,
    `value_per_unit` DECIMAL(12,4) NOT NULL,
    `units` INT NOT NULL,
    `multiplier` DECIMAL(10,2) NOT NULL,
    `potential_prize` DECIMAL(12,2) DEFAULT 0,
    `actual_prize` DECIMAL(12,2) DEFAULT 0,
    `won` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_bet_id` (`bet_id`),
    FOREIGN KEY (`bet_id`) REFERENCES `bets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `wallet_transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `wallet_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `type` ENUM('bet', 'prize', 'deposit', 'withdraw', 'refund', 'bonus', 'fee') NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `balance_before` DECIMAL(12,2) NOT NULL,
    `balance_after` DECIMAL(12,2) NOT NULL,
    `description` TEXT,
    `reference_type` VARCHAR(50),
    `reference_id` INT,
    `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    `metadata` JSON,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_wallet_id` (`wallet_id`),
    INDEX `idx_user_id` (`user_id`),
    FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `payment_method` ENUM('pix', 'credit_card', 'bank_transfer') NOT NULL,
    `status` ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    `external_id` VARCHAR(255) NULL,
    `pix_key` VARCHAR(255) NULL,
    `pix_qr_code` TEXT NULL,
    `gateway` VARCHAR(50) NULL,
    `metadata` JSON,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `withdrawals` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `pix_key` VARCHAR(255) NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'rejected', 'cancelled') DEFAULT 'pending',
    `external_id` VARCHAR(255) NULL,
    `gateway` VARCHAR(50) NULL,
    `rejection_reason` TEXT NULL,
    `processed_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` TEXT NOT NULL,
    `description` TEXT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `banners` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500) NULL,
    `position` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_position` (`position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `promotions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `bonus_percentage` DECIMAL(5,2) NULL,
    `min_deposit` DECIMAL(12,2) NULL,
    `max_bonus` DECIMAL(12,2) NULL,
    `rollover_multiplier` DECIMAL(5,2) DEFAULT 1.00,
    `is_active` BOOLEAN DEFAULT TRUE,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `link_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`setting_key`, `setting_value`, `description`) VALUES
('site_name', 'Jogo do Bicho', 'Nome do site'),
('site_url', 'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com', 'URL do site'),
('min_deposit', '10.00', 'Depósito mínimo'),
('min_withdraw', '20.00', 'Saque mínimo'),
('max_withdraw', '5000.00', 'Saque máximo'),
('pix_fee', '0.00', 'Taxa PIX'),
('timezone', 'America/Sao_Paulo', 'Timezone do sistema');

INSERT INTO `extractions` (`type`, `description`, `close_time`, `game_type`, `days_of_week`, `sort_order`, `is_active`) VALUES
('normal', 'PPT RIO 11:20', '11:20:00', 'PPT', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 1, TRUE),
('normal', 'PTM MANAUS 11:30', '11:30:00', 'PTM', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 2, TRUE),
('normal', 'PTSP SÃO PAULO 12:00', '12:00:00', 'PTSP', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 3, TRUE),
('normal', 'PTBA BAHIA 13:00', '13:00:00', 'PTBA', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 4, TRUE),
('normal', 'COR CORUJINHA 14:00', '14:00:00', 'COR', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 5, TRUE),
('normal', 'FED FEDERAL 15:00', '15:00:00', 'FED', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO', 6, TRUE),
('instant', 'INSTANTÂNEA', '23:59:59', 'INSTANTANEA', 'SEGUNDA,TERÇA,QUARTA,QUINTA,SEXTA,SABADO,DOMINGO', 99, TRUE);
ENDOFSQL

# 3. Importar usando mysql
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p'wktlYoHTkATnPgiUrvSBVkxHcNACjprR' railway < /tmp/import.sql

# 4. Verificar tabelas criadas
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p'wktlYoHTkATnPgiUrvSBVkxHcNACjprR' railway -e "SHOW TABLES;"
```

## ✅ Método Alternativo: Via PHP (Mais Simples)

```bash
# No terminal do Coolify
cd /var/www/html

# Verificar se arquivo existe
ls -la import-database.php

# Se não existir, criar script inline
php -r "
require '/var/www/html/scraper/config/database.php';
\$db = getDB();
\$sql = file_get_contents('https://raw.githubusercontent.com/ronaldoarch/jbrodrigo/main/database.sql');
\$commands = explode(';', \$sql);
foreach (\$commands as \$cmd) {
    \$cmd = trim(\$cmd);
    if (!empty(\$cmd) && !preg_match('/^(SET|USE|--)/i', \$cmd)) {
        try {
            \$db->exec(\$cmd);
        } catch (Exception \$e) {
            // Ignorar erros de tabela já existe
        }
    }
}
echo 'Importação concluída!';
"
```

## 🎯 Método Mais Rápido: Copiar SQL do GitHub

```bash
# No terminal do Coolify
cd /tmp

# Baixar database.sql do GitHub
curl -o database.sql https://raw.githubusercontent.com/ronaldoarch/jbrodrigo/main/database.sql

# Importar
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p'wktlYoHTkATnPgiUrvSBVkxHcNACjprR' railway < database.sql

# Verificar
mysql -h mainline.proxy.rlwy.net -P 44951 -u root -p'wktlYoHTkATnPgiUrvSBVkxHcNACjprR' railway -e "SHOW TABLES;"
```

## ✅ Após Importar

Teste a API:

```bash
curl http://localhost/api/config.php
```

Deve retornar JSON com as configurações!

