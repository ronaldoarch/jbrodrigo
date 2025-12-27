import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Bingo.css';

const Bingo = () => {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betAmount, setBetAmount] = useState(1.00);
  const [revealedNumbers, setRevealedNumbers] = useState([]);
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get('/backend/bingo/list-cards.php?limit=10');
      if (response.data.success) {
        setHistory(response.data.cards || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const createCard = async () => {
    setLoading(true);
    setError('');
    setCard(null);
    setRevealedNumbers([]);
    setCurrentDrawIndex(0);

    try {
      const response = await api.post('/backend/bingo/create-card.php', {
        bet_amount: betAmount
      });

      if (response.data.success) {
        const newCard = response.data.card;
        setCard(newCard);
        startRevealAnimation(newCard);
        loadHistory(); // Atualizar histórico
      } else {
        setError(response.data.error || 'Erro ao criar cartela');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar cartela');
    } finally {
      setLoading(false);
    }
  };

  const startRevealAnimation = (cardData) => {
    setIsRevealing(true);
    setCurrentDrawIndex(0);
    setRevealedNumbers([]);

    // Animação: revelar números com delay
    const drawSequence = cardData.numbers_drawn || [];
    const interval = setInterval(() => {
      setCurrentDrawIndex((prev) => {
        const next = prev + 1;
        if (next >= drawSequence.length) {
          clearInterval(interval);
          setIsRevealing(false);
          // Garantir que todos os números acertados estão revelados
          setRevealedNumbers(cardData.numbers_matched || []);
          return prev;
        }
        
        const drawnNumber = drawSequence[next];
        const isMatched = cardData.numbers_matched?.includes(drawnNumber);
        
        if (isMatched) {
          setRevealedNumbers((prev) => [...prev, drawnNumber]);
        }
        
        return next;
      });
    }, 100); // 100ms entre cada número (ajustável)
  };

  const isNumberMatched = (number) => {
    return revealedNumbers.includes(number);
  };

  const renderCard = () => {
    if (!card || !card.card_numbers) return null;

    const cardNumbers = card.card_numbers;
    const cardMatrix = arrayToMatrix(cardNumbers, 5);

    return (
      <div className="bingo-card-container">
        <div className="bingo-card-header">
          <h3>Cartela de Bingo</h3>
          <div className="card-info">
            <span>Status: {card.result === 'win' ? '🎉 Ganhou!' : '❌ Perdeu'}</span>
            {card.win_pattern && (
              <span className="win-pattern">
                Padrão: {getPatternName(card.win_pattern)}
              </span>
            )}
          </div>
        </div>
        
        <div className="bingo-card">
          <div className="bingo-header">
            <div className="bingo-letter">B</div>
            <div className="bingo-letter">I</div>
            <div className="bingo-letter">N</div>
            <div className="bingo-letter">G</div>
            <div className="bingo-letter">O</div>
          </div>
          
          {cardMatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="bingo-row">
              {row.map((number, colIndex) => {
                const matched = isNumberMatched(number);
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`bingo-cell ${matched ? 'matched' : ''}`}
                  >
                    {number}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {card.result === 'win' && card.prize_amount > 0 && (
          <div className="prize-info">
            <h4>🎉 Parabéns! Você ganhou!</h4>
            <p className="prize-amount">
              Prêmio: R$ {card.prize_amount.toFixed(2).replace('.', ',')}
            </p>
          </div>
        )}

        <div className="draw-progress">
          <p>
            Números sorteados: {currentDrawIndex} / {card.numbers_drawn?.length || 0}
          </p>
        </div>
      </div>
    );
  };

  const arrayToMatrix = (array, cols) => {
    const matrix = [];
    for (let i = 0; i < array.length; i += cols) {
      matrix.push(array.slice(i, i + cols));
    }
    return matrix;
  };

  const getPatternName = (pattern) => {
    const names = {
      'linha': 'Linha',
      'coluna': 'Coluna',
      'diagonal_principal': 'Diagonal Principal',
      'diagonal_secundaria': 'Diagonal Secundária',
      'cheia': 'Cartela Cheia'
    };
    return names[pattern] || pattern;
  };

  return (
    <div className="bingo-page">
      <div className="container">
        <h1>Bingo Automático</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="bingo-controls">
          <div className="bet-control">
            <label>Valor da Aposta (R$)</label>
            <input
              type="number"
              step="0.01"
              min="1.00"
              value={betAmount}
              onChange={(e) => setBetAmount(parseFloat(e.target.value) || 1.00)}
              disabled={loading || isRevealing}
            />
          </div>

          <button
            className="btn btn-primary btn-create-card"
            onClick={createCard}
            disabled={loading || isRevealing}
          >
            {loading ? 'Criando...' : 'Nova Cartela'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Ocultar' : 'Ver'} Histórico
          </button>
        </div>

        {card && renderCard()}

        {showHistory && (
          <div className="bingo-history">
            <h2>Histórico de Partidas</h2>
            {history.length === 0 ? (
              <p>Nenhuma partida ainda</p>
            ) : (
              <div className="history-list">
                {history.map((cardItem) => (
                  <div
                    key={cardItem.id}
                    className={`history-item ${cardItem.result === 'win' ? 'won' : 'lost'}`}
                  >
                    <div className="history-info">
                      <span className="history-date">
                        {new Date(cardItem.created_at).toLocaleString('pt-BR')}
                      </span>
                      <span className="history-result">
                        {cardItem.result === 'win' ? '🎉 Ganhou' : '❌ Perdeu'}
                      </span>
                      {cardItem.win_pattern && (
                        <span className="history-pattern">
                          {getPatternName(cardItem.win_pattern)}
                        </span>
                      )}
                    </div>
                    <div className="history-amounts">
                      <span>Aposta: R$ {cardItem.bet_amount.toFixed(2).replace('.', ',')}</span>
                      {cardItem.prize_amount > 0 && (
                        <span className="prize">
                          Prêmio: R$ {cardItem.prize_amount.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bingo;

