# 🎲 Aplicar SQL do Bingo via Coolify

## Método 1: Via Interface do Coolify

1. Acesse o painel do Coolify
2. Vá até seu serviço de banco de dados (Railway/MySQL)
3. Procure por "Console" ou "SQL Console" ou "Database"
4. Clique para abrir o console SQL
5. Cole o conteúdo abaixo e execute

## Método 2: Via Terminal/SSH do Coolify

1. Acesse o terminal do banco via Coolify
2. Execute:
```bash
mysql -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
```
3. Cole o SQL abaixo

## 📋 SQL para Executar

Copie e cole o seguinte SQL no console:

```sql
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
```

## ✅ Verificar se Funcionou

Após executar, verifique se as tabelas foram criadas:

```sql
SHOW TABLES LIKE 'bingo%';
```

Deve retornar:
- `bingo_games`
- `bingo_cards`

E verifique a estrutura:

```sql
DESCRIBE bingo_games;
DESCRIBE bingo_cards;
```

## 🎯 Pronto!

Após executar o SQL, o módulo Bingo estará pronto para uso!

