<?php
/**
 * Dados do Usuário Autenticado
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../utils/auth-helper.php';

header('Content-Type: application/json');

$user = getCurrentUser();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Não autenticado']);
    exit;
}

// Buscar saldo da carteira
$db = getDB();
$stmt = $db->prepare("SELECT balance, bonus_balance FROM wallets WHERE user_id = ?");
$stmt->execute([$user['id']]);
$wallet = $stmt->fetch();

$user['wallet'] = $wallet ?: ['balance' => 0, 'bonus_balance' => 0];

echo json_encode([
    'success' => true,
    'user' => $user
]);

