import { useState, useEffect } from 'react';
import api from '../services/api';
import './Resultados.css';

const Resultados = () => {
  const [activeTab, setActiveTab] = useState('jogo-do-bicho');
  const [extractions, setExtractions] = useState([]);
  const [lotteries, setLotteries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    if (activeTab === 'jogo-do-bicho') {
      loadJogoDoBichoResults();
    } else {
      loadLotteriesResults();
    }
  }, [activeTab, dateFilter, stateFilter]);

  const loadJogoDoBichoResults = async () => {
    setLoading(true);
    try {
      let url = '/api/extractions-list.php';
      const params = new URLSearchParams();
      
      if (dateFilter) {
        params.append('date', dateFilter);
      }
      if (stateFilter) {
        params.append('state', stateFilter);
      }
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await api.get(url);
      if (response.data.success) {
        // Filtrar apenas extrações completadas (com resultados)
        const completed = response.data.extractions.filter(
          (e) => e.status === 'completed' && e.position_1
        );
        setExtractions(completed);
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLotteriesResults = async () => {
    setLoading(true);
    try {
      // Por enquanto, usar endpoint genérico ou mock
      // Em produção, criar endpoint específico para loterias
      const response = await api.get('/backend/scraper/results.php?type=lottery').catch(() => ({
        data: { success: false, results: [] }
      }));
      
      if (response.data.success) {
        setLotteries(response.data.results || []);
      } else {
        // Mock data para demonstração
        setLotteries([]);
      }
    } catch (error) {
      console.error('Erro ao carregar loterias:', error);
      setLotteries([]);
    } finally {
      setLoading(false);
    }
  };

  const getAnimalName = (code) => {
    const animals = {
      1: 'Avestruz', 2: 'Águia', 3: 'Burro', 4: 'Borboleta', 5: 'Cachorro',
      6: 'Cabra', 7: 'Carneiro', 8: 'Camelo', 9: 'Cobra', 10: 'Coelho',
      11: 'Cavalo', 12: 'Elefante', 13: 'Galo', 14: 'Gato', 15: 'Jacaré',
      16: 'Leão', 17: 'Macaco', 18: 'Porco', 19: 'Pavão', 20: 'Peru',
      21: 'Touro', 22: 'Tigre', 23: 'Urso', 24: 'Veado', 25: 'Vaca',
    };
    return animals[code] || `Animal ${code}`;
  };

  const getAnimalEmoji = (code) => {
    const emojis = {
      1: '🐦', 2: '🦅', 3: '🫏', 4: '🦋', 5: '🐕',
      6: '🐐', 7: '🐑', 8: '🐪', 9: '🐍', 10: '🐰',
      11: '🐴', 12: '🐘', 13: '🐓', 14: '🐱', 15: '🐊',
      16: '🦁', 17: '🐵', 18: '🐷', 19: '🦚', 20: '🦃',
      21: '🐂', 22: '🐅', 23: '🐻', 24: '🦌', 25: '🐄',
    };
    return emojis[code] || '🎲';
  };

  // Obter data de hoje como padrão
  const today = new Date().toISOString().split('T')[0];

  if (loading && extractions.length === 0 && lotteries.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="resultados">
      <div className="container">
        <h1>Resultados dos Sorteios</h1>

        {/* Tabs */}
        <div className="results-tabs">
          <button
            className={`tab ${activeTab === 'jogo-do-bicho' ? 'active' : ''}`}
            onClick={() => setActiveTab('jogo-do-bicho')}
          >
            Jogo do Bicho
          </button>
          <button
            className={`tab ${activeTab === 'loterias' ? 'active' : ''}`}
            onClick={() => setActiveTab('loterias')}
          >
            Loterias
          </button>
        </div>

        {/* Filtros */}
        <div className="results-filters">
          <div className="filter-group">
            <label>Data:</label>
            <input
              type="date"
              value={dateFilter || today}
              onChange={(e) => setDateFilter(e.target.value)}
              max={today}
            />
          </div>
          {activeTab === 'jogo-do-bicho' && (
            <div className="filter-group">
              <label>Estado:</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="PE">Pernambuco</option>
                <option value="GO">Goiás</option>
              </select>
            </div>
          )}
        </div>

        {/* Conteúdo da Tab Ativa */}
        {activeTab === 'jogo-do-bicho' ? (
          <>
            {extractions.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum resultado disponível para a data selecionada.</p>
              </div>
            ) : (
              <div className="results-list">
                {extractions.map((extraction) => (
                  <div key={extraction.id} className="result-card">
                    <div className="result-header">
                      <h2>{extraction.description}</h2>
                      <span className="game-type">
                        {extraction.game_type || extraction.loteria}
                      </span>
                    </div>

                    <div className="results-grid">
                      {[1, 2, 3, 4, 5, 6, 7].map((pos) => {
                        const number = extraction[`position_${pos}`];
                        const animal = extraction[`animal_${pos}`];
                        if (!number) return null;

                        return (
                          <div key={pos} className="result-item">
                            <div className="position">{pos}º Prêmio</div>
                            <div className="number">{number}</div>
                            {animal && (
                              <div className="animal">
                                <span className="animal-emoji">
                                  {getAnimalEmoji(parseInt(animal))}
                                </span>
                                <span className="animal-name">
                                  {getAnimalName(parseInt(animal))}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {extraction.extraction_date && (
                      <div className="result-date">
                        Sorteado em:{' '}
                        {new Date(extraction.extraction_date).toLocaleDateString(
                          'pt-BR',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {lotteries.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum resultado de loteria disponível no momento.</p>
                <p className="empty-note">
                  Os resultados das loterias da Caixa serão exibidos aqui em breve.
                </p>
              </div>
            ) : (
              <div className="results-list">
                {lotteries.map((lottery) => (
                  <div key={lottery.id} className="result-card">
                    <div className="result-header">
                      <h2>{lottery.name}</h2>
                      <span className="game-type">{lottery.type}</span>
                    </div>
                    <div className="lottery-numbers">
                      {lottery.numbers?.map((num, idx) => (
                        <span key={idx} className="lottery-number">
                          {num}
                        </span>
                      ))}
                    </div>
                    {lottery.date && (
                      <div className="result-date">
                        Sorteado em:{' '}
                        {new Date(lottery.date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Resultados;
