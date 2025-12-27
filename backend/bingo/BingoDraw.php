<?php
/**
 * Sistema de Sorteio de Bingo
 * Gera sequência determinística de números usando seed
 */

class BingoDraw {
    
    const MIN_NUMBER = 1;
    const MAX_NUMBER = 75;
    
    /**
     * Gera seed única baseada em parâmetros
     * 
     * @param int $cardId ID da cartela
     * @param string $timestamp Timestamp (opcional, usa atual se não fornecido)
     * @return string Seed única
     */
    public static function generateSeed($cardId, $timestamp = null) {
        if ($timestamp === null) {
            $timestamp = time();
        }
        
        $seedString = "bingo_card_{$cardId}_time_{$timestamp}";
        return md5($seedString);
    }
    
    /**
     * Gera sequência completa de números sorteados usando seed
     * 
     * @param string $seed Seed para gerar sequência
     * @return array Array com todos os números de 1 a 75 em ordem de sorteio
     */
    public static function generateDrawSequence($seed) {
        // Usar seed para inicializar gerador de números aleatórios
        mt_srand(hexdec(substr($seed, 0, 8)));
        
        $numbers = range(self::MIN_NUMBER, self::MAX_NUMBER);
        $drawnSequence = [];
        
        // Embaralhar usando algoritmo Fisher-Yates com seed determinística
        for ($i = count($numbers) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            [$numbers[$i], $numbers[$j]] = [$numbers[$j], $numbers[$i]];
        }
        
        return $numbers;
    }
    
    /**
     * Gera sequência de sorteio e retorna até encontrar um vencedor
     * 
     * @param array $cardNumbers Números da cartela (array unidimensional)
     * @param string $seed Seed para o sorteio
     * @return array ['sequence' => array, 'matched' => array, 'drawn_count' => int]
     */
    public static function drawUntilWin($cardNumbers, $seed) {
        $drawSequence = self::generateDrawSequence($seed);
        $cardNumbersSet = array_flip($cardNumbers); // Para busca O(1)
        $matched = [];
        $drawnCount = 0;
        
        foreach ($drawSequence as $drawnNumber) {
            $drawnCount++;
            
            if (isset($cardNumbersSet[$drawnNumber])) {
                $matched[] = $drawnNumber;
            }
            
            // Verificar se já ganhou (será validado depois, mas paramos aqui)
            // Vamos continuar até ter pelo menos 5 números para verificar padrões básicos
            if ($drawnCount >= 5 && count($matched) >= 5) {
                // Podemos verificar padrões básicos aqui
                // Mas vamos continuar até ter mais números para garantir
            }
        }
        
        return [
            'sequence' => $drawSequence,
            'matched' => $matched,
            'drawn_count' => $drawnCount
        ];
    }
    
    /**
     * Verifica quantos números da cartela foram sorteados até determinado ponto
     * 
     * @param array $cardNumbers Números da cartela
     * @param array $drawSequence Sequência de números sorteados
     * @param int $drawCount Quantos números do sorteio considerar
     * @return array Números que foram acertados
     */
    public static function getMatchedNumbers($cardNumbers, $drawSequence, $drawCount) {
        $cardNumbersSet = array_flip($cardNumbers);
        $matched = [];
        
        for ($i = 0; $i < $drawCount && $i < count($drawSequence); $i++) {
            $drawnNumber = $drawSequence[$i];
            if (isset($cardNumbersSet[$drawnNumber])) {
                $matched[] = $drawnNumber;
            }
        }
        
        return $matched;
    }
}

