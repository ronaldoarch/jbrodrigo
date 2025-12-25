<?php
/**
 * Criar Aposta (Versão 2)
 * Suporta todas as modalidades e tipos de apostas
 */

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../scraper/config/database.php';
require_once __DIR__ . '/../utils/auth-helper.php';
require_once __DIR__ . '/BetCalculator.php';
require_once __DIR__ . '/BetExtractionValidator.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

try {
    $userId = requireAuth();
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validações básicas
    if (!isset($data['bet_type']) || !in_array($data['bet_type'], ['normal', 'instant'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Tipo de aposta inválido']);
        exit;
    }
    
    if (!isset($data['items']) || !is_array($data['items']) || empty($data['items'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Itens de aposta são obrigatórios']);
        exit;
    }
    
    $betType = $data['bet_type'];
    $extractionId = isset($data['extraction_id']) ? (int)$data['extraction_id'] : null;
    $gameType = isset($data['game_type']) ? $data['game_type'] : 'INSTANTANEA';
    
    $db = getDB();
    $db->beginTransaction();
    
    try {
        // Validar extração se for aposta normal
        if ($betType === 'normal' && $extractionId) {
            $validator = new BetExtractionValidator();
            if (!$validator->canBet($extractionId)) {
                throw new Exception($validator->getLastError());
            }
            
            // Buscar game_type da extração
            $stmt = $db->prepare("SELECT game_type FROM extractions WHERE id = ?");
            $stmt->execute([$extractionId]);
            $extraction = $stmt->fetch();
            if ($extraction) {
                $gameType = $extraction['game_type'];
            }
        }
        
        // Calcular valor total
        $totalAmount = 0;
        $allItems = [];
        
        foreach ($data['items'] as $item) {
            $modality = $item['modality'];
            $betValue = $item['bet_value'];
            $positions = $item['positions'];
            $valueInput = (float)$item['value'];
            $divisionType = isset($item['division_type']) ? $item['division_type'] : 'todos';
            
            // Calcular unidades
            $units = BetCalculator::calculateUnits($modality, $betValue, $positions, $divisionType);
            
            // Calcular valor por unidade
            $valuePerUnit = BetCalculator::calculateValuePerUnit($valueInput, $units, $divisionType);
            
            // Calcular valor total deste item
            $itemTotal = BetCalculator::calculateTotalValue($valuePerUnit, $units, $divisionType);
            
            // Obter multiplicador
            $multiplier = BetCalculator::getMultiplier($modality, $positions);
            
            // Calcular prêmio potencial
            $potentialPrize = BetCalculator::calculatePotentialPrize($valuePerUnit, $units, $multiplier);
            
            $allItems[] = [
                'modality' => $modality,
                'bet_value' => $betValue,
                'positions' => $positions,
                'value_per_unit' => $valuePerUnit,
                'units' => $units,
                'multiplier' => $multiplier,
                'potential_prize' => $potentialPrize,
                'item_total' => $itemTotal
            ];
            
            $totalAmount += $itemTotal;
        }
        
        // Verificar saldo
        $stmt = $db->prepare("SELECT balance, bonus_balance FROM wallets WHERE user_id = ? FOR UPDATE");
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch();
        
        if (!$wallet) {
            throw new Exception("Carteira não encontrada");
        }
        
        $availableBalance = $wallet['balance'] + $wallet['bonus_balance'];
        if ($availableBalance < $totalAmount) {
            throw new Exception("Saldo insuficiente. Disponível: R$ " . number_format($availableBalance, 2, ',', '.'));
        }
        
        // Debitar saldo (primeiro do bônus, depois do saldo principal)
        $remainingDebit = $totalAmount;
        $bonusDebit = min($remainingDebit, $wallet['bonus_balance']);
        $balanceDebit = $remainingDebit - $bonusDebit;
        
        $newBonusBalance = $wallet['bonus_balance'] - $bonusDebit;
        $newBalance = $wallet['balance'] - $balanceDebit;
        
        $stmt = $db->prepare("UPDATE wallets SET balance = ?, bonus_balance = ? WHERE user_id = ?");
        $stmt->execute([$newBalance, $newBonusBalance, $userId]);
        
        // Criar transação de débito
        $stmt = $db->prepare("SELECT id FROM wallets WHERE user_id = ?");
        $stmt->execute([$userId]);
        $walletData = $stmt->fetch();
        
        $stmt = $db->prepare("
            INSERT INTO wallet_transactions 
            (wallet_id, user_id, type, amount, balance_before, balance_after, 
             description, reference_type, status)
            VALUES (?, ?, 'bet', ?, ?, ?, ?, 'bet', 'completed')
        ");
        $stmt->execute([
            $walletData['id'],
            $userId,
            $totalAmount,
            $availableBalance,
            $newBalance + $newBonusBalance,
            "Aposta no $gameType",
            'bet'
        ]);
        
        // Criar aposta
        $stmt = $db->prepare("
            INSERT INTO bets 
            (user_id, extraction_id, bet_type, game_type, total_amount, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([$userId, $extractionId, $betType, $gameType, $totalAmount]);
        $betId = $db->lastInsertId();
        
        // Criar itens da aposta
        foreach ($allItems as $item) {
            $stmt = $db->prepare("
                INSERT INTO bet_items 
                (bet_id, modality, bet_value, positions, value_per_unit, units, 
                 multiplier, potential_prize)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $betId,
                $item['modality'],
                $item['bet_value'],
                $item['positions'],
                $item['value_per_unit'],
                $item['units'],
                $item['multiplier'],
                $item['potential_prize']
            ]);
        }
        
        // Se for aposta instantânea, liquidar imediatamente
        if ($betType === 'instant') {
            require_once __DIR__ . '/BetSettlement.php';
            $settlement = BetSettlement::settleBet($betId);
        }
        
        // Buscar aposta criada
        $stmt = $db->prepare("SELECT * FROM bets WHERE id = ?");
        $stmt->execute([$betId]);
        $bet = $stmt->fetch();
        
        $db->commit();
        
        echo json_encode([
            'success' => true,
            'bet' => $bet,
            'message' => 'Aposta criada com sucesso'
        ]);
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Erro ao criar aposta: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

