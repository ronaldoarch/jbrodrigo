<?php
/**
 * Script para Importar Banco de Dados
 * Execute via terminal: php import-database.php
 */

require_once __DIR__ . '/scraper/config/database.php';

echo "🚀 Iniciando importação do banco de dados...\n\n";

try {
    $db = getDB();
    echo "✅ Conexão com banco estabelecida!\n\n";
    
    // Ler arquivo SQL
    $sqlFile = __DIR__ . '/../../database.sql';
    
    if (!file_exists($sqlFile)) {
        throw new Exception("Arquivo database.sql não encontrado em: $sqlFile");
    }
    
    echo "📖 Lendo arquivo SQL...\n";
    $sql = file_get_contents($sqlFile);
    
    // Remover comentários e quebrar em comandos
    $sql = preg_replace('/--.*$/m', '', $sql);
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
    
    // Dividir em comandos individuais
    $commands = array_filter(
        array_map('trim', explode(';', $sql)),
        function($cmd) {
            return !empty($cmd) && !preg_match('/^(SET|USE)/i', $cmd);
        }
    );
    
    echo "📝 Encontrados " . count($commands) . " comandos SQL\n\n";
    
    $success = 0;
    $errors = 0;
    
    foreach ($commands as $index => $command) {
        if (empty(trim($command))) {
            continue;
        }
        
        try {
            $db->exec($command);
            $success++;
            
            // Mostrar progresso a cada 5 comandos
            if (($index + 1) % 5 == 0) {
                echo "✅ Processados " . ($index + 1) . " comandos...\n";
            }
        } catch (PDOException $e) {
            // Ignorar erros de "table already exists" e "duplicate key"
            if (strpos($e->getMessage(), 'already exists') === false && 
                strpos($e->getMessage(), 'Duplicate') === false) {
                echo "⚠️  Erro no comando " . ($index + 1) . ": " . $e->getMessage() . "\n";
                $errors++;
            } else {
                $success++;
            }
        }
    }
    
    echo "\n";
    echo "✅ Importação concluída!\n";
    echo "   Sucesso: $success comandos\n";
    if ($errors > 0) {
        echo "   Erros: $errors comandos\n";
    }
    
    // Verificar tabelas criadas
    echo "\n📊 Verificando tabelas criadas...\n";
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "   Tabelas encontradas: " . count($tables) . "\n";
    foreach ($tables as $table) {
        echo "   - $table\n";
    }
    
    echo "\n🎉 Banco de dados importado com sucesso!\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}

