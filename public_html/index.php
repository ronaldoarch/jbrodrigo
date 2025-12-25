<?php
/**
 * Entry Point - Redireciona para o frontend React
 * Este arquivo deve estar na raiz do public_html
 */

// Se o arquivo solicitado existe, servir normalmente
if (file_exists($_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI']) && 
    !is_dir($_SERVER['DOCUMENT_ROOT'] . $_SERVER['REQUEST_URI'])) {
    return false;
}

// Caso contrário, servir index.html do React
readfile(__DIR__ . '/index.html');

