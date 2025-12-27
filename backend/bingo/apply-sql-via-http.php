<?php
/**
 * Script temporário para aplicar SQL do Bingo via HTTP
 * 
 * ATENÇÃO: Remova este arquivo após aplicar o SQL por segurança!
 * 
 * Uso: Acesse via navegador ou curl:
 * https://seu-backend.com/backend/bingo/apply-sql-via-http.php
 */

header('Content-Type: application/json; charset=utf-8');

// Permitir apenas acesso local ou com token (descomente e defina um token)
// $token = $_GET['token'] ?? '';
// if ($token !== 'SEU_TOKEN_SECRETO_AQUI') {
//     http_response_code(403);
//     echo json_encode(['error' => 'Token inválido']);
//     exit;
// }

require_once __DIR__ . '/../scraper/config/database.php';

$response = [
    'success' => false,
    'messages' => [],
    'tables_created' => []
];

try {
    $db = getDB();
    
    $executed = 0;
    $errors = 0;
    
    // SQL da tabela bingo_games (PRIMEIRO - não depende de outras)
    $sql_bingo_games = "CREATE TABLE IF NOT EXISTS `bingo_games` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `seed` VARCHAR(255) NOT NULL,
        `numbers_drawn` TEXT NOT NULL,
        `status` ENUM('active', 'finished') DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_status` (`status`),
        INDEX `idx_created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    // Criar bingo_games primeiro
    $response['messages'][] = "📝 Criando tabela bingo_games...";
    try {
        $db->exec($sql_bingo_games);
        $executed++;
        $response['messages'][] = "✅ Tabela bingo_games criada com sucesso";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate table') !== false) {
            $response['messages'][] = "⚠️ Tabela bingo_games já existe (continuando...)";
        } else {
            $errors++;
            $response['messages'][] = "❌ Erro ao criar bingo_games: " . $e->getMessage();
            throw $e;
        }
    }
    
    // Verificar se bingo_games existe antes de criar bingo_cards
    $stmt = $db->query("SHOW TABLES LIKE 'bingo_games'");
    if ($stmt->rowCount() == 0) {
        throw new Exception("Tabela bingo_games não foi criada. Não é possível criar bingo_cards.");
    }
    
    // SQL da tabela bingo_cards (SEGUNDO - depende de bingo_games e users)
    $sql_bingo_cards = "CREATE TABLE IF NOT EXISTS `bingo_cards` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    // Criar bingo_cards depois
    $response['messages'][] = "📝 Criando tabela bingo_cards...";
    try {
        $db->exec($sql_bingo_cards);
        $executed++;
        $response['messages'][] = "✅ Tabela bingo_cards criada com sucesso";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate table') !== false) {
            $response['messages'][] = "⚠️ Tabela bingo_cards já existe (continuando...)";
        } else {
            $errors++;
            $response['messages'][] = "❌ Erro ao criar bingo_cards: " . $e->getMessage();
            throw $e;
        }
    }
    
    // Verificar se tabelas foram criadas
    $response['messages'][] = "🔍 Verificando tabelas...";
    $stmt = $db->query("SHOW TABLES LIKE 'bingo%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        $response['messages'][] = "✅ Tabelas encontradas: " . implode(', ', $tables);
        $response['tables_created'] = $tables;
        $response['success'] = true;
    } else {
        $response['messages'][] = "❌ Nenhuma tabela bingo encontrada";
    }
    
    $response['messages'][] = "🎉 Concluído!";
    $response['executed'] = $executed;
    $response['errors'] = $errors;
    
    http_response_code(200);
    
} catch (Exception $e) {
    http_response_code(500);
    $response['success'] = false;
    $response['messages'][] = "❌ Erro fatal: " . $e->getMessage();
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

