import { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Bingo.css';

// Import dinâmico do Keno para evitar erros de carregamento
const Keno = lazy(() => import('./Keno'));

const Bingo = () => {
  const [activeTab, setActiveTab] = useState('bingo'); // 'bingo' ou 'keno'
  const { user, checkAuth } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betAmount, setBetAmount] = useState(1.00);
  const [balance, setBalance] = useState(0);
  const [revealedNumbers, setRevealedNumbers] = useState([]);
  const [currentDrawIndex, setCurrentDrawIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'bingo') {
      loadHistory();
      loadBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Inicializar saldo do contexto se disponível
  useEffect(() => {
    if (user?.wallet?.balance !== undefined) {
      setBalance(parseFloat(user.wallet.balance) || 0);
    }
  }, [user]);

  const loadBalance = async () => {
    try {
      const response = await api.get('/backend/wallet/balance.php');
      if (response.data.success) {
        const balanceValue = parseFloat(response.data.balance) || 0;
        setBalance(balanceValue);
        // Atualizar contexto de autenticação também
        await checkAuth();
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      // Usar saldo do contexto como fallback
      if (user?.wallet?.balance !== undefined) {
        setBalance(parseFloat(user.wallet.balance) || 0);
      }
    }
  };

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
        loadBalance(); // Atualizar saldo
        checkAuth(); // Atualizar contexto de autenticação
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

  const arrayToMatrix = (array, columns) => {
    if (!array || !Array.isArray(array)) return [];
    const matrix = [];
    for (let i = 0; i < array.length; i += columns) {
      matrix.push(array.slice(i, i + columns));
    }
    return matrix;
  };

  const getPatternName = (pattern) => {
    if (!pattern) return '';
    const patterns = {
      'linha': 'Linha',
      'coluna': 'Coluna',
      'diagonal_principal': 'Diagonal Principal',
      'diagonal_secundaria': 'Diagonal Secundária',
      'cheia': 'Cartela Cheia'
    };
    return patterns[pattern] || pattern;
  };

  const renderCard = () => {
    if (!card || !card.card_numbers) return null;

    const cardNumbers = card.card_numbers;
    const cardMatrix = arrayToMatrix(cardNumbers, 5);

    return (
      <div className="bingo-card">
        <div className="bingo-card-header">
          <h3>Cartela de Bingo</h3>
          {card.prize_amount > 0 && (
            <div className="prize-badge">
              Prêmio: R$ {parseFloat(card.prize_amount).toFixed(2)}
            </div>
          )}
        </div>
        <div className="bingo-grid">
          {cardMatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="bingo-row">
              {row.map((number, colIndex) => {
                const isMatched = isNumberMatched(number);
                const isCenter = rowIndex === 2 && colIndex === 2;
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`bingo-cell ${isMatched ? 'matched' : ''} ${isCenter ? 'center' : ''}`}
                  >
                    {isCenter ? 'FREE' : number}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {card.win_pattern && (
          <div className="win-pattern">
            Padrão vencedor: {getPatternName(card.win_pattern)}
          </div>
        )}
      </div>
    );
  };


  const resetGame = () => {
    setCard(null);
    setRevealedNumbers([]);
    setCurrentDrawIndex(0);
    setIsRevealing(false);
    setError('');
  };

  return (
    <div className="bingo-page">
      <div className="container">
        {/* Tabs */}
        <div className="game-tabs">
          <button
            className={`tab-button ${activeTab === 'bingo' ? 'active' : ''}`}
            onClick={() => setActiveTab('bingo')}
          >
            🎯 Bingo
          </button>
          <button
            className={`tab-button ${activeTab === 'keno' ? 'active' : ''}`}
            onClick={() => setActiveTab('keno')}
          >
            🎰 Keno
          </button>
        </div>

        {/* Conteúdo baseado na tab ativa */}
        {activeTab === 'bingo' ? (
          <>
            <div className="bingo-header">
              <h1>🎯 Bingo Automático</h1>
              <p className="subtitle">Escolha o valor e jogue!</p>
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {!card && (
              <div className="bingo-setup">
                <div className="bet-control">
                  <label>Valor da Aposta:</label>
                  <div className="bet-input">
                    <span>R$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                      disabled={loading}
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={createCard}
                  disabled={loading || betAmount <= 0 || balance < betAmount}
                >
                  {loading ? 'Processando...' : 'Gerar Cartela'}
                </button>
                {balance < betAmount && (
                  <p className="insufficient-balance-warning">
                    Saldo insuficiente. Saldo atual: R$ {balance.toFixed(2)}
                  </p>
                )}
              </div>
            )}

            {card && (
              <>
                {renderCard()}
                <div className="bingo-controls">
                  <button className="btn btn-primary" onClick={resetGame}>
                    Novo Jogo
                  </button>
                </div>
              </>
            )}

            <div className="bingo-history-section">
              <button
                className="btn btn-text"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Ocultar' : 'Mostrar'} Histórico
              </button>

              {showHistory && (
                <div className="bingo-history">
                  {history.length === 0 ? (
                    <p className="no-history">Nenhuma cartela encontrada</p>
                  ) : (
                    history.map((cardItem) => (
                      <div key={cardItem.id} className="history-item">
                        <div className="history-header">
                          <span className="history-date">
                            {new Date(cardItem.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          {cardItem.prize_amount > 0 && (
                            <span className="history-prize">
                              +R$ {parseFloat(cardItem.prize_amount).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="history-details">
                          <span>
                            {cardItem.result === 'win' ? '✅ Ganhou' : '❌ Perdeu'}
                            {cardItem.win_pattern && ` - ${getPatternName(cardItem.win_pattern)}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <Suspense fallback={<div className="loading">Carregando Keno...</div>}>
            <Keno />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default Bingo;
