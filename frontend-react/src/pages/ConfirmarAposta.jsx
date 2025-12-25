import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './ConfirmarAposta.css';

const ConfirmarAposta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [betData, setBetData] = useState(null);

  useEffect(() => {
    // Buscar dados da aposta do sessionStorage ou location.state
    const savedBet = sessionStorage.getItem('lastBet');
    const stateBet = location.state?.bet;

    if (stateBet) {
      setBetData(stateBet);
    } else if (savedBet) {
      try {
        setBetData(JSON.parse(savedBet));
      } catch (error) {
        console.error('Erro ao parsear dados da aposta:', error);
        navigate('/apostar');
      }
    } else {
      // Se não houver dados, redirecionar para apostar
      navigate('/apostar');
    }
  }, [navigate, location.state]);

  if (!betData) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="confirmar-aposta">
      <div className="container">
        <div className="confirmation-card">
          <div className="success-icon">✓</div>
          <h1>Aposta realizada com sucesso!</h1>
          <p className="confirmation-message">
            Sua aposta foi registrada e está aguardando o resultado dos sorteios.
          </p>

          <div className="bet-summary">
            <div className="summary-row">
              <span className="label">Referência:</span>
              <span className="value">#{betData.id || 'N/A'}</span>
            </div>
            {betData.game_caption && (
              <div className="summary-row">
                <span className="label">Extração:</span>
                <span className="value">{betData.game_caption}</span>
              </div>
            )}
            {betData.total_amount && (
              <div className="summary-row">
                <span className="label">Valor Total:</span>
                <span className="value highlight">
                  R$ {parseFloat(betData.total_amount).toFixed(2)}
                </span>
              </div>
            )}
            {betData.items && betData.items.length > 0 && (
              <div className="summary-row">
                <span className="label">Itens:</span>
                <span className="value">{betData.items.length}</span>
              </div>
            )}
          </div>

          <div className="confirmation-actions">
            <Link to="/minhas-apostas" className="btn btn-primary">
              Ver Minhas Apostas
            </Link>
            <Link to="/apostar" className="btn btn-secondary">
              Fazer Nova Aposta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarAposta;

