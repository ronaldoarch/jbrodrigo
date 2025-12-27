<?php
/**
 * Calculadora de Apostas
 * Calcula valores, unidades e prêmios potenciais
 */

class BetCalculator {
    
    /**
     * Multiplicadores oficiais por modalidade
     * Agora busca do banco de dados, com fallback para valores padrão
     */
    private static $multipliers = null; // Carregado dinamicamente
    
    /**
     * Calcula o número de unidades para uma aposta
     */
    public static function calculateUnits($modality, $betValue, $positions, $divisionType = 'todos') {
        $positionsArray = self::parsePositions($positions);
        $numPositions = count($positionsArray);
        
        switch ($modality) {
            case 'grupo':
                // 1 grupo × N posições = N unidades
                $betValues = explode(',', $betValue);
                return count($betValues) * $numPositions;
                
            case 'dupla-grupo':
                // 1 unidade (independente de posições)
                return 1;
                
            case 'terno-grupo':
                $betValues = explode(',', $betValue);
                $numGroups = count($betValues);
                
                if ($numGroups == 3) {
                    // Terno simples: 1 unidade
                    return 1;
                } else {
                    // Terno combinado: C(n, 3) unidades
                    return self::combination($numGroups, 3);
                }
                
            case 'quadra-grupo':
                return 1;
                
            case 'milhar-centena':
                // 1 número × 2 modalidades × N posições = 2N unidades
                return 2 * $numPositions;
                
            case 'passe-vai':
            case 'passe-vai-vem':
                // 1 número × 1 unidade (posições já estão incluídas)
                return 1;
                
            case 'milhar':
            case 'centena':
            case 'dezena':
            case 'duque-dezena':
            case 'terno-dezena':
                // N números × N posições = N² unidades
                $betValues = explode(',', $betValue);
                return count($betValues) * $numPositions;
                
            default:
                return 1;
        }
    }
    
    /**
     * Calcula o valor por unidade baseado no tipo de divisão
     */
    public static function calculateValuePerUnit($totalValue, $units, $divisionType = 'todos') {
        if ($divisionType === 'cada') {
            // Valor digitado é o valor por unidade
            return $totalValue;
        } else {
            // Valor é dividido entre todas as unidades
            return $units > 0 ? $totalValue / $units : 0;
        }
    }
    
    /**
     * Calcula o valor total da aposta
     */
    public static function calculateTotalValue($valuePerUnit, $units, $divisionType = 'todos') {
        if ($divisionType === 'cada') {
            return $valuePerUnit * $units;
        } else {
            return $valuePerUnit * $units;
        }
    }
    
    /**
     * Obtém o multiplicador para uma modalidade
     * Busca do banco de dados primeiro, depois fallback para valores padrão
     */
    public static function getMultiplier($modality, $positions = null, $gameType = null) {
        // Tentar usar OddsManager se disponível
        if (class_exists('OddsManager')) {
            require_once __DIR__ . '/OddsManager.php';
            return OddsManager::getMultiplier($modality, $positions, $gameType);
        }
        
        // Fallback para valores padrão (hardcoded)
        $defaultMultipliers = [
            'grupo' => 20,
            'dezena' => 80,
            'centena' => 800,
            'milhar' => 6000,
            'milhar-centena' => 3300,
            'dupla-grupo' => 21.75,
            'terno-grupo' => 150,
            'quadra-grupo' => 1000,
            'duque-dezena' => 350,
            'terno-dezena' => 3500,
            'passe-vai-1-2' => 180,
            'passe-vai-1-5' => 90,
            'passe-vai-vem-1-2' => 90,
            'passe-vai-vem-1-5' => 45
        ];
        
        // Para passe-vai e passe-vai-vem, o multiplicador depende das posições
        if ($modality === 'passe-vai' || $modality === 'passe-vai-vem') {
            $positionsArray = self::parsePositions($positions);
            $firstPos = min($positionsArray);
            $lastPos = max($positionsArray);
            
            if ($modality === 'passe-vai') {
                if ($firstPos == 1 && $lastPos == 2) {
                    return $defaultMultipliers['passe-vai-1-2'];
                } elseif ($firstPos == 1 && $lastPos == 5) {
                    return $defaultMultipliers['passe-vai-1-5'];
                }
            } else {
                if ($firstPos == 1 && $lastPos == 2) {
                    return $defaultMultipliers['passe-vai-vem-1-2'];
                } elseif ($firstPos == 1 && $lastPos == 5) {
                    return $defaultMultipliers['passe-vai-vem-1-5'];
                }
            }
        }
        
        return $defaultMultipliers[$modality] ?? 1;
    }
    
    /**
     * Calcula o prêmio potencial de uma linha de aposta
     */
    public static function calculatePotentialPrize($valuePerUnit, $units, $multiplier) {
        return $valuePerUnit * $units * $multiplier;
    }
    
    /**
     * Calcula combinação C(n, k)
     */
    private static function combination($n, $k) {
        if ($k > $n || $k < 0) {
            return 0;
        }
        if ($k == 0 || $k == $n) {
            return 1;
        }
        
        $result = 1;
        for ($i = 0; $i < $k; $i++) {
            $result = $result * ($n - $i) / ($i + 1);
        }
        
        return (int)$result;
    }
    
    /**
     * Parseia string de posições para array
     */
    private static function parsePositions($positions) {
        if (strpos($positions, '-') !== false) {
            // Formato "1-5" ou "1-2"
            list($start, $end) = explode('-', $positions);
            return range((int)$start, (int)$end);
        } else {
            // Formato "1,3,5" ou "1"
            return array_map('intval', explode(',', $positions));
        }
    }
    
    /**
     * Gera todas as combinações de terno-grupo
     */
    public static function generateTernoCombinations($groups) {
        $groupsArray = is_array($groups) ? $groups : explode(',', $groups);
        $n = count($groupsArray);
        
        if ($n < 3) {
            return [];
        }
        
        $combinations = [];
        for ($i = 0; $i < $n - 2; $i++) {
            for ($j = $i + 1; $j < $n - 1; $j++) {
                for ($k = $j + 1; $k < $n; $k++) {
                    $combinations[] = [
                        $groupsArray[$i],
                        $groupsArray[$j],
                        $groupsArray[$k]
                    ];
                }
            }
        }
        
        return $combinations;
    }
}

