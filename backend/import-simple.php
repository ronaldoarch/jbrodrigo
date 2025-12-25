<?php
/**
 * Script Simples para Importar Banco de Dados
 * Execute: php import-simple.php
 */

require_once __DIR__ . '/scraper/config/database.php';

echo "🚀 Iniciando importação do banco de dados...\n\n";

try {
    $db = getDB();
    echo "✅ Conexão estabelecida!\n\n";
    
    // Baixar SQL do GitHub
    echo "📥 Baixando database.sql do GitHub...\n";
    $sql = file_get_contents('https://raw.githubusercontent.com/ronaldoarch/jbrodrigo/main/database.sql');
    
    if (!$sql) {
        throw new Exception("Não foi possível baixar o arquivo SQL");
    }
    
    echo "✅ Arquivo baixado (" . strlen($sql) . " bytes)\n\n";
    
    // Processar SQL
    echo "📝 Processando comandos SQL...\n";
    
    // Remover comentários
    $sql = preg_replace('/--.*$/m', '', $sql);
    $sql = preg_replace('/\/\*.*?\*\//s', '', $sql);
    
    // Dividir em comandos
    $commands = array_filter(
        array_map('trim', explode(';', $sql)),
        function($cmd) {
            return !empty($cmd) && 
                   !preg_match('/^(SET|USE)/i', $cmd) &&
                   strlen($cmd) > 10;
        }
    );
    
    echo "   Encontrados " . count($commands) . " comandos\n\n";
    
    $success = 0;
    $skipped = 0;
    $errors = 0;
    
    foreach ($commands as $index => $command) {
        try {
            $db->exec($command);
            $success++;
            
            if (($index + 1) % 5 == 0) {
                echo "   ✅ " . ($index + 1) . " comandos processados...\n";
            }
        } catch (PDOException $e) {
            $msg = $e->getMessage();
            // Ignorar erros de tabela já existe
            if (strpos($msg, 'already exists') !== false || 
                strpos($msg, 'Duplicate') !== false ||
                strpos($msg, 'already exist') !== false) {
                $skipped++;
            } else {
                echo "   ⚠️  Erro: " . substr($msg, 0, 80) . "...\n";
                $errors++;
            }
        }
    }
    
    echo "\n";
    echo "✅ Importação concluída!\n";
    echo "   Sucesso: $success comandos\n";
    if ($skipped > 0) {
        echo "   Ignorados (já existem): $skipped comandos\n";
    }
    if ($errors > 0) {
        echo "   Erros: $errors comandos\n";
    }
    
    // Verificar tabelas
    echo "\n📊 Verificando tabelas...\n";
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "   ✅ " . count($tables) . " tabelas encontradas:\n";
    foreach ($tables as $table) {
        echo "      - $table\n";
    }
    
    // Verificar settings
    echo "\n⚙️  Verificando configurações...\n";
    try {
        $stmt = $db->query("SELECT COUNT(*) as total FROM settings");
        $count = $stmt->fetch()['total'];
        echo "   ✅ $count configurações encontradas\n";
    } catch (Exception $e) {
        echo "   ⚠️  Tabela settings não encontrada\n";
    }
    
    echo "\n🎉 Banco de dados importado com sucesso!\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}

