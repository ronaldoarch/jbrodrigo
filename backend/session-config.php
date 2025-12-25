<?php
/**
 * Configuração de Sessões para Cross-Domain
 * 
 * Este arquivo deve ser incluído ANTES de qualquer session_start()
 */

// Configurar cookies de sessão para funcionar cross-domain
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '1'); // Apenas HTTPS
ini_set('session.use_only_cookies', '1');

// Configurar domínio do cookie (vazio permite cross-domain)
// IMPORTANTE: Não definir session.cookie_domain permite cookies cross-domain
// quando SameSite=None e Secure=true estão configurados

// Configurar nome da sessão
if (!session_id()) {
    session_name('JBRODRIGO_SESSION');
}

