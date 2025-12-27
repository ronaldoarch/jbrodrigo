<?php
/**
 * Validador de Keno
 * Valida números escolhidos e regras do jogo
 */

class KenoValidator {
    
    const MIN_NUMBERS = 2;
    const MAX_NUMBERS = 10;
    const MIN_VALUE = 1;
    const MAX_VALUE = 80;
    
    /**
     * Valida números escolhidos pelo usuário
     * 
     * @param array $numbers Array de números escolhidos
     * @return array ['valid' => bool, 'errors' => array]
     */
    public static function validateChosenNumbers($numbers) {
        $errors = [];
        
        // Verificar se é array
        if (!is_array($numbers)) {
            return [
                'valid' => false,
                'errors' => ['Números devem ser enviados como array']
            ];
        }
        
        $count = count($numbers);
        
        // Verificar quantidade
        if ($count < self::MIN_NUMBERS) {
            $errors[] = "Mínimo de " . self::MIN_NUMBERS . " números";
        }
        
        if ($count > self::MAX_NUMBERS) {
            $errors[] = "Máximo de " . self::MAX_NUMBERS . " números";
        }
        
        // Verificar cada número
        $seen = [];
        foreach ($numbers as $number) {
            // Verificar se é inteiro
            if (!is_numeric($number) || (int)$number != $number) {
                $errors[] = "Número inválido: {$number}";
                continue;
            }
            
            $number = (int)$number;
            
            // Verificar intervalo
            if ($number < self::MIN_VALUE || $number > self::MAX_VALUE) {
                $errors[] = "Número fora do intervalo permitido: {$number}";
                continue;
            }
            
            // Verificar duplicatas
            if (isset($seen[$number])) {
                $errors[] = "Número duplicado: {$number}";
                continue;
            }
            
            $seen[$number] = true;
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
}

