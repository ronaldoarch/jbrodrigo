<?php
/**
 * Gerenciador de Cotações (Odds)
 * Busca cotações do banco de dados
 */

require_once __DIR__ . '/../scraper/config/database.php';

class OddsManager {
    
    private static $cache = [];
    private static $cacheTime = 300; // Cache por 5 minutos
    
    /**
     * Busca todas as cotações ativas
     */
    public static function getAllOdds($gameType = null) {
        $cacheKey = 'all_odds_' . ($gameType ?? 'all');
        
        // Verificar cache
        if (isset(self::$cache[$cacheKey]) && 
            (time() - self::$cache[$cacheKey]['time']) < self::$cacheTime) {
            return self::$cache[$cacheKey]['data'];
        }
        
        $db = getDB();
        
        $sql = "
            SELECT bet_type, position, multiplier, description, min_bet, max_bet
            FROM odds
            WHERE is_active = 1
        ";
        $params = [];
        
        if ($gameType) {
            $sql .= " AND (game_type = ? OR game_type IS NULL)";
            $params[] = $gameType;
        }
        
        $sql .= " ORDER BY bet_type, position";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $odds = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Organizar em formato similar ao anterior
        $formatted = [];
        foreach ($odds as $odd) {
            $betType = $odd['bet_type'];
            
            if (!isset($formatted[$betType])) {
                $formatted[$betType] = [
                    'name' => self::getModalityName($betType),
                    'multiplier' => (float)$odd['multiplier'],
                    'description' => $odd['description'],
                    'min_bet' => (float)$odd['min_bet'],
                    'max_bet' => (float)$odd['max_bet']
                ];
            }
            
            // Se tiver position específico, usar esse (prioridade maior)
            if ($odd['position'] !== null) {
                $formatted[$betType]['multiplier'] = (float)$odd['multiplier'];
            }
        }
        
        // Cache
        self::$cache[$cacheKey] = [
            'data' => $formatted,
            'time' => time()
        ];
        
        return $formatted;
    }
    
    /**
     * Busca multiplicador para uma modalidade específica
     */
    public static function getMultiplier($betType, $position = null, $gameType = null) {
        // Para passe-vai e passe-vai-vem, usar posições para determinar o tipo
        if ($betType === 'passe-vai' || $betType === 'passe-vai-vem') {
            if ($position) {
                $positions = is_array($position) ? $position : explode(',', $position);
                $minPos = min(array_map('intval', $positions));
                $maxPos = max(array_map('intval', $positions));
                
                if ($betType === 'passe-vai') {
                    $betType = ($minPos == 1 && $maxPos == 2) ? 'passe-vai-1-2' : 'passe-vai-1-5';
                } else {
                    $betType = ($minPos == 1 && $maxPos == 2) ? 'passe-vai-vem-1-2' : 'passe-vai-vem-1-5';
                }
            }
        }
        
        $db = getDB();
        
        // Tentar buscar por position específico primeiro
        $sql = "
            SELECT multiplier 
            FROM odds
            WHERE bet_type = ? AND is_active = 1
        ";
        $params = [$betType];
        
        if ($position !== null) {
            $sql .= " AND position = ?";
            $params[] = $position;
        } else {
            $sql .= " AND position IS NULL";
        }
        
        if ($gameType) {
            $sql .= " AND (game_type = ? OR game_type IS NULL)";
            $params[] = $gameType;
        }
        
        $sql .= " ORDER BY game_type IS NULL, position IS NULL LIMIT 1";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            return (float)$result['multiplier'];
        }
        
        // Fallback: buscar qualquer multiplicador para esta modalidade
        $sql = "SELECT multiplier FROM odds WHERE bet_type = ? AND is_active = 1 LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute([$betType]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ? (float)$result['multiplier'] : 1.0;
    }
    
    /**
     * Obtém nome formatado da modalidade
     */
    private static function getModalityName($betType) {
        $names = [
            'grupo' => 'Grupo/Animal',
            'dupla-grupo' => 'Dupla de Grupo',
            'terno-grupo' => 'Terno de Grupo',
            'quadra-grupo' => 'Quadra de Grupo',
            'dezena' => 'Dezena',
            'dezena-invertida' => 'Dezena Invertida',
            'centena' => 'Centena',
            'centena-invertida' => 'Centena Invertida',
            'milhar' => 'Milhar',
            'milhar-invertida' => 'Milhar Invertida',
            'milhar-centena' => 'Milhar/Centena',
            'duque-dezena' => 'Duque de Dezena',
            'terno-dezena' => 'Terno de Dezena',
            'passe-vai-1-2' => 'Passe Vai 1-2',
            'passe-vai-1-5' => 'Passe Vai 1-5',
            'passe-vai-vem-1-2' => 'Passe Vai-e-Vem 1-2',
            'passe-vai-vem-1-5' => 'Passe Vai-e-Vem 1-5',
        ];
        
        return $names[$betType] ?? ucfirst(str_replace('-', ' ', $betType));
    }
    
    /**
     * Limpa cache
     */
    public static function clearCache() {
        self::$cache = [];
    }
}

