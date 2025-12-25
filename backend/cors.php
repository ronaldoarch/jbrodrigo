<?php
/**
 * Configuração de CORS
 * Permite requisições do frontend na Hostinger
 * 
 * IMPORTANTE: Este arquivo deve ser incluído ANTES de qualquer output ou session_start()
 */

// Garantir que não há output antes dos headers
if (ob_get_level()) {
    ob_clean();
}

// Lista de origens permitidas
$allowedOrigins = [
    'https://tradicaodobicho.site',
    'https://www.tradicaodobicho.site',
    'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com',
    'http://localhost:3000', // Para desenvolvimento
    'http://localhost:5173', // Vite dev server
];

// Permitir configuração via variável de ambiente
$envOrigins = getenv('CORS_ORIGINS');
if ($envOrigins) {
    $allowedOrigins = array_merge($allowedOrigins, explode(',', $envOrigins));
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Verificar se a origem está na lista de permitidas
if (!empty($origin) && in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin", true);
} elseif (!empty($origin)) {
    // Se origem não está na lista, não permitir (segurança)
    // Mas ainda enviar headers básicos para evitar erros de console
    header("Access-Control-Allow-Origin: null", true);
} else {
    // Se não houver origem (requisição direta), permitir apenas em desenvolvimento
    if (getenv('APP_ENV') !== 'production') {
        header('Access-Control-Allow-Origin: *', true);
    }
}

// Sempre enviar headers CORS básicos
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true); // Cache por 24 horas

// Responder requisições OPTIONS (preflight) ANTES de qualquer processamento
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    // Garantir que não há output
    if (ob_get_level()) {
        ob_end_clean();
    }
    exit;
}

