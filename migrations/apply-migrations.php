<?php
/**
 * Script para aplicar migrações do banco de dados
 * 
 * Uso: php migrations/apply-migrations.php
 */

require_once __DIR__ . '/../backend/scraper/config/database.php';

echo "🔄 Aplicando migrações...\n\n";

try {
    $db = getDB();
    
    // Lista de migrações em ordem
    $migrations = [
        '001_add_missing_fields.sql'
    ];
    
    foreach ($migrations as $migration) {
        $migrationPath = __DIR__ . '/' . $migration;
        
        if (!file_exists($migrationPath)) {
            echo "❌ Arquivo não encontrado: $migration\n";
            continue;
        }
        
        echo "📄 Aplicando: $migration\n";
        
        $sql = file_get_contents($migrationPath);
        
        // Separar comandos SQL (separados por ;)
        // Remover comentários e quebras de linha
        $sql = preg_replace('/--.*$/m', '', $sql);
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
        
        // Separar por ponto e vírgula, mas não dentro de strings
        $statements = [];
        $current = '';
        $inString = false;
        $stringChar = '';
        
        for ($i = 0; $i < strlen($sql); $i++) {
            $char = $sql[$i];
            $current .= $char;
            
            if (!$inString && ($char === '"' || $char === "'")) {
                $inString = true;
                $stringChar = $char;
            } elseif ($inString && $char === $stringChar && $sql[$i-1] !== '\\') {
                $inString = false;
                $stringChar = '';
            } elseif (!$inString && $char === ';') {
                $statements[] = trim($current);
                $current = '';
            }
        }
        
        if (trim($current)) {
            $statements[] = trim($current);
        }
        
        // Executar cada statement
        $executed = 0;
        $errors = 0;
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (empty($statement)) {
                continue;
            }
            
            try {
                // Usar exec para comandos DDL (CREATE, ALTER, etc)
                if (preg_match('/^\s*(CREATE|ALTER|INSERT|UPDATE|DELETE|DROP)\s+/i', $statement)) {
                    $db->exec($statement);
                    $executed++;
                } else {
                    // Para outros comandos, usar prepare/execute
                    $stmt = $db->prepare($statement);
                    $stmt->execute();
                    $executed++;
                }
            } catch (PDOException $e) {
                // Ignorar erros de "column already exists" ou "table already exists"
                if (strpos($e->getMessage(), 'already exists') !== false || 
                    strpos($e->getMessage(), 'Duplicate column name') !== false ||
                    strpos($e->getMessage(), 'Duplicate key') !== false) {
                    echo "  ⚠️  Já existe: " . substr($statement, 0, 50) . "...\n";
                } else {
                    $errors++;
                    echo "  ❌ Erro: " . $e->getMessage() . "\n";
                    echo "  SQL: " . substr($statement, 0, 100) . "...\n";
                }
            }
        }
        
        echo "  ✅ Executados: $executed statements\n";
        if ($errors > 0) {
            echo "  ❌ Erros: $errors\n";
        }
        echo "\n";
    }
    
    echo "✅ Migrações concluídas!\n";
    
} catch (Exception $e) {
    echo "❌ Erro fatal: " . $e->getMessage() . "\n";
    exit(1);
}

