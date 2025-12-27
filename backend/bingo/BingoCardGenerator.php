<?php
/**
 * Gerador de Cartelas de Bingo
 * Gera cartelas 5x5 com números aleatórios sem repetição
 */

class BingoCardGenerator {
    
    const ROWS = 5;
    const COLS = 5;
    const MIN_NUMBER = 1;
    const MAX_NUMBER = 75;
    const NUMBERS_PER_COLUMN = 5;
    
    /**
     * Gera uma nova cartela de bingo
     * 
     * @return array Matriz 5x5 com números
     */
    public static function generateCard() {
        $card = [];
        $usedNumbers = [];
        
        // Bingo tradicional: cada coluna tem uma faixa de números
        // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
        $ranges = [
            ['min' => 1, 'max' => 15],   // B
            ['min' => 16, 'max' => 30],  // I
            ['min' => 31, 'max' => 45],  // N
            ['min' => 46, 'max' => 60],  // G
            ['min' => 61, 'max' => 75]   // O
        ];
        
        for ($col = 0; $col < self::COLS; $col++) {
            $card[$col] = [];
            $range = $ranges[$col];
            
            for ($row = 0; $row < self::ROWS; $row++) {
                $number = self::getRandomNumberInRange($range['min'], $range['max'], $usedNumbers);
                $usedNumbers[] = $number;
                $card[$col][$row] = $number;
            }
        }
        
        // Central (N, coluna 2, linha 2) é sempre FREE em bingo tradicional
        // Mas vamos manter números para simplificar
        
        return $card;
    }
    
    /**
     * Converte cartela de matriz para formato plano (array unidimensional)
     * 
     * @param array $card Matriz 5x5
     * @return array Array unidimensional
     */
    public static function cardToArray($card) {
        $numbers = [];
        for ($col = 0; $col < self::COLS; $col++) {
            for ($row = 0; $row < self::ROWS; $row++) {
                $numbers[] = $card[$col][$row];
            }
        }
        return $numbers;
    }
    
    /**
     * Converte array plano para matriz 5x5
     * 
     * @param array $numbers Array unidimensional
     * @return array Matriz 5x5
     */
    public static function arrayToCard($numbers) {
        $card = [];
        $index = 0;
        
        for ($col = 0; $col < self::COLS; $col++) {
            $card[$col] = [];
            for ($row = 0; $row < self::ROWS; $row++) {
                $card[$col][$row] = $numbers[$index++];
            }
        }
        
        return $card;
    }
    
    /**
     * Gera número aleatório dentro de um range, evitando repetição
     * 
     * @param int $min Número mínimo
     * @param int $max Número máximo
     * @param array $usedNumbers Números já utilizados
     * @return int Número gerado
     */
    private static function getRandomNumberInRange($min, $max, &$usedNumbers) {
        do {
            $number = mt_rand($min, $max);
        } while (in_array($number, $usedNumbers));
        
        return $number;
    }
    
    /**
     * Valida se uma cartela é válida
     * 
     * @param array $card Matriz 5x5
     * @return bool True se válida
     */
    public static function validateCard($card) {
        if (count($card) !== self::COLS) {
            return false;
        }
        
        $allNumbers = [];
        foreach ($card as $col) {
            if (count($col) !== self::ROWS) {
                return false;
            }
            
            foreach ($col as $number) {
                if (!is_numeric($number) || $number < self::MIN_NUMBER || $number > self::MAX_NUMBER) {
                    return false;
                }
                $allNumbers[] = $number;
            }
        }
        
        // Verificar se há números repetidos
        return count($allNumbers) === count(array_unique($allNumbers));
    }
}

