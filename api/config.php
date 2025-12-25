<?php
/**
 * Configurações Públicas da API
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../scraper/config/database.php';

try {
    $db = getDB();
    
    // Verificar se tabela settings existe
    $stmt = $db->query("SHOW TABLES LIKE 'settings'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        // Retornar configurações padrão se tabela não existir
        echo json_encode([
            'success' => true,
            'config' => [
                'site_name' => 'Jogo do Bicho',
                'site_url' => 'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com',
                'min_deposit' => '10.00',
                'min_withdraw' => '20.00',
                'max_withdraw' => '5000.00',
                'pix_fee' => '0.00',
                'timezone' => 'America/Sao_Paulo'
            ],
            'warning' => 'Tabela settings não encontrada. Usando valores padrão.'
        ]);
        exit;
    }
    
    // Buscar configurações
    $stmt = $db->prepare("SELECT setting_key, setting_value FROM settings");
    $stmt->execute();
    $settings = $stmt->fetchAll();
    
    $config = [];
    foreach ($settings as $setting) {
        $config[$setting['setting_key']] = $setting['setting_value'];
    }
    
    echo json_encode([
        'success' => true,
        'config' => $config
    ]);
    
} catch (Exception $e) {
    error_log("Erro em api/config.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => 'Erro ao buscar configurações',
        'message' => $e->getMessage()
    ]);
}

