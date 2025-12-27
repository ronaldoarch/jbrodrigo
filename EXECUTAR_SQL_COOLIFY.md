# 🎲 Executar SQL do Bingo via Coolify

## ⚠️ Problema: PHP não encontrado

Se você receber `php: not found`, siga estes passos:

### Passo 1: Verificar o container correto

No terminal do Coolify, certifique-se de estar no container **principal da aplicação** (não no container de build/helper).

### Passo 2: Tentar caminhos alternativos

Tente um destes comandos:

```bash
# Tentar com caminho completo
/usr/local/bin/php backend/bingo/apply-sql-via-terminal.php

# Ou verificar onde está o PHP
which php
whereis php
```

### Passo 3: Verificar se o arquivo existe

```bash
# Verificar se o script existe
ls -la backend/bingo/apply-sql-via-terminal.php

# Ver conteúdo do diretório
ls -la backend/bingo/
```

### Passo 4: Executar via HTTP (Alternativa)

Se o PHP CLI não funcionar, você pode executar o script via HTTP criando um endpoint temporário.

## ✅ Solução Recomendada: Via MySQL Direto

Se o PHP CLI não estiver disponível, a melhor alternativa é executar o SQL diretamente no MySQL:

### No Coolify Terminal:

```bash
# Conectar ao MySQL (usando variáveis de ambiente)
mysql -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE
```

Depois, cole este SQL:

```sql
CREATE TABLE IF NOT EXISTS `bingo_games` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `seed` VARCHAR(255) NOT NULL,
    `numbers_drawn` TEXT NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Verificar se funcionou:

```sql
SHOW TABLES LIKE 'bingo%';
```

Deve retornar:
- `bingo_games`
- `bingo_cards`

## 🔄 Forçar Rebuild no Coolify

Para garantir que o código mais recente seja usado:

1. No painel do Coolify, clique em **"Redeploy"**
2. **OU** faça um commit vazio para forçar rebuild:
   ```bash
   git commit --allow-empty -m "force rebuild"
   git push origin main
   ```

