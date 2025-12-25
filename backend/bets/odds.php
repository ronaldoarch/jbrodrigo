<?php
/**
 * Listar Cotações/Odds
 */

require_once __DIR__ . '/BetCalculator.php';

header('Content-Type: application/json');

$odds = [
    'grupo' => [
        'name' => 'Grupo/Animal',
        'multiplier' => 20,
        'description' => 'Aposta em um animal específico'
    ],
    'dezena' => [
        'name' => 'Dezena',
        'multiplier' => 80,
        'description' => 'Aposta nos 2 últimos dígitos'
    ],
    'centena' => [
        'name' => 'Centena',
        'multiplier' => 800,
        'description' => 'Aposta nos 3 últimos dígitos'
    ],
    'milhar' => [
        'name' => 'Milhar',
        'multiplier' => 6000,
        'description' => 'Aposta nos 4 últimos dígitos'
    ],
    'milhar-centena' => [
        'name' => 'Milhar-Centena',
        'multiplier' => 3300,
        'description' => 'Combinação milhar + centena'
    ],
    'dupla-grupo' => [
        'name' => 'Dupla-Grupo',
        'multiplier' => 21.75,
        'description' => 'Aposta em 2 grupos'
    ],
    'terno-grupo' => [
        'name' => 'Terno-Grupo',
        'multiplier' => 150,
        'description' => 'Aposta em 3 grupos'
    ],
    'quadra-grupo' => [
        'name' => 'Quadra-Grupo',
        'multiplier' => 1000,
        'description' => 'Aposta em 4 grupos'
    ],
    'duque-dezena' => [
        'name' => 'Duque-Dezena',
        'multiplier' => 350,
        'description' => 'Aposta em 2 dezenas'
    ],
    'terno-dezena' => [
        'name' => 'Terno-Dezena',
        'multiplier' => 3500,
        'description' => 'Aposta em 3 dezenas'
    ],
    'passe-vai-1-2' => [
        'name' => 'Passe-Vai 1-2',
        'multiplier' => 180,
        'description' => 'Aposta do 1º ao 2º prêmio'
    ],
    'passe-vai-1-5' => [
        'name' => 'Passe-Vai 1-5',
        'multiplier' => 90,
        'description' => 'Aposta do 1º ao 5º prêmio'
    ],
    'passe-vai-vem-1-2' => [
        'name' => 'Passe-Vai-Vem 1-2',
        'multiplier' => 90,
        'description' => 'Aposta do 1º ao 2º prêmio (ida e volta)'
    ],
    'passe-vai-vem-1-5' => [
        'name' => 'Passe-Vai-Vem 1-5',
        'multiplier' => 45,
        'description' => 'Aposta do 1º ao 5º prêmio (ida e volta)'
    ]
];

echo json_encode([
    'success' => true,
    'odds' => $odds
]);

