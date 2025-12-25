<?php
/**
 * Configuração de CORS
 * Permite requisições do frontend na Hostinger
 */

function setCorsHeaders() {
    // Lista de origens permitidas
    // IMPORTANTE: Configure com seus domínios reais em produção
    $allowedOrigins = [
        'https://seudominio.com.br',
        'https://www.seudominio.com.br',
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
        header("Access-Control-Allow-Origin: $origin");
    } elseif (empty($origin)) {
        // Se não houver origem (requisição direta), permitir apenas em desenvolvimento
        if (getenv('APP_ENV') !== 'production') {
            header('Access-Control-Allow-Origin: *');
        }
    }
    
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // Cache por 24 horas
    
    // Responder requisições OPTIONS (preflight)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Chamar automaticamente
setCorsHeaders();

