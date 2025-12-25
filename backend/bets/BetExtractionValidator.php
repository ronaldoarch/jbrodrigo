<?php
/**
 * Validador de Extrações para Apostas
 * Valida se pode apostar em uma extração específica
 */

require_once __DIR__ . '/../scraper/config/database.php';

class BetExtractionValidator {
    private $lastError = '';
    
    /**
     * Verifica se pode apostar em uma extração
     */
    public function canBet($extractionId) {
        $db = getDB();
        
        // Buscar extração
        $stmt = $db->prepare("
            SELECT * FROM extractions 
            WHERE id = ? AND is_active = TRUE
        ");
        $stmt->execute([$extractionId]);
        $extraction = $stmt->fetch();
        
        if (!$extraction) {
            $this->lastError = "Extração não encontrada ou inativa";
            return false;
        }
        
        // Verificar se já foi completada
        if ($extraction['status'] === 'completed') {
            $this->lastError = "Extração já foi sorteada";
            return false;
        }
        
        // Verificar horário de fechamento
        $now = new DateTime('now', new DateTimeZone('America/Sao_Paulo'));
        $closeTime = DateTime::createFromFormat('H:i:s', $extraction['close_time'], new DateTimeZone('America/Sao_Paulo'));
        
        // Adicionar margem de segurança de 2 minutos
        $closeTime->modify('-2 minutes');
        
        if ($now >= $closeTime) {
            $this->lastError = "Horário de fechamento já passou";
            return false;
        }
        
        // Verificar dia da semana
        $dayOfWeek = $now->format('w'); // 0 = Domingo, 1 = Segunda, etc.
        $daysMap = [
            0 => 'DOMINGO',
            1 => 'SEGUNDA',
            2 => 'TERÇA',
            3 => 'QUARTA',
            4 => 'QUINTA',
            5 => 'SEXTA',
            6 => 'SABADO'
        ];
        $currentDay = $daysMap[$dayOfWeek];
        
        $allowedDays = explode(',', $extraction['days_of_week']);
        if (!in_array($currentDay, $allowedDays)) {
            $this->lastError = "Extração não disponível neste dia da semana";
            return false;
        }
        
        return true;
    }
    
    /**
     * Retorna a última mensagem de erro
     */
    public function getLastError() {
        return $this->lastError;
    }
}

