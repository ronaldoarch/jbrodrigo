import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Keno.css';

const Keno = () => {
  const { user } = useAuth();
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [betAmount, setBetAmount] = useState(1.00);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealedNumbers, setRevealedNumbers] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [payoutTable, setPayoutTable] = useState(null);
  const [balance, setBalance] = useState(0);

  const MIN_SELECTION = 2;
  const MAX_SELECTION = 10;
  const TOTAL_NUMBERS = 80;
  const NUMBERS_DRAWN = 20;

  useEffect(() => {
    loadBalance();
    loadHistory();
    loadPayoutTable();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await api.get('/backend/auth/me.php');
      if (response.data.user?.wallet) {
        setBalance(response.data.user.wallet.balance || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get('/backend/keno/list-games.php?limit=10');
      if (response.data.success) {
        setHistory(response.data.games || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadPayoutTable = async () => {
    try {
      const response = await api.get('/backend/keno/payout-table.php');
      if (response.data.success) {
        setPayoutTable(response.data.payout_table);
      }
    } catch (error) {
      console.error('Erro ao carregar tabela de premiação:', error);
    }
  };

  const toggleNumber = (number) => {
    if (isRevealing || game) return; // Não permitir mudanças durante revelação ou após jogo

    setSelectedNumbers((prev) => {
      if (prev.includes(number)) {
        // Remover número
        return prev.filter((n) => n !== number);
      } else {
        // Adicionar número (limitado)
        if (prev.length >= MAX_SELECTION) {
          return prev;
        }
        return [...prev, number].sort((a, b) => a - b);
      }
    });
  };

  const createGame = async () => {
    if (selectedNumbers.length < MIN_SELECTION) {
      setError(`Selecione pelo menos ${MIN_SELECTION} números`);
      return;
    }

    if (selectedNumbers.length > MAX_SELECTION) {
      setError(`Selecione no máximo ${MAX_SELECTION} números`);
      return;
    }

    setLoading(true);
    setError('');
    setGame(null);
    setRevealedNumbers([]);
    setCurrentRevealIndex(0);

    try {
      const response = await api.post('/backend/keno/create-game.php', {
        chosen_numbers: selectedNumbers,
        bet_amount: betAmount,
      });

      if (response.data.success) {
        const newGame = response.data.game;
        setGame(newGame);
        setBalance(response.data.balance || balance);
        startRevealAnimation(newGame);
        loadHistory();
      } else {
        setError(response.data.error || 'Erro ao criar jogo');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao criar jogo');
    } finally {
      setLoading(false);
    }
  };

  const startRevealAnimation = (gameData) => {
    setIsRevealing(true);
    setCurrentRevealIndex(0);
    setRevealedNumbers([]);

    const drawnNumbers = gameData.drawn_numbers || [];
    let index = 0;

    const interval = setInterval(() => {
      if (index >= drawnNumbers.length) {
        clearInterval(interval);
        setIsRevealing(false);
        setRevealedNumbers(drawnNumbers);
        return;
      }

      setRevealedNumbers((prev) => [...prev, drawnNumbers[index]]);
      setCurrentRevealIndex(index);
      index++;
    }, 150); // 150ms entre cada número
  };

  const resetGame = () => {
    setSelectedNumbers([]);
    setGame(null);
    setRevealedNumbers([]);
    setCurrentRevealIndex(0);
    setIsRevealing(false);
    setError('');
  };

  const isNumberSelected = (number) => {
    return selectedNumbers.includes(number);
  };

  const isNumberDrawn = (number) => {
    return revealedNumbers.includes(number);
  };

  const isNumberHit = (number) => {
    return selectedNumbers.includes(number) && revealedNumbers.includes(number);
  };

  const renderNumberGrid = () => {
    const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    const columns = 10;

    return (
      <div className="keno-grid">
        {numbers.map((number) => {
          const selected = isNumberSelected(number);
          const drawn = isNumberDrawn(number);
          const hit = isNumberHit(number);
          
          let className = 'keno-number';
          if (selected) className += ' selected';
          if (drawn) className += ' drawn';
          if (hit) className += ' hit';
          if (isRevealing && currentRevealIndex < revealedNumbers.length - 1 && revealedNumbers[currentRevealIndex] === number) {
            className += ' revealing';
          }

          return (
            <button
              key={number}
              className={className}
              onClick={() => toggleNumber(number)}
              disabled={loading || isRevealing || !!game}
            >
              {number}
            </button>
          );
        })}
      </div>
    );
  };

  const renderPayoutInfo = () => {
    if (!payoutTable || selectedNumbers.length < MIN_SELECTION) return null;

    const multipliers = payoutTable[selectedNumbers.length];
    if (!multipliers) return null;

    return (
      <div className="keno-payout-info">
        <h3>Tabela de Premiação</h3>
        <div className="payout-list">
          {Object.entries(multipliers).map(([hits, multiplier]) => (
            <div key={hits} className="payout-item">
              <span className="hits">{hits} acerto{hits > 1 ? 's' : ''}</span>
              <span className="multiplier">{multiplier}x</span>
              <span className="prize">
                R$ {(betAmount * multiplier).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGameResult = () => {
    if (!game) return null;

    return (
      <div className="keno-result">
        <div className="result-header">
          <h2>Resultado</h2>
          {game.prize > 0 && (
            <div className="prize-badge">
              <span className="prize-label">Prêmio</span>
              <span className="prize-value">R$ {parseFloat(game.prize).toFixed(2)}</span>
            </div>
          )}
        </div>
        
        <div className="result-stats">
          <div className="stat-item">
            <span className="stat-label">Números escolhidos:</span>
            <span className="stat-value">{game.chosen_numbers?.length || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Acertos:</span>
            <span className="stat-value highlight">{game.hits}</span>
          </div>
          {game.prize > 0 && (
            <div className="stat-item">
              <span className="stat-label">Prêmio:</span>
              <span className="stat-value highlight">R$ {parseFloat(game.prize).toFixed(2)}</span>
            </div>
          )}
        </div>

        <button className="btn btn-primary" onClick={resetGame}>
          Novo Jogo
        </button>
      </div>
    );
  };

  return (
    <div className="keno-page">
      <div className="container">
        <div className="keno-header">
          <h1>🎰 Keno</h1>
          <p className="subtitle">Escolha de 2 a 10 números de 1 a 80</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {!game && (
          <div className="keno-setup">
            <div className="selection-info">
              <div className="info-item">
                <span className="info-label">Números selecionados:</span>
                <span className="info-value">{selectedNumbers.length} / {MAX_SELECTION}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Valor da aposta:</span>
                <div className="bet-input">
                  <span>R$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
                    disabled={loading || isRevealing || !!game}
                  />
                </div>
              </div>
              {selectedNumbers.length > 0 && (
                <div className="selected-numbers-list">
                  {selectedNumbers.map((num) => (
                    <span key={num} className="selected-number-tag">
                      {num}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {renderPayoutInfo()}

            <div className="keno-controls">
              <button
                className="btn btn-primary"
                onClick={createGame}
                disabled={
                  loading ||
                  selectedNumbers.length < MIN_SELECTION ||
                  betAmount <= 0 ||
                  balance < betAmount
                }
              >
                {loading ? 'Processando...' : 'Jogar'}
              </button>
              {selectedNumbers.length > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedNumbers([])}
                  disabled={loading || isRevealing || !!game}
                >
                  Limpar Seleção
                </button>
              )}
            </div>
          </div>
        )}

        <div className="keno-grid-container">
          {renderNumberGrid()}
        </div>

        {game && renderGameResult()}

        <div className="keno-history-section">
          <button
            className="btn btn-text"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Ocultar' : 'Mostrar'} Histórico
          </button>

          {showHistory && (
            <div className="keno-history">
              {history.length === 0 ? (
                <p className="no-history">Nenhum jogo encontrado</p>
              ) : (
                history.map((gameItem) => (
                  <div key={gameItem.id} className="history-item">
                    <div className="history-header">
                      <span className="history-date">
                        {new Date(gameItem.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {gameItem.prize > 0 && (
                        <span className="history-prize">
                          +R$ {parseFloat(gameItem.prize).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="history-details">
                      <span>
                        {gameItem.chosen_numbers?.length || 0} números →{' '}
                        {gameItem.hits} acerto{gameItem.hits !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Keno;

