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
        // Suporte para variáveis de ambiente (Railway, VPS, Coolify, etc.)
        // Prioridade: MYSQL_* (Railway) > DB_* (genérico) > padrão
        
        // Railway usa MYSQL_* como prefixo
        $host = getenv('MYSQL_HOST') ?: getenv('DB_HOST') ?: 'localhost';
        $port = getenv('MYSQL_PORT') ?: getenv('DB_PORT') ?: '3306';
        $dbname = getenv('MYSQL_DATABASE') ?: getenv('MYSQLDATABASE') ?: getenv('DB_NAME') ?: 'railway';
        $username = getenv('MYSQL_USER') ?: getenv('MYSQLUSER') ?: getenv('DB_USER') ?: 'root';
        $password = getenv('MYSQL_PASSWORD') ?: getenv('MYSQLPASSWORD') ?: getenv('MYSQL_ROOT_PASSWORD') ?: getenv('DB_PASSWORD') ?: '';
        
        // Log para debug (remover em produção se necessário)
        error_log("Tentando conectar: host=$host, port=$port, db=$dbname, user=$username");
        
        try {
            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5
            ];
            
            // Para Railway e outros serviços com SSL (se necessário)
            if (getenv('DB_SSL') === 'true' || getenv('MYSQL_SSL') === 'true') {
                $options[PDO::MYSQL_ATTR_SSL_CA] = '/etc/ssl/certs/ca-certificates.crt';
                $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
            }
            
            $db = new PDO($dsn, $username, $password, $options);
            error_log("Conexão com banco estabelecida com sucesso");
        } catch (PDOException $e) {
            error_log("Erro de conexão: " . $e->getMessage());
            error_log("DSN tentado: $dsn");
            throw new Exception("Erro ao conectar ao banco de dados: " . $e->getMessage());
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

