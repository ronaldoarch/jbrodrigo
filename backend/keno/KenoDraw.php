<?php
/**
 * Sistema de Sorteio de Keno
 * Gera sequência determinística de números usando seed
 * Reutiliza lógica do BingoDraw adaptada para Keno (1-80, 20 números sorteados)
 */

class KenoDraw {
    
    const MIN_NUMBER = 1;
    const MAX_NUMBER = 80;
    const NUMBERS_DRAWN = 20;
    
    /**
     * Gera seed única baseada em parâmetros
     * 
     * @param int $gameId ID do jogo
     * @param string $timestamp Timestamp (opcional, usa atual se não fornecido)
     * @return string Seed única
     */
    public static function generateSeed($gameId, $timestamp = null) {
        if ($timestamp === null) {
            $timestamp = time();
        }
        
        $seedString = "keno_game_{$gameId}_time_{$timestamp}";
        return md5($seedString);
    }
    
    /**
     * Gera sequência de 20 números sorteados usando seed determinística
     * 
     * @param string $seed Seed para gerar sequência
     * @return array Array com 20 números únicos de 1 a 80
     */
    public static function generateDraw($seed) {
        // Usar seed para inicializar gerador de números aleatórios
        mt_srand(hexdec(substr($seed, 0, 8)));
        
        $allNumbers = range(self::MIN_NUMBER, self::MAX_NUMBER);
        $drawnNumbers = [];
        
        // Embaralhar usando algoritmo Fisher-Yates com seed determinística
        for ($i = count($allNumbers) - 1; $i >= 0; $i--) {
            $j = mt_rand(0, $i);
            [$allNumbers[$i], $allNumbers[$j]] = [$allNumbers[$j], $allNumbers[$i]];
        }
        
        // Pegar os primeiros 20 números (que foram embaralhados de forma determinística)
        return array_slice($allNumbers, 0, self::NUMBERS_DRAWN);
    }
    
    /**
     * Conta quantos números escolhidos foram sorteados
     * 
     * @param array $chosenNumbers Números escolhidos pelo usuário
     * @param array $drawnNumbers Números sorteados
     * @return int Quantidade de acertos
     */
    public static function countHits($chosenNumbers, $drawnNumbers) {
        $drawnSet = array_flip($drawnNumbers); // Para busca O(1)
        $hits = 0;
        
        foreach ($chosenNumbers as $number) {
            if (isset($drawnSet[$number])) {
                $hits++;
            }
        }
        
        return $hits;
    }
}

