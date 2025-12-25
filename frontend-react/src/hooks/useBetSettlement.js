import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

/**
 * Hook para verificar automaticamente liquidações de apostas
 * Atualiza a carteira quando há prêmios
 */
export const useBetSettlement = (onSettlement) => {
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkSettlements = async () => {
      try {
        const response = await api.get('/backend/bets/check-settlements.php');
        if (response.data.success && response.data.settled_bets?.length > 0) {
          // Há novas liquidações
          if (onSettlement) {
            onSettlement(response.data.settled_bets);
          }
          
          // Atualizar dados do usuário (carteira)
          await checkAuth();
        }
      } catch (error) {
        // Silenciar erros de verificação
        console.debug('Verificação de liquidações:', error.message);
      }
    };

    // Verificar a cada 5 segundos
    const interval = setInterval(checkSettlements, 5000);

    // Verificar imediatamente
    checkSettlements();

    return () => clearInterval(interval);
  }, [user, onSettlement, checkAuth]);
};

export default useBetSettlement;

