<?php
/**
 * Página inicial do backend
 * Redireciona para documentação da API
 */

header('Content-Type: application/json');
http_response_code(200);

echo json_encode([
    'success' => true,
    'message' => 'API Jogo do Bicho',
    'version' => '1.0.0',
    'endpoints' => [
        'public' => [
            '/api/config.php' => 'Configurações do site',
            '/api/extractions-list.php' => 'Lista de extrações',
            '/api/banners.php' => 'Banners promocionais',
        ],
        'auth' => [
            '/backend/auth/register.php' => 'Registro de usuário',
            '/backend/auth/login.php' => 'Login',
            '/backend/auth/me.php' => 'Dados do usuário',
            '/backend/auth/logout.php' => 'Logout',
        ],
        'bets' => [
            '/backend/bets/create-bet-v2.php' => 'Criar aposta',
            '/backend/bets/list.php' => 'Listar apostas',
            '/backend/bets/calculate.php' => 'Calcular prêmios',
        ],
        'wallet' => [
            '/backend/wallet/balance.php' => 'Saldo da carteira',
            '/backend/wallet/transactions.php' => 'Transações',
        ],
    ],
    'cors' => [
        'enabled' => true,
        'allowed_origins' => [
            'https://tradicaodobicho.site',
            'https://www.tradicaodobicho.site',
        ],
    ],
]);

