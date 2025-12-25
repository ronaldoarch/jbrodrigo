<?php
/**
 * Arquivo de Exemplo de Configuração do Banco de Dados
 * 
 * Copie este arquivo para database.php e configure as credenciais
 * 
 * Para Railway: Use variáveis de ambiente
 * Para Hostinger: Use credenciais diretas
 */

function getDB() {
    static $db = null;
    
    if ($db === null) {
        // ============================================
        // OPÇÃO 1: Railway (Recomendado para produção)
        // ============================================
        // Configure as variáveis de ambiente no VPS:
        // export MYSQL_HOST=containers-us-west-xxx.railway.app
        // export MYSQL_PORT=3306
        // export MYSQL_DATABASE=railway
        // export MYSQL_USER=root
        // export MYSQL_PASSWORD=sua_senha
        // export MYSQL_SSL=true
        
        // ============================================
        // OPÇÃO 2: Hostinger (Tudo em um lugar)
        // ============================================
        $host = 'localhost';
        $port = '3306';
        $dbname = 'u123456789_jogo_bicho'; // Exemplo Hostinger
        $username = 'u123456789_admin';
        $password = 'sua_senha_segura';
        
        // ============================================
        // OPÇÃO 3: VPS com MySQL local
        // ============================================
        // $host = 'localhost';
        // $port = '3306';
        // $dbname = 'jogo_do_bicho';
        // $username = 'jogo_user';
        // $password = 'senha_segura';
        
        try {
            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];
            
            // Habilitar SSL se necessário (Railway)
            // $options[PDO::MYSQL_ATTR_SSL_CA] = '/etc/ssl/certs/ca-certificates.crt';
            
            $db = new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            error_log("Erro de conexão: " . $e->getMessage());
            throw new Exception("Erro ao conectar ao banco de dados");
        }
    }
    
    return $db;
}

/**
 * Retorna o timezone configurado
 */
function getTimezone() {
    return 'America/Sao_Paulo';
}

/**
 * Configura o timezone padrão
 */
date_default_timezone_set(getTimezone());

