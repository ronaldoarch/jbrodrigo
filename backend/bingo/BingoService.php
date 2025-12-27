<?php
/**
 * Serviço Principal de Bingo
 * Gerencia a lógica completa do jogo
 */

require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/BingoCardGenerator.php';
require_once __DIR__ . '/BingoDraw.php';
require_once __DIR__ . '/BingoValidator.php';

class BingoService {
    
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * Cria uma nova cartela de bingo para o usuário
     * 
     * @param int $userId ID do usuário
     * @param float $betAmount Valor da aposta
     * @return array Dados da cartela criada
     * @throws Exception Em caso de erro
     */
    public function createCard($userId, $betAmount) {
        $this->db->beginTransaction();
        
        try {
            // Verificar saldo do usuário
            $wallet = $this->getWallet($userId);
            if ($wallet['balance'] < $betAmount) {
                throw new Exception("Saldo insuficiente");
            }
            
            // Gerar cartela
            $card = BingoCardGenerator::generateCard();
            $cardNumbers = BingoCardGenerator::cardToArray($card);
            
            // Gerar seed e sequência de sorteio
            $timestamp = time();
            $seed = BingoDraw::generateSeed(0, $timestamp); // ID será atualizado depois
            $drawSequence = BingoDraw::generateDrawSequence($seed);
            
            // Criar jogo de bingo
            $gameStmt = $this->db->prepare("
                INSERT INTO bingo_games (seed, numbers_drawn, status)
                VALUES (?, ?, 'active')
            ");
            $gameStmt->execute([$seed, json_encode($drawSequence)]);
            $gameId = $this->db->lastInsertId();
            
            // Atualizar seed com o ID do jogo (para garantir unicidade)
            $newSeed = BingoDraw::generateSeed($gameId, $timestamp);
            $drawSequence = BingoDraw::generateDrawSequence($newSeed);
            
            $updateGameStmt = $this->db->prepare("
                UPDATE bingo_games SET seed = ?, numbers_drawn = ? WHERE id = ?
            ");
            $updateGameStmt->execute([$newSeed, json_encode($drawSequence), $gameId]);
            
            // Processar resultado (verificar se ganhou)
            $drawResult = BingoDraw::drawUntilWin($cardNumbers, $newSeed);
            $matchedNumbers = $drawResult['matched'];
            
            $validation = BingoValidator::checkWin($card, $matchedNumbers);
            
            // Criar cartela
            $cardStmt = $this->db->prepare("
                INSERT INTO bingo_cards 
                (user_id, game_id, card_numbers, numbers_matched, win_pattern, result, bet_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $result = $validation['won'] ? 'win' : 'lose';
            $winPattern = $validation['pattern'] ?? null;
            
            $cardStmt->execute([
                $userId,
                $gameId,
                json_encode($cardNumbers),
                json_encode($matchedNumbers),
                $winPattern,
                $result,
                $betAmount
            ]);
            
            $cardId = $this->db->lastInsertId();
            
            // Debitar valor da aposta
            $this->debitBet($userId, $betAmount, $cardId);
            
            // Se ganhou, creditar prêmio
            $prizeAmount = 0;
            if ($validation['won']) {
                $prizeAmount = $this->calculatePrize($betAmount, $winPattern);
                $this->creditPrize($userId, $prizeAmount, $cardId);
                
                // Atualizar cartela com prêmio
                $updateCardStmt = $this->db->prepare("
                    UPDATE bingo_cards SET prize_amount = ? WHERE id = ?
                ");
                $updateCardStmt->execute([$prizeAmount, $cardId]);
            }
            
            // Finalizar jogo
            $finishGameStmt = $this->db->prepare("
                UPDATE bingo_games SET status = 'finished' WHERE id = ?
            ");
            $finishGameStmt->execute([$gameId]);
            
            $this->db->commit();
            
            // Buscar cartela completa
            return $this->getCardById($cardId);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    /**
     * Busca cartela por ID
     * 
     * @param int $cardId ID da cartela
     * @return array Dados da cartela
     */
    public function getCardById($cardId) {
        $stmt = $this->db->prepare("
            SELECT bc.*, bg.seed, bg.numbers_drawn
            FROM bingo_cards bc
            INNER JOIN bingo_games bg ON bc.game_id = bg.id
            WHERE bc.id = ?
        ");
        $stmt->execute([$cardId]);
        $card = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($card) {
            $card['card_numbers'] = json_decode($card['card_numbers'], true);
            $card['numbers_matched'] = json_decode($card['numbers_matched'], true);
            $card['numbers_drawn'] = json_decode($card['numbers_drawn'], true);
        }
        
        return $card;
    }
    
    /**
     * Lista cartelas do usuário
     * 
     * @param int $userId ID do usuário
     * @param int $limit Limite de resultados
     * @param int $offset Offset para paginação
     * @return array Lista de cartelas
     */
    public function getUserCards($userId, $limit = 20, $offset = 0) {
        $stmt = $this->db->prepare("
            SELECT bc.*, bg.seed, bg.numbers_drawn
            FROM bingo_cards bc
            INNER JOIN bingo_games bg ON bc.game_id = bg.id
            WHERE bc.user_id = ?
            ORDER BY bc.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$userId, $limit, $offset]);
        $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($cards as &$card) {
            $card['card_numbers'] = json_decode($card['card_numbers'], true);
            $card['numbers_matched'] = json_decode($card['numbers_matched'], true);
            $card['numbers_drawn'] = json_decode($card['numbers_drawn'], true);
        }
        
        return $cards;
    }
    
    /**
     * Calcula prêmio baseado no padrão de vitória
     * 
     * @param float $betAmount Valor apostado
     * @param string $pattern Padrão de vitória
     * @return float Valor do prêmio
     */
    private function calculatePrize($betAmount, $pattern) {
        $multipliers = [
            'linha' => 2.0,
            'coluna' => 2.0,
            'diagonal_principal' => 3.0,
            'diagonal_secundaria' => 3.0,
            'cheia' => 10.0
        ];
        
        $multiplier = $multipliers[$pattern] ?? 1.0;
        return $betAmount * $multiplier;
    }
    
    /**
     * Debita valor da aposta da carteira
     * 
     * @param int $userId ID do usuário
     * @param float $amount Valor a debitar
     * @param int $cardId ID da cartela
     */
    private function debitBet($userId, $amount, $cardId) {
        $stmt = $this->db->prepare("
            UPDATE wallets 
            SET balance = balance - ?, 
                total_wagered = total_wagered + ?
            WHERE user_id = ?
        ");
        $stmt->execute([$amount, $amount, $userId]);
        
        // Criar transação
        $wallet = $this->getWallet($userId);
        $transStmt = $this->db->prepare("
            INSERT INTO wallet_transactions
            (wallet_id, user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id, status)
            VALUES (?, ?, 'bet', ?, ?, ?, ?, 'bet', ?, 'completed')
        ");
        $transStmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $wallet['balance'] + $amount,
            $wallet['balance'],
            "Aposta Bingo - Cartela #{$cardId}",
            $cardId
        ]);
    }
    
    /**
     * Credita prêmio na carteira
     * 
     * @param int $userId ID do usuário
     * @param float $amount Valor do prêmio
     * @param int $cardId ID da cartela
     */
    private function creditPrize($userId, $amount, $cardId) {
        $wallet = $this->getWallet($userId);
        $balanceBefore = $wallet['balance'];
        
        $stmt = $this->db->prepare("
            UPDATE wallets 
            SET balance = balance + ?,
                total_won = total_won + ?
            WHERE user_id = ?
        ");
        $stmt->execute([$amount, $amount, $userId]);
        
        // Criar transação
        $wallet = $this->getWallet($userId);
        $transStmt = $this->db->prepare("
            INSERT INTO wallet_transactions
            (wallet_id, user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id, status)
            VALUES (?, ?, 'prize', ?, ?, ?, ?, 'bet', ?, 'completed')
        ");
        $transStmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $balanceBefore,
            $wallet['balance'],
            "Prêmio Bingo - Cartela #{$cardId}",
            $cardId
        ]);
    }
    
    /**
     * Busca carteira do usuário
     * 
     * @param int $userId ID do usuário
     * @return array Dados da carteira
     */
    private function getWallet($userId) {
        $stmt = $this->db->prepare("SELECT * FROM wallets WHERE user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

