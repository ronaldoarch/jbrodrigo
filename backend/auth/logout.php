<?php
/**
 * Logout de Usuário
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../session-config.php';
require_once __DIR__ . '/../scraper/config/database.php';

header('Content-Type: application/json');

session_start();

$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso']);

