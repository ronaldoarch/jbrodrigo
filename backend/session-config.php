<?php
/**
 * Configuração de Sessões para Cross-Domain
 * 
 * Este arquivo deve ser incluído ANTES de qualquer session_start()
 */

// Só configurar se a sessão ainda não foi iniciada
if (session_status() === PHP_SESSION_NONE) {
    // Configurar nome da sessão
    session_name('JBRODRIGO_SESSION');
    
    // Configurar cookies de sessão para funcionar cross-domain
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'None');
    ini_set('session.cookie_secure', '1'); // Apenas HTTPS
    ini_set('session.use_only_cookies', '1');
    
    // Configurar parâmetros do cookie manualmente ANTES de session_start()
    session_set_cookie_params([
        'lifetime' => 0, // Até fechar o navegador
        'path' => '/',
        'domain' => '', // Vazio = permite cross-domain
        'secure' => true, // Apenas HTTPS
        'httponly' => true,
        'samesite' => 'None' // Permite cross-domain
    ]);
}

