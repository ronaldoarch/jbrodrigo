<?php
/**
 * Script temporário para aplicar SQL do Keno via HTTP
 * 
 * ATENÇÃO: Remova este arquivo após aplicar o SQL por segurança!
 */

header('Content-Type: application/json; charset=utf-8');

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
    $response['messages'][] = "📝 Criando tabela keno_games...";
    try {
        $db->exec($sql_keno_games);
        $executed++;
        $response['messages'][] = "✅ Tabela keno_games criada com sucesso";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'already exists') !== false || strpos($e->getMessage(), 'Duplicate table') !== false) {
            $response['messages'][] = "⚠️ Tabela keno_games já existe (continuando...)";
        } else {
            $errors++;
            $response['messages'][] = "❌ Erro ao criar keno_games: " . $e->getMessage();
            throw $e;
        }
    }
    
    // Verificar se tabelas foram criadas
    $response['messages'][] = "🔍 Verificando tabelas...";
    $stmt = $db->query("SHOW TABLES LIKE 'keno%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        $response['messages'][] = "✅ Tabelas encontradas: " . implode(', ', $tables);
        $response['tables_created'] = $tables;
        $response['success'] = true;
    } else {
        $response['messages'][] = "❌ Nenhuma tabela keno encontrada";
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

