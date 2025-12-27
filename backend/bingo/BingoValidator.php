<?php
/**
 * Validador de Padrões de Vitória do Bingo
 * Verifica linhas, colunas, diagonais e cartela cheia
 */

require_once __DIR__ . '/BingoCardGenerator.php';

class BingoValidator {
    
    const ROWS = 5;
    const COLS = 5;
    
    /**
     * Verifica todos os padrões de vitória em uma cartela
     * 
     * @param array $cardNumbers Números da cartela (array unidimensional ou matriz)
     * @param array $matchedNumbers Números que foram acertados
     * @return array ['won' => bool, 'pattern' => string|null]
     */
    public static function checkWin($cardNumbers, $matchedNumbers) {
        // Converter para formato de matriz se necessário
        if (!is_array($cardNumbers[0]) || !is_array($cardNumbers[0])) {
            $card = BingoCardGenerator::arrayToCard($cardNumbers);
        } else {
            $card = $cardNumbers;
        }
        
        $matchedSet = array_flip($matchedNumbers);
        
        // Verificar padrões em ordem de prioridade (maior prêmio primeiro)
        // 1. Cartela cheia (maior prêmio)
        if (self::checkFullCard($card, $matchedSet)) {
            return ['won' => true, 'pattern' => 'cheia'];
        }
        
        // 2. Diagonais (próximo maior prêmio)
        if (self::checkDiagonal($card, $matchedSet, 'principal')) {
            return ['won' => true, 'pattern' => 'diagonal_principal'];
        }
        
        if (self::checkDiagonal($card, $matchedSet, 'secundaria')) {
            return ['won' => true, 'pattern' => 'diagonal_secundaria'];
        }
        
        // 3. Linhas
        if (self::checkRows($card, $matchedSet)) {
            return ['won' => true, 'pattern' => 'linha'];
        }
        
        // 4. Colunas
        if (self::checkColumns($card, $matchedSet)) {
            return ['won' => true, 'pattern' => 'coluna'];
        }
        
        return [
            'won' => false,
            'pattern' => null
        ];
    }
    
    /**
     * Verifica se cartela está cheia (todos os números acertados)
     * 
     * @param array $card Matriz 5x5
     * @param array $matchedSet Set de números acertados
     * @return bool True se cartela cheia
     */
    private static function checkFullCard($card, $matchedSet) {
        for ($col = 0; $col < self::COLS; $col++) {
            for ($row = 0; $row < self::ROWS; $row++) {
                if (!isset($matchedSet[$card[$col][$row]])) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * Verifica se alguma linha está completa
     * 
     * @param array $card Matriz 5x5
     * @param array $matchedSet Set de números acertados
     * @return bool True se alguma linha completa
     */
    private static function checkRows($card, $matchedSet) {
        for ($row = 0; $row < self::ROWS; $row++) {
            $complete = true;
            for ($col = 0; $col < self::COLS; $col++) {
                if (!isset($matchedSet[$card[$col][$row]])) {
                    $complete = false;
                    break;
                }
            }
            if ($complete) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Verifica se alguma coluna está completa
     * 
     * @param array $card Matriz 5x5
     * @param array $matchedSet Set de números acertados
     * @return bool True se alguma coluna completa
     */
    private static function checkColumns($card, $matchedSet) {
        for ($col = 0; $col < self::COLS; $col++) {
            $complete = true;
            for ($row = 0; $row < self::ROWS; $row++) {
                if (!isset($matchedSet[$card[$col][$row]])) {
                    $complete = false;
                    break;
                }
            }
            if ($complete) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Verifica se alguma diagonal está completa
     * 
     * @param array $card Matriz 5x5
     * @param array $matchedSet Set de números acertados
     * @param string $type 'principal' ou 'secundaria'
     * @return bool True se diagonal completa
     */
    private static function checkDiagonal($card, $matchedSet, $type = 'principal') {
        if ($type === 'principal') {
            // Diagonal principal: (0,0), (1,1), (2,2), (3,3), (4,4)
            for ($i = 0; $i < self::ROWS; $i++) {
                if (!isset($matchedSet[$card[$i][$i]])) {
                    return false;
                }
            }
        } else {
            // Diagonal secundária: (0,4), (1,3), (2,2), (3,1), (4,0)
            for ($i = 0; $i < self::ROWS; $i++) {
                if (!isset($matchedSet[$card[$i][self::ROWS - 1 - $i]])) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * Calcula quantos números foram acertados
     * 
     * @param array $cardNumbers Números da cartela
     * @param array $matchedNumbers Números acertados
     * @return int Quantidade de acertos
     */
    public static function countMatches($cardNumbers, $matchedNumbers) {
        $cardSet = array_flip($cardNumbers);
        $matchedSet = array_flip($matchedNumbers);
        
        $count = 0;
        foreach ($cardNumbers as $number) {
            if (isset($matchedSet[$number])) {
                $count++;
            }
        }
        
        return $count;
    }
}

