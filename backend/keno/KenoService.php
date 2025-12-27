<?php
/**
 * Serviço Principal de Keno
 * Gerencia a lógica completa do jogo
 */

require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/KenoDraw.php';
require_once __DIR__ . '/KenoValidator.php';
require_once __DIR__ . '/KenoPayout.php';

class KenoService {
    
    private $db;
    
    public function __construct() {
        $this->db = getDB();
    }
    
    /**
     * Cria um novo jogo de Keno
     * 
     * @param int $userId ID do usuário
     * @param array $chosenNumbers Números escolhidos (2-10 números de 1-80)
     * @param float $betAmount Valor da aposta
     * @return array Dados do jogo criado
     * @throws Exception Em caso de erro
     */
    public function createGame($userId, $chosenNumbers, $betAmount) {
        $this->db->beginTransaction();
        
        try {
            // Validar números escolhidos
            $validation = KenoValidator::validateChosenNumbers($chosenNumbers);
            if (!$validation['valid']) {
                throw new Exception(implode(', ', $validation['errors']));
            }
            
            // Ordenar números para consistência
            sort($chosenNumbers);
            
            // Verificar saldo do usuário
            $wallet = $this->getWallet($userId);
            if ($wallet['balance'] < $betAmount) {
                throw new Exception("Saldo insuficiente");
            }
            
            // Criar registro do jogo primeiro (para ter o ID)
            $gameStmt = $this->db->prepare("
                INSERT INTO keno_games (user_id, seed, chosen_numbers, drawn_numbers, hits, prize, bet_amount, status)
                VALUES (?, '', ?, '', 0, 0, ?, 'finished')
            ");
            $gameStmt->execute([$userId, json_encode($chosenNumbers), $betAmount]);
            $gameId = $this->db->lastInsertId();
            
            // Gerar seed usando o game_id
            $timestamp = time();
            $seed = KenoDraw::generateSeed($gameId, $timestamp);
            $drawnNumbers = KenoDraw::generateDraw($seed);
            sort($drawnNumbers); // Ordenar para exibição
            
            // Contar acertos
            $hits = KenoDraw::countHits($chosenNumbers, $drawnNumbers);
            
            // Calcular prêmio
            $chosenCount = count($chosenNumbers);
            $prize = KenoPayout::calculatePrize($betAmount, $chosenCount, $hits);
            
            // Atualizar jogo com seed, números sorteados, acertos e prêmio
            $updateStmt = $this->db->prepare("
                UPDATE keno_games 
                SET seed = ?, drawn_numbers = ?, hits = ?, prize = ?
                WHERE id = ?
            ");
            $updateStmt->execute([
                $seed,
                json_encode($drawnNumbers),
                $hits,
                $prize,
                $gameId
            ]);
            
            // Debitar valor da aposta
            $this->debitBet($userId, $betAmount, $gameId);
            
            // Se ganhou, creditar prêmio
            if ($prize > 0) {
                $this->creditPrize($userId, $prize, $gameId);
            }
            
            $this->db->commit();
            
            // Buscar jogo completo
            return $this->getGameById($gameId);
            
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    /**
     * Busca jogo por ID
     * 
     * @param int $gameId ID do jogo
     * @return array Dados do jogo
     */
    public function getGameById($gameId) {
        $stmt = $this->db->prepare("
            SELECT * FROM keno_games WHERE id = ?
        ");
        $stmt->execute([$gameId]);
        $game = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($game) {
            $game['chosen_numbers'] = json_decode($game['chosen_numbers'], true);
            $game['drawn_numbers'] = json_decode($game['drawn_numbers'], true);
        }
        
        return $game;
    }
    
    /**
     * Lista jogos do usuário
     * 
     * @param int $userId ID do usuário
     * @param int $limit Limite de resultados
     * @param int $offset Offset para paginação
     * @return array Lista de jogos
     */
    public function getUserGames($userId, $limit = 20, $offset = 0) {
        $stmt = $this->db->prepare("
            SELECT * FROM keno_games 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$userId, $limit, $offset]);
        $games = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($games as &$game) {
            $game['chosen_numbers'] = json_decode($game['chosen_numbers'], true);
            $game['drawn_numbers'] = json_decode($game['drawn_numbers'], true);
        }
        
        return $games;
    }
    
    /**
     * Debita valor da aposta da carteira
     * 
     * @param int $userId ID do usuário
     * @param float $amount Valor a debitar
     * @param int $gameId ID do jogo
     */
    private function debitBet($userId, $amount, $gameId) {
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
            VALUES (?, ?, 'bet', ?, ?, ?, ?, 'keno', ?, 'completed')
        ");
        $transStmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $wallet['balance'] + $amount,
            $wallet['balance'],
            "Aposta Keno - Jogo #{$gameId}",
            $gameId
        ]);
    }
    
    /**
     * Credita prêmio na carteira
     * 
     * @param int $userId ID do usuário
     * @param float $amount Valor do prêmio
     * @param int $gameId ID do jogo
     */
    private function creditPrize($userId, $amount, $gameId) {
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
            VALUES (?, ?, 'prize', ?, ?, ?, ?, 'keno', ?, 'completed')
        ");
        $transStmt->execute([
            $wallet['id'],
            $userId,
            $amount,
            $balanceBefore,
            $wallet['balance'],
            "Prêmio Keno - Jogo #{$gameId}",
            $gameId
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

