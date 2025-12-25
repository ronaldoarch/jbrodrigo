<?php
/**
 * Sistema de Liquidação de Apostas
 * Verifica resultados e credita prêmios
 */

require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/BetCalculator.php';

class BetSettlement {
    
    /**
     * Liquida uma aposta específica
     */
    public static function settleBet($betId) {
        $db = getDB();
        
        try {
            $db->beginTransaction();
            
            // Buscar aposta
            $stmt = $db->prepare("
                SELECT b.*, e.position_1, e.position_2, e.position_3, e.position_4, 
                       e.position_5, e.position_6, e.position_7,
                       e.animal_1, e.animal_2, e.animal_3, e.animal_4,
                       e.animal_5, e.animal_6, e.animal_7
                FROM bets b
                LEFT JOIN extractions e ON b.extraction_id = e.id
                WHERE b.id = ? AND b.status IN ('pending', 'settling')
            ");
            $stmt->execute([$betId]);
            $bet = $stmt->fetch();
            
            if (!$bet) {
                throw new Exception("Aposta não encontrada ou já liquidada");
            }
            
            // Se for aposta instantânea sem extração, criar extração
            if ($bet['bet_type'] === 'instant' && !$bet['extraction_id']) {
                $extractionId = self::createInstantExtraction($db);
                $stmt = $db->prepare("UPDATE bets SET extraction_id = ? WHERE id = ?");
                $stmt->execute([$extractionId, $betId]);
                $bet['extraction_id'] = $extractionId;
                
                // Buscar resultados da extração criada
                $stmt = $db->prepare("
                    SELECT position_1, position_2, position_3, position_4, 
                           position_5, position_6, position_7,
                           animal_1, animal_2, animal_3, animal_4,
                           animal_5, animal_6, animal_7
                    FROM extractions WHERE id = ?
                ");
                $stmt->execute([$extractionId]);
                $extraction = $stmt->fetch();
                
                $bet = array_merge($bet, $extraction);
            }
            
            // Verificar se extração tem resultados
            if (!$bet['position_1']) {
                throw new Exception("Extração ainda não tem resultados");
            }
            
            // Buscar itens da aposta
            $stmt = $db->prepare("SELECT * FROM bet_items WHERE bet_id = ?");
            $stmt->execute([$betId]);
            $betItems = $stmt->fetchAll();
            
            $totalPrize = 0;
            $hasWinner = false;
            
            // Verificar cada item
            foreach ($betItems as &$item) {
                $won = self::checkItemWin($item, $bet);
                $item['won'] = $won;
                
                if ($won) {
                    $hasWinner = true;
                    $prize = $item['value_per_unit'] * $item['units'] * $item['multiplier'];
                    $item['actual_prize'] = $prize;
                    $totalPrize += $prize;
                } else {
                    $item['actual_prize'] = 0;
                }
                
                // Atualizar item
                $stmt = $db->prepare("
                    UPDATE bet_items 
                    SET won = ?, actual_prize = ? 
                    WHERE id = ?
                ");
                $stmt->execute([$won ? 1 : 0, $item['actual_prize'], $item['id']]);
            }
            
            // Atualizar status da aposta
            $status = $hasWinner ? 'settled_won' : 'settled_lost';
            $stmt = $db->prepare("
                UPDATE bets 
                SET status = ?, prize_amount = ?, settled_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$status, $totalPrize, $betId]);
            
            // Creditar prêmio na carteira se ganhou
            if ($hasWinner && $totalPrize > 0) {
                self::creditPrize($db, $bet['user_id'], $totalPrize, $betId);
            }
            
            $db->commit();
            
            return [
                'success' => true,
                'bet_id' => $betId,
                'status' => $status,
                'prize' => $totalPrize
            ];
            
        } catch (Exception $e) {
            $db->rollBack();
            error_log("Erro ao liquidar aposta $betId: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Verifica se um item de aposta ganhou
     */
    private static function checkItemWin($item, $extraction) {
        $modality = $item['modality'];
        $betValue = $item['bet_value'];
        $positions = self::parsePositions($item['positions']);
        
        // Extrair resultados da extração
        $results = [];
        $animals = [];
        for ($i = 1; $i <= 7; $i++) {
            $results[$i] = $extraction["position_$i"];
            $animals[$i] = $extraction["animal_$i"];
        }
        
        switch ($modality) {
            case 'grupo':
                return self::checkGroup($betValue, $animals, $positions);
                
            case 'dezena':
                return self::checkDezena($betValue, $results, $positions);
                
            case 'centena':
                return self::checkCentena($betValue, $results, $positions);
                
            case 'milhar':
                return self::checkMilhar($betValue, $results, $positions);
                
            case 'milhar-centena':
                return self::checkMilharCentena($betValue, $results, $positions);
                
            case 'dupla-grupo':
                return self::checkDuplaGrupo($betValue, $animals, $positions);
                
            case 'terno-grupo':
                return self::checkTernoGrupo($betValue, $animals, $positions);
                
            case 'quadra-grupo':
                return self::checkQuadraGrupo($betValue, $animals, $positions);
                
            case 'passe-vai':
                return self::checkPasseVai($betValue, $results, $animals, $positions, $modality);
                
            case 'passe-vai-vem':
                return self::checkPasseVaiVem($betValue, $results, $animals, $positions);
                
            default:
                return false;
        }
    }
    
    /**
     * Verifica grupo/animal
     */
    private static function checkGroup($betValue, $animals, $positions) {
        $betAnimal = (int)$betValue;
        foreach ($positions as $pos) {
            if (isset($animals[$pos]) && $animals[$pos] == $betAnimal) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Verifica dezena
     */
    private static function checkDezena($betValue, $results, $positions) {
        $betDezena = str_pad($betValue, 2, '0', STR_PAD_LEFT);
        foreach ($positions as $pos) {
            if (isset($results[$pos])) {
                $resultDezena = substr($results[$pos], -2);
                if ($resultDezena === $betDezena) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Verifica centena
     */
    private static function checkCentena($betValue, $results, $positions) {
        $betCentena = str_pad($betValue, 3, '0', STR_PAD_LEFT);
        foreach ($positions as $pos) {
            if (isset($results[$pos])) {
                $resultCentena = substr($results[$pos], -3);
                if ($resultCentena === $betCentena) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Verifica milhar
     */
    private static function checkMilhar($betValue, $results, $positions) {
        $betMilhar = str_pad($betValue, 4, '0', STR_PAD_LEFT);
        foreach ($positions as $pos) {
            if (isset($results[$pos])) {
                $resultMilhar = substr($results[$pos], -4);
                if ($resultMilhar === $betMilhar) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Verifica milhar-centena
     */
    private static function checkMilharCentena($betValue, $results, $positions) {
        // Verifica se ganhou no milhar OU na centena
        return self::checkMilhar($betValue, $results, $positions) || 
               self::checkCentena($betValue, $results, $positions);
    }
    
    /**
     * Verifica dupla-grupo
     */
    private static function checkDuplaGrupo($betValue, $animals, $positions) {
        $betGroups = array_map('intval', explode(',', $betValue));
        if (count($betGroups) != 2) {
            return false;
        }
        
        $found = [];
        foreach ($positions as $pos) {
            if (isset($animals[$pos])) {
                if (in_array($animals[$pos], $betGroups)) {
                    $found[] = $animals[$pos];
                }
            }
        }
        
        return count(array_unique($found)) >= 2;
    }
    
    /**
     * Verifica terno-grupo
     */
    private static function checkTernoGrupo($betValue, $animals, $positions) {
        $betGroups = array_map('intval', explode(',', $betValue));
        
        if (count($betGroups) == 3) {
            // Terno simples
            $found = [];
            foreach ($positions as $pos) {
                if (isset($animals[$pos]) && in_array($animals[$pos], $betGroups)) {
                    $found[] = $animals[$pos];
                }
            }
            return count(array_unique($found)) >= 3;
        } else {
            // Terno combinado - verificar cada combinação
            $combinations = BetCalculator::generateTernoCombinations($betGroups);
            foreach ($combinations as $combo) {
                $found = [];
                foreach ($positions as $pos) {
                    if (isset($animals[$pos]) && in_array($animals[$pos], $combo)) {
                        $found[] = $animals[$pos];
                    }
                }
                if (count(array_unique($found)) >= 3) {
                    return true;
                }
            }
            return false;
        }
    }
    
    /**
     * Verifica quadra-grupo
     */
    private static function checkQuadraGrupo($betValue, $animals, $positions) {
        $betGroups = array_map('intval', explode(',', $betValue));
        if (count($betGroups) != 4) {
            return false;
        }
        
        $found = [];
        foreach ($positions as $pos) {
            if (isset($animals[$pos]) && in_array($animals[$pos], $betGroups)) {
                $found[] = $animals[$pos];
            }
        }
        
        return count(array_unique($found)) >= 4;
    }
    
    /**
     * Verifica passe-vai
     */
    private static function checkPasseVai($betValue, $results, $animals, $positions, $modality) {
        // Passe-vai pode ser em grupo ou número
        // Verifica se é número (tem 2-4 dígitos) ou grupo (1-2 dígitos)
        if (strlen($betValue) <= 2) {
            // Grupo
            return self::checkGroup($betValue, $animals, $positions);
        } else {
            // Número (dezena, centena ou milhar)
            if (strlen($betValue) == 2) {
                return self::checkDezena($betValue, $results, $positions);
            } elseif (strlen($betValue) == 3) {
                return self::checkCentena($betValue, $results, $positions);
            } else {
                return self::checkMilhar($betValue, $results, $positions);
            }
        }
    }
    
    /**
     * Verifica passe-vai-vem
     */
    private static function checkPasseVaiVem($betValue, $results, $animals, $positions) {
        // Similar ao passe-vai, mas com multiplicador diferente
        return self::checkPasseVai($betValue, $results, $animals, $positions, 'passe-vai-vem');
    }
    
    /**
     * Parseia string de posições
     */
    private static function parsePositions($positions) {
        if (strpos($positions, '-') !== false) {
            list($start, $end) = explode('-', $positions);
            return range((int)$start, (int)$end);
        } else {
            return array_map('intval', explode(',', $positions));
        }
    }
    
    /**
     * Credita prêmio na carteira
     */
    private static function creditPrize($db, $userId, $amount, $betId) {
        // Buscar carteira
        $stmt = $db->prepare("SELECT id, balance FROM wallets WHERE user_id = ? FOR UPDATE");
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch();
        
        if (!$wallet) {
            throw new Exception("Carteira não encontrada");
        }
        
        $balanceBefore = $wallet['balance'];
        $balanceAfter = $balanceBefore + $amount;
        
        // Atualizar saldo
        $stmt = $db->prepare("UPDATE wallets SET balance = ? WHERE id = ?");
        $stmt->execute([$balanceAfter, $wallet['id']]);
        
        // Criar transação
        $stmt = $db->prepare("
            INSERT INTO wallet_transactions 
            (wallet_id, user_id, type, amount, balance_before, balance_after, 
             description, reference_type, reference_id, status)
            VALUES (?, ?, 'prize', ?, ?, ?, ?, 'bet', ?, 'completed')
        ");
        $stmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $balanceBefore,
            $balanceAfter,
            "Prêmio da aposta #$betId",
            $betId
        ]);
    }
    
    /**
     * Cria extração instantânea com resultado aleatório
     */
    private static function createInstantExtraction($db) {
        // Gerar números aleatórios de 4 dígitos
        $numbers = [];
        $animals = [];
        
        for ($i = 1; $i <= 7; $i++) {
            $number = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
            $numbers[] = $number;
            // Calcular animal (últimos 2 dígitos mod 25 + 1)
            $animal = (intval(substr($number, -2)) % 25) + 1;
            $animals[] = $animal;
        }
        
        // Criar extração
        $stmt = $db->prepare("
            INSERT INTO extractions 
            (type, description, close_time, game_type, extraction_date, extraction_time,
             position_1, position_2, position_3, position_4, position_5, position_6, position_7,
             animal_1, animal_2, animal_3, animal_4, animal_5, animal_6, animal_7,
             status, is_active)
            VALUES 
            ('instant', 'INSTANTÂNEA', NOW(), 'INSTANTANEA', CURDATE(), CURTIME(),
             ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?,
             'completed', TRUE)
        ");
        $stmt->execute([
            $numbers[0], $numbers[1], $numbers[2], $numbers[3], 
            $numbers[4], $numbers[5], $numbers[6],
            $animals[0], $animals[1], $animals[2], $animals[3],
            $animals[4], $animals[5], $animals[6]
        ]);
        
        return $db->lastInsertId();
    }
}

