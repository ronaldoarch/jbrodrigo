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
            // Verificar saldo do usuário (com lock FOR UPDATE para evitar race conditions)
            $wallet = $this->getWallet($userId, true);
            
            if (!$wallet) {
                // Criar carteira se não existir
                $createWalletStmt = $this->db->prepare("INSERT INTO wallets (user_id) VALUES (?)");
                $createWalletStmt->execute([$userId]);
                $wallet = $this->getWallet($userId, true);
            }
            
            $balance = (float)$wallet['balance'];
            if ($balance < $betAmount) {
                throw new Exception("Saldo insuficiente. Saldo atual: R$ " . number_format($balance, 2, ',', '.'));
            }
            
            // Gerar cartela
            $card = BingoCardGenerator::generateCard();
            $cardNumbers = BingoCardGenerator::cardToArray($card);
            
            // Criar jogo primeiro (para ter o ID)
            $gameStmt = $this->db->prepare("
                INSERT INTO bingo_games (seed, numbers_drawn, status)
                VALUES ('', '', 'active')
            ");
            $gameStmt->execute();
            $gameId = $this->db->lastInsertId();
            
            // Gerar seed usando o game_id
            $timestamp = time();
            $seed = BingoDraw::generateSeed($gameId, $timestamp);
            $drawSequence = BingoDraw::generateDrawSequence($seed);
            
            // Atualizar jogo com seed e sequência
            $updateGameStmt = $this->db->prepare("
                UPDATE bingo_games SET seed = ?, numbers_drawn = ? WHERE id = ?
            ");
            $updateGameStmt->execute([$seed, json_encode($drawSequence), $gameId]);
            
            // Processar resultado (verificar se ganhou)
            // Pegar todos os números que foram sorteados e verificar quais acertaram
            $matchedNumbers = BingoDraw::getMatchedNumbers($cardNumbers, $drawSequence, count($drawSequence));
            
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
        // Buscar carteira antes do débito para obter o saldo anterior
        $walletBefore = $this->getWallet($userId);
        $balanceBefore = $walletBefore ? (float)$walletBefore['balance'] : 0.0;
        
        $stmt = $this->db->prepare("
            UPDATE wallets 
            SET balance = balance - ?, 
                total_wagered = total_wagered + ?
            WHERE user_id = ?
        ");
        $stmt->execute([$amount, $amount, $userId]);
        
        // Buscar carteira após o débito para obter o saldo atual e o ID
        $wallet = $this->getWallet($userId);
        $balanceAfter = $wallet ? (float)$wallet['balance'] : 0.0;
        
        // Criar transação
        $transStmt = $this->db->prepare("
            INSERT INTO wallet_transactions
            (wallet_id, user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id, status)
            VALUES (?, ?, 'bet', ?, ?, ?, ?, 'bingo_card', ?, 'completed')
        ");
        $transStmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $balanceBefore,
            $balanceAfter,
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
        // Buscar carteira antes do crédito para obter o saldo anterior
        $walletBefore = $this->getWallet($userId);
        $balanceBefore = $walletBefore ? (float)$walletBefore['balance'] : 0.0;
        
        $stmt = $this->db->prepare("
            UPDATE wallets 
            SET balance = balance + ?,
                total_won = total_won + ?
            WHERE user_id = ?
        ");
        $stmt->execute([$amount, $amount, $userId]);
        
        // Buscar carteira após o crédito para obter o saldo atual e o ID
        $wallet = $this->getWallet($userId);
        $balanceAfter = $wallet ? (float)$wallet['balance'] : 0.0;
        
        // Criar transação
        $transStmt = $this->db->prepare("
            INSERT INTO wallet_transactions
            (wallet_id, user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id, status)
            VALUES (?, ?, 'prize', ?, ?, ?, ?, 'bingo_card', ?, 'completed')
        ");
        $transStmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $balanceBefore,
            $balanceAfter,
            "Prêmio Bingo - Cartela #{$cardId}",
            $cardId
        ]);
    }
    
    /**
     * Busca carteira do usuário
     * 
     * @param int $userId ID do usuário
     * @param bool $forUpdate Se true, adiciona FOR UPDATE para lock da linha
     * @return array|false Dados da carteira ou false se não encontrada
     */
    private function getWallet($userId, $forUpdate = false) {
        $sql = "SELECT * FROM wallets WHERE user_id = ?";
        if ($forUpdate) {
            $sql .= " FOR UPDATE";
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

