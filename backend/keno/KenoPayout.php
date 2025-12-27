<?php
/**
 * Tabela de Premiação do Keno
 * Define multiplicadores baseados em:
 * - Quantidade de números escolhidos (2 a 10)
 * - Quantidade de acertos
 */

class KenoPayout {
    
    /**
     * Tabela de multiplicadores de prêmio
     * Estrutura: [número_escolhido][acertos] => multiplicador
     * 
     * @var array
     */
    private static $payoutTable = [
        2 => [ // Escolheu 2 números
            2 => 10.0  // Acertou 2 = 10x
        ],
        3 => [ // Escolheu 3 números
            2 => 2.0,  // Acertou 2 = 2x
            3 => 50.0  // Acertou 3 = 50x
        ],
        4 => [ // Escolheu 4 números
            2 => 2.0,  // Acertou 2 = 2x
            3 => 10.0, // Acertou 3 = 10x
            4 => 100.0 // Acertou 4 = 100x
        ],
        5 => [ // Escolheu 5 números
            3 => 2.0,  // Acertou 3 = 2x
            4 => 10.0, // Acertou 4 = 10x
            5 => 200.0 // Acertou 5 = 200x
        ],
        6 => [ // Escolheu 6 números
            3 => 1.0,  // Acertou 3 = 1x
            4 => 5.0,  // Acertou 4 = 5x
            5 => 25.0, // Acertou 5 = 25x
            6 => 500.0 // Acertou 6 = 500x
        ],
        7 => [ // Escolheu 7 números
            4 => 2.0,  // Acertou 4 = 2x
            5 => 10.0, // Acertou 5 = 10x
            6 => 50.0, // Acertou 6 = 50x
            7 => 1000.0 // Acertou 7 = 1000x
        ],
        8 => [ // Escolheu 8 números
            5 => 5.0,  // Acertou 5 = 5x
            6 => 25.0, // Acertou 6 = 25x
            7 => 100.0, // Acertou 7 = 100x
            8 => 2000.0 // Acertou 8 = 2000x
        ],
        9 => [ // Escolheu 9 números
            5 => 2.0,  // Acertou 5 = 2x
            6 => 10.0, // Acertou 6 = 10x
            7 => 50.0, // Acertou 7 = 50x
            8 => 500.0, // Acertou 8 = 500x
            9 => 5000.0 // Acertou 9 = 5000x
        ],
        10 => [ // Escolheu 10 números
            5 => 2.0,  // Acertou 5 = 2x
            6 => 5.0,  // Acertou 6 = 5x
            7 => 25.0, // Acertou 7 = 25x
            8 => 200.0, // Acertou 8 = 200x
            9 => 1000.0, // Acertou 9 = 1000x
            10 => 10000.0 // Acertou 10 = 10000x
        ]
    ];
    
    /**
     * Calcula prêmio baseado em números escolhidos e acertos
     * 
     * @param float $betAmount Valor apostado
     * @param int $chosenCount Quantidade de números escolhidos (2-10)
     * @param int $hits Quantidade de acertos
     * @return float Valor do prêmio (0 se não houver prêmio)
     */
    public static function calculatePrize($betAmount, $chosenCount, $hits) {
        // Validar parâmetros
        if ($chosenCount < 2 || $chosenCount > 10) {
            return 0.0;
        }
        
        if ($hits < 0 || $hits > $chosenCount) {
            return 0.0;
        }
        
        // Verificar se há multiplicador para essa combinação
        if (!isset(self::$payoutTable[$chosenCount][$hits])) {
            return 0.0;
        }
        
        $multiplier = self::$payoutTable[$chosenCount][$hits];
        return $betAmount * $multiplier;
    }
    
    /**
     * Retorna a tabela de payout completa (para exibição)
     * 
     * @return array Tabela completa
     */
    public static function getPayoutTable() {
        return self::$payoutTable;
    }
    
    /**
     * Retorna multiplicadores disponíveis para uma quantidade de números escolhidos
     * 
     * @param int $chosenCount Quantidade de números escolhidos
     * @return array Array de [acertos => multiplicador]
     */
    public static function getMultipliersFor($chosenCount) {
        if (!isset(self::$payoutTable[$chosenCount])) {
            return [];
        }
        
        return self::$payoutTable[$chosenCount];
    }
}

