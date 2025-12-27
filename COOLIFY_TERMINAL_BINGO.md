# 🎲 Aplicar SQL do Bingo via Terminal do Coolify

## Método 1: Via Script PHP (Recomendado)

1. Acesse o terminal do Coolify (no serviço do backend PHP)
2. Navegue até o diretório do projeto
3. Execute:

```bash
php backend/bingo/apply-sql-via-terminal.php
```

O script irá:
- Conectar ao banco usando as variáveis de ambiente
- Criar as tabelas `bingo_games` e `bingo_cards`
- Verificar se foram criadas com sucesso

## Método 2: Via MySQL Client Direto

Se tiver acesso ao mysql-client no container:

```bash
# Conectar ao banco (usando variáveis de ambiente do Coolify)
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE

# Ou se usar nomes diferentes:
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME
```

Depois, cole o SQL:

```sql
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

## Método 3: Via Arquivo SQL

1. Copie o conteúdo de `database_bingo_coolify.sql`
2. No terminal do Coolify, crie um arquivo temporário:

```bash
cat > /tmp/bingo.sql << 'EOF'
[cole o conteúdo do database_bingo_coolify.sql aqui]
EOF
```

3. Execute via mysql:

```bash
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < /tmp/bingo.sql
```

## ✅ Verificar se Funcionou

No terminal do Coolify ou via mysql:

```sql
SHOW TABLES LIKE 'bingo%';
```

Deve retornar:
- `bingo_games`
- `bingo_cards`

E verificar estrutura:

```sql
DESCRIBE bingo_games;
DESCRIBE bingo_cards;
```

## 🎯 Recomendação

**Use o Método 1** (script PHP), pois:
- ✅ Usa a mesma conexão do sistema
- ✅ Verifica variáveis de ambiente automaticamente
- ✅ Mostra feedback visual
- ✅ Trata erros graciosamente

