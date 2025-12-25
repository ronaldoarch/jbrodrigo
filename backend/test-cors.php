<?php
/**
 * Teste de CORS
 * Use este arquivo para testar se o CORS está funcionando
 */

require_once __DIR__ . '/cors.php';

header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'CORS está funcionando!',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'não fornecido',
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers_sent' => headers_sent(),
]);

