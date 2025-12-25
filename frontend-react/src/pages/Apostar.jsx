import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AnimalSelector from '../components/AnimalSelector';
import NumberCalculator from '../components/NumberCalculator';
import './Apostar.css';

const Apostar = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados de controle
  const [currentStep, setCurrentStep] = useState(1);
  const [extractions, setExtractions] = useState([]);
  const [selectedExtractions, setSelectedExtractions] = useState([]);
  const [betType, setBetType] = useState('normal');
  const [modality, setModality] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [positions, setPositions] = useState('1');
  const [value, setValue] = useState('');
  const [divisionType, setDivisionType] = useState('todos');
  const [bonus, setBonus] = useState(0);
  const [useBonus, setUseBonus] = useState(false);
  const [odds, setOdds] = useState({});
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Verificar se modalidade é de grupo
  const isGroupModality = () => {
    return modality.includes('grupo');
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const extractionId = searchParams.get('extraction');
    if (extractionId && extractions.length > 0) {
      const ext = extractions.find((e) => e.id === parseInt(extractionId));
      if (ext) {
        setSelectedExtractions([ext]);
        setBetType('normal');
      }
    }
  }, [searchParams, extractions]);

  useEffect(() => {
    if (currentStep === 5) {
      calculateBet();
    }
  }, [modality, selectedAnimals, selectedNumbers, positions, value, divisionType, currentStep, selectedExtractions]);

  const loadData = async () => {
    try {
      const [extractionsRes, oddsRes] = await Promise.all([
        api.get('/api/extractions-list.php'),
        api.get('/backend/bets/odds.php'),
      ]);

      if (extractionsRes.data.success) {
        setExtractions(extractionsRes.data.extractions);
      }
      if (oddsRes.data.success) {
        setOdds(oddsRes.data.odds);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBet = async () => {
    if (!modality) {
      setCalculation(null);
      return;
    }

    // Preparar betValue baseado na modalidade
    let betValue = '';
    if (isGroupModality()) {
      betValue = selectedAnimals.join(',');
    } else {
      betValue = selectedNumbers.join(',');
    }

    if (!betValue || !value) {
      setCalculation(null);
      return;
    }

    try {
      const response = await api.post('/backend/bets/calculate.php', {
        modality,
        bet_value: betValue,
        positions,
        value: parseFloat(value),
        division_type: divisionType,
      });

      if (response.data.success) {
        setCalculation(response.data.calculation);
      }
    } catch (error) {
      // Calcular localmente se API não disponível
      const multiplier = odds[modality]?.multiplier || 1;
      const units = estimateUnits(modality, betValue, positions);
      const valuePerUnit =
        divisionType === 'cada'
          ? parseFloat(value)
          : parseFloat(value) / units;
      const totalValue = valuePerUnit * units;
      const potentialPrize = totalValue * multiplier;

      setCalculation({
        units,
        value_per_unit: valuePerUnit,
        total_value: totalValue,
        multiplier,
        potential_prize: potentialPrize,
      });
    }
  };

  const estimateUnits = (mod, val, pos) => {
    const positionsArray = pos.includes('-')
      ? (() => {
          const [start, end] = pos.split('-').map(Number);
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        })()
      : pos.split(',').map(Number);

    const valuesArray = val.split(',');
    return valuesArray.length * positionsArray.length;
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 1) {
      // Validar etapa 1: Modalidade
      if (!modality) {
        setError('Selecione uma modalidade');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validar etapa 2: Seleção (Animais ou Números)
      if (isGroupModality()) {
        const requiredCount = modality === 'grupo' ? 1 : modality === 'dupla-grupo' ? 2 : modality === 'terno-grupo' ? 3 : 4;
        if (selectedAnimals.length !== requiredCount) {
          setError(`Selecione exatamente ${requiredCount} grupo(s)`);
          return;
        }
      } else {
        if (selectedNumbers.length === 0) {
          setError('Selecione pelo menos um número');
          return;
        }
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validar etapa 3: Posição e Quantia
      if (!positions) {
        setError('Selecione as posições');
        return;
      }
      if (!value || parseFloat(value) <= 0) {
        setError('Informe um valor válido');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Validar etapa 4: Sorteios (apenas para apostas normais)
      if (betType === 'normal') {
        if (selectedExtractions.length === 0) {
          setError('Selecione pelo menos um sorteio');
          return;
        }
      }
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!calculation) {
      setError('Erro no cálculo. Verifique os dados.');
      setSubmitting(false);
      return;
    }

    try {
      // Preparar betValue
      const betValue = isGroupModality() 
        ? selectedAnimals.join(',')
        : selectedNumbers.join(',');

      const betData = {
        bet_type: betType,
        extraction_ids: betType === 'normal' && selectedExtractions.length > 0
          ? selectedExtractions.map((e) => e.id)
          : [],
        game_type: betType === 'normal' && selectedExtractions.length > 0
          ? selectedExtractions[0].game_type
          : 'INSTANTANEA',
        items: [
          {
            modality,
            bet_value: betValue,
            positions,
            value: parseFloat(value),
            division_type: divisionType,
          },
        ],
      };

      const response = await api.post('/backend/bets/create-bet-v2.php', betData);

      if (response.data.success) {
        sessionStorage.setItem('lastBet', JSON.stringify({
          ...response.data.bet,
          calculation,
        }));
        navigate('/confirmar-aposta', { 
          state: { bet: response.data.bet } 
        });
      } else {
        setError(response.data.error || 'Erro ao criar aposta');
      }
    } catch (error) {
      setError(
        error.response?.data?.error || 'Erro ao processar aposta'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Agrupar modalidades por categoria
  const modalityGroups = {
    grupos: [
      { key: 'grupo', name: 'Grupo', multiplier: odds.grupo?.multiplier || 20 },
      { key: 'dupla-grupo', name: 'Dupla de Grupo', multiplier: odds['dupla-grupo']?.multiplier || 21.75 },
      { key: 'terno-grupo', name: 'Terno de Grupo', multiplier: odds['terno-grupo']?.multiplier || 150 },
      { key: 'quadra-grupo', name: 'Quadra de Grupo', multiplier: odds['quadra-grupo']?.multiplier || 1000 },
    ],
    dezenas: [
      { key: 'dezena', name: 'Dezena', multiplier: odds.dezena?.multiplier || 80 },
      { key: 'dezena-invertida', name: 'Dezena Invertida', multiplier: odds['dezena-invertida']?.multiplier || 80 },
      { key: 'duque-dezena', name: 'Duque de Dezena', multiplier: odds['duque-dezena']?.multiplier || 350 },
      { key: 'terno-dezena', name: 'Terno de Dezena', multiplier: odds['terno-dezena']?.multiplier || 3500 },
    ],
    centenas: [
      { key: 'centena', name: 'Centena', multiplier: odds.centena?.multiplier || 800 },
      { key: 'centena-invertida', name: 'Centena Invertida', multiplier: odds['centena-invertida']?.multiplier || 800 },
    ],
    milhares: [
      { key: 'milhar', name: 'Milhar', multiplier: odds.milhar?.multiplier || 6000 },
      { key: 'milhar-invertida', name: 'Milhar Invertida', multiplier: odds['milhar-invertida']?.multiplier || 6000 },
      { key: 'milhar-centena', name: 'Milhar/Centena', multiplier: odds['milhar-centena']?.multiplier || 3300 },
    ],
    passe: [
      { key: 'passe-vai-1-2', name: 'Passe Vai', multiplier: odds['passe-vai-1-2']?.multiplier || 180 },
      { key: 'passe-vai-vem-1-2', name: 'Passe Vai-e-Vem', multiplier: odds['passe-vai-vem-1-2']?.multiplier || 90 },
    ],
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="apostar">
      <div className="container">
        <h1>Fazer Aposta</h1>

        {/* Barra de Progresso - 5 Etapas */}
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="progress-circle">{currentStep > 1 ? '✓' : '1'}</div>
            <span className="progress-label">Modalidade</span>
            <div className="progress-line"></div>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="progress-circle">{currentStep > 2 ? '✓' : '2'}</div>
            <span className="progress-label">{isGroupModality() ? 'Animais' : 'Números'}</span>
            <div className="progress-line"></div>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
            <div className="progress-circle">{currentStep > 3 ? '✓' : '3'}</div>
            <span className="progress-label">Configuração</span>
            <div className="progress-line"></div>
          </div>
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
            <div className="progress-circle">{currentStep > 4 ? '✓' : '4'}</div>
            <span className="progress-label">Sorteios</span>
            <div className="progress-line"></div>
          </div>
          <div className={`progress-step ${currentStep >= 5 ? 'active' : ''}`}>
            <div className="progress-circle">5</div>
            <span className="progress-label">Confirmação</span>
          </div>
        </div>

        {/* Card Branco Central */}
        <div className="bet-form-container">
          {error && <div className="error">{error}</div>}

          {/* ETAPA 1: Modalidades */}
          {currentStep === 1 && (
            <div className="step-content">
              <h2>Selecione a Modalidade</h2>
              
              <div className="form-section">
                <h3>Tipo de Aposta</h3>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="normal"
                      checked={betType === 'normal'}
                      onChange={(e) => setBetType(e.target.value)}
                    />
                    <span>Aposta Normal</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="instant"
                      checked={betType === 'instant'}
                      onChange={(e) => setBetType(e.target.value)}
                    />
                    <span>Aposta Instantânea</span>
                  </label>
                </div>
              </div>

              {/* Grupos */}
              <div className="form-section">
                <h3>Grupos</h3>
                <div className="modalities-grid">
                  {modalityGroups.grupos.map((mod) => (
                    <div
                      key={mod.key}
                      className={`modality-card ${modality === mod.key ? 'selected' : ''}`}
                      onClick={() => setModality(mod.key)}
                    >
                      <h4>{mod.name}</h4>
                      <p>1x R$ {mod.multiplier?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dezenas */}
              <div className="form-section">
                <h3>Dezenas</h3>
                <div className="modalities-grid">
                  {modalityGroups.dezenas.map((mod) => (
                    <div
                      key={mod.key}
                      className={`modality-card ${modality === mod.key ? 'selected' : ''}`}
                      onClick={() => setModality(mod.key)}
                    >
                      <h4>{mod.name}</h4>
                      <p>1x R$ {mod.multiplier?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Centenas */}
              <div className="form-section">
                <h3>Centenas</h3>
                <div className="modalities-grid">
                  {modalityGroups.centenas.map((mod) => (
                    <div
                      key={mod.key}
                      className={`modality-card ${modality === mod.key ? 'selected' : ''}`}
                      onClick={() => setModality(mod.key)}
                    >
                      <h4>{mod.name}</h4>
                      <p>1x R$ {mod.multiplier?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milhares */}
              <div className="form-section">
                <h3>Milhares</h3>
                <div className="modalities-grid">
                  {modalityGroups.milhares.map((mod) => (
                    <div
                      key={mod.key}
                      className={`modality-card ${modality === mod.key ? 'selected' : ''}`}
                      onClick={() => setModality(mod.key)}
                    >
                      <h4>{mod.name}</h4>
                      <p>1x R$ {mod.multiplier?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Passe */}
              <div className="form-section">
                <h3>Passe</h3>
                <div className="modalities-grid">
                  {modalityGroups.passe.map((mod) => (
                    <div
                      key={mod.key}
                      className={`modality-card ${modality === mod.key ? 'selected' : ''}`}
                      onClick={() => setModality(mod.key)}
                    >
                      <h4>{mod.name}</h4>
                      <p>1x R$ {mod.multiplier?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="step-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!modality}
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: Seleção (Animais ou Números) */}
          {currentStep === 2 && (
            <div className="step-content">
              {isGroupModality() ? (
                <AnimalSelector
                  selectedAnimals={selectedAnimals}
                  onSelect={setSelectedAnimals}
                  modality={modality}
                />
              ) : (
                <NumberCalculator
                  modality={modality}
                  selectedNumbers={selectedNumbers}
                  onSelect={setSelectedNumbers}
                />
              )}

              <div className="step-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={
                    isGroupModality()
                      ? (modality === 'grupo' && selectedAnimals.length !== 1) ||
                        (modality === 'dupla-grupo' && selectedAnimals.length !== 2) ||
                        (modality === 'terno-grupo' && selectedAnimals.length !== 3) ||
                        (modality === 'quadra-grupo' && selectedAnimals.length !== 4)
                      : selectedNumbers.length === 0
                  }
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: Configuração (Posição e Quantia) */}
          {currentStep === 3 && (
            <div className="step-content">
              <h2>Configure sua Aposta</h2>

              <div className="form-section">
                <h3>Posição</h3>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="1"
                      checked={positions === '1'}
                      onChange={(e) => setPositions(e.target.value)}
                    />
                    <span>1º Prêmio</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="1-3"
                      checked={positions === '1-3'}
                      onChange={(e) => setPositions(e.target.value)}
                    />
                    <span>1º ao 3º</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="1-5"
                      checked={positions === '1-5'}
                      onChange={(e) => setPositions(e.target.value)}
                    />
                    <span>1º ao 5º</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="custom"
                      checked={positions === 'custom'}
                      onChange={(e) => setPositions(e.target.value)}
                    />
                    <span>Personalizado</span>
                  </label>
                </div>
                {positions === 'custom' && (
                  <input
                    type="text"
                    placeholder="Ex: 1,3,5 ou 1-5"
                    value={positions}
                    onChange={(e) => setPositions(e.target.value)}
                    className="input-field"
                  />
                )}
              </div>

              <div className="form-section">
                <h3>Quantia</h3>
                <div className="amount-controls">
                  <button
                    type="button"
                    className="amount-btn"
                    onClick={() => setValue(Math.max(0.1, parseFloat(value || 0) - 0.1).toFixed(2))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="5000"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="amount-input"
                    placeholder="R$ 0,00"
                  />
                  <button
                    type="button"
                    className="amount-btn"
                    onClick={() => setValue((parseFloat(value || 0) + 0.1).toFixed(2))}
                  >
                    +
                  </button>
                </div>
                <small>Mínimo: R$ 0,10 | Máximo: R$ 5.000,00</small>
              </div>

              <div className="form-section">
                <h3>Selecione a divisão</h3>
                <p className="division-info">
                  "Para todos os palpites" significa que o valor será dividido entre todos os palpites, enquanto "para cada palpite" significa que o valor será apostado para cada palpite.
                </p>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="todos"
                      checked={divisionType === 'todos'}
                      onChange={(e) => setDivisionType(e.target.value)}
                    />
                    <span>Para todos os palpites</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="cada"
                      checked={divisionType === 'cada'}
                      onChange={(e) => setDivisionType(e.target.value)}
                    />
                    <span>Para cada palpite</span>
                  </label>
                </div>
              </div>

              {bonus > 0 && (
                <div className="form-section">
                  <div className="bonus-info">
                    <span>Bônus disponível: R$ {bonus.toFixed(2)}</span>
                    <label>
                      <input
                        type="checkbox"
                        checked={useBonus}
                        onChange={(e) => setUseBonus(e.target.checked)}
                      />
                      <span>Utilizar bônus</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="step-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={!positions || !value || parseFloat(value) <= 0}
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 4: Selecionar Sorteios (apenas para apostas normais) */}
          {currentStep === 4 && (
            <div className="step-content">
              {betType === 'normal' ? (
                <>
                  <h2>Selecione os Sorteios</h2>
                  
                  {selectedExtractions.length === 0 && (
                    <div className="warning-box">
                      Nenhum sorteio selecionado
                    </div>
                  )}

                  <div className="extractions-list">
                    {extractions
                      .filter((e) => e.type === 'normal' && e.is_active)
                      .map((extraction) => (
                        <label key={extraction.id} className="extraction-item">
                          <input
                            type="checkbox"
                            checked={selectedExtractions.some((e) => e.id === extraction.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExtractions([...selectedExtractions, extraction]);
                              } else {
                                setSelectedExtractions(
                                  selectedExtractions.filter((ex) => ex.id !== extraction.id)
                                );
                              }
                            }}
                          />
                          <div className="extraction-info">
                            <span className="extraction-name">{extraction.description}</span>
                            <span className="extraction-time">Fecha às {extraction.close_time}</span>
                          </div>
                        </label>
                      ))}
                  </div>

                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBack}
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                      disabled={selectedExtractions.length === 0}
                    >
                      Continuar →
                    </button>
                  </div>
                </>
              ) : (
                // Para apostas instantâneas, pular direto para confirmação
                <>
                  <h2>Aposta Instantânea</h2>
                  <p>Esta é uma aposta instantânea. Clique em continuar para confirmar.</p>
                  <div className="step-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBack}
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Continuar →
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ETAPA 5: Confirmação */}
          {currentStep === 5 && (
            <form onSubmit={handleSubmit} className="step-content">
              <h2>Estamos quase lá!</h2>

              {calculation && (
                <div className="confirmation-summary">
                  <div className="bet-details">
                    <div className="detail-row">
                      <span>Palpite:</span>
                      <span className="bet-value">
                        {isGroupModality() 
                          ? selectedAnimals.map((id) => String(id).padStart(2, '0')).join(', ')
                          : selectedNumbers.join(', ')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Modalidade:</span>
                      <span>{odds[modality]?.name || modality}</span>
                    </div>
                    <div className="detail-row">
                      <span>Números:</span>
                      <span>
                        {isGroupModality() 
                          ? selectedAnimals.map((id) => String(id).padStart(2, '0')).join(', ')
                          : selectedNumbers.join(', ')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Posição:</span>
                      <span>
                        {positions === '1' ? '1º Prêmio' : 
                         positions === '1-3' ? '1º ao 3º' :
                         positions === '1-5' ? '1º ao 5º' : positions}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Quantidade:</span>
                      <span>{calculation.units} unidade(s) x {positions.includes('-') ? positions.split('-')[1] : '1'} posição(ões)</span>
                    </div>
                    {selectedExtractions.length > 0 && (
                      <div className="detail-row">
                        <span>Loteria(s):</span>
                        <span>{selectedExtractions.map((e) => e.description).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="calculation-summary">
                    <div className="calc-left">
                      <div className="calc-item">
                        <span>Valor Total da Aposta:</span>
                        <span className="highlight">R$ {calculation.total_value?.toFixed(2)}</span>
                      </div>
                      <div className="calc-item">
                        <span>Valor por palpite:</span>
                        <span>R$ {calculation.value_per_unit?.toFixed(2)}</span>
                      </div>
                      <small>({calculation.units} palpite(s) x R$ {calculation.value_per_unit?.toFixed(2)} = R$ {calculation.total_value?.toFixed(2)})</small>
                    </div>
                    <div className="calc-right">
                      <div className="calc-item">
                        <span>Prêmio mínimo possível:</span>
                        <span className="prize">R$ {calculation.potential_prize?.toFixed(2)}</span>
                      </div>
                      <div className="calc-item">
                        <span>Prêmio máximo possível:</span>
                        <span className="prize">R$ {calculation.potential_prize?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="step-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !calculation}
                >
                  {submitting ? 'Processando...' : 'Finalizar'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apostar;
