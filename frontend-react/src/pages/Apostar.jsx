import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Apostar.css';

const Apostar = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Estados de controle
  const [currentStep, setCurrentStep] = useState(1);
  const [extractions, setExtractions] = useState([]);
  const [selectedExtraction, setSelectedExtraction] = useState(null);
  const [betType, setBetType] = useState('normal');
  const [modality, setModality] = useState('');
  const [betValue, setBetValue] = useState('');
  const [positions, setPositions] = useState('1');
  const [value, setValue] = useState('');
  const [divisionType, setDivisionType] = useState('todos');
  const [odds, setOdds] = useState({});
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const extractionId = searchParams.get('extraction');
    if (extractionId && extractions.length > 0) {
      const ext = extractions.find((e) => e.id === parseInt(extractionId));
      if (ext) {
        setSelectedExtraction(ext);
        setBetType('normal');
      }
    }
  }, [searchParams, extractions]);

  useEffect(() => {
    if (currentStep === 3) {
      calculateBet();
    }
  }, [modality, betValue, positions, value, divisionType, currentStep]);

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
    if (!modality || !betValue || !value) {
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

    if (mod === 'grupo') {
      return val.split(',').length * positionsArray.length;
    }
    return val.split(',').length * positionsArray.length;
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
      // Validar etapa 2: Seleção
      if (!betValue) {
        setError('Preencha o valor da aposta');
        return;
      }
      if (!positions) {
        setError('Selecione as posições');
        return;
      }
      if (!value || parseFloat(value) <= 0) {
        setError('Informe um valor válido');
        return;
      }
      setCurrentStep(3);
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
      const betData = {
        bet_type: betType,
        extraction_id:
          betType === 'normal' && selectedExtraction
            ? selectedExtraction.id
            : null,
        game_type:
          betType === 'normal' && selectedExtraction
            ? selectedExtraction.game_type
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
        // Salvar dados da aposta para página de confirmação
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

        {/* Barra de Progresso */}
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="progress-circle">1</div>
            <span className="progress-label">Modalidade</span>
            <div className="progress-line"></div>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
            <div className="progress-circle">2</div>
            <span className="progress-label">Seleção</span>
            <div className="progress-line"></div>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="progress-circle">3</div>
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
              
              {betType === 'normal' && (
                <div className="form-section">
                  <h3>Selecionar Extração</h3>
                  <select
                    value={selectedExtraction?.id || ''}
                    onChange={(e) => {
                      const ext = extractions.find(
                        (ex) => ex.id === parseInt(e.target.value)
                      );
                      setSelectedExtraction(ext);
                    }}
                    className="input-field"
                  >
                    <option value="">Selecione uma extração</option>
                    {extractions
                      .filter((e) => e.type === 'normal' && e.active)
                      .map((extraction) => (
                        <option key={extraction.id} value={extraction.id}>
                          {extraction.description} - Fecha às {extraction.close_time}
                        </option>
                      ))}
                  </select>
                </div>
              )}

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
                      <p>R$ {mod.multiplier?.toFixed(2)}</p>
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
                      <p>R$ {mod.multiplier?.toFixed(2)}</p>
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
                      <p>R$ {mod.multiplier?.toFixed(2)}</p>
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
                      <p>R$ {mod.multiplier?.toFixed(2)}</p>
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
                      <p>R$ {mod.multiplier?.toFixed(2)}</p>
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
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 2: Seleção */}
          {currentStep === 2 && (
            <div className="step-content">
              <h2>Preencha os Dados da Aposta</h2>

              <div className="form-group">
                <label>Número/Animal</label>
                <input
                  type="text"
                  value={betValue}
                  onChange={(e) => setBetValue(e.target.value)}
                  placeholder={
                    modality.includes('grupo')
                      ? 'Ex: 1,2,3 (códigos dos animais)'
                      : 'Ex: 1234 ou 1234,5678'
                  }
                  className="input-field"
                  required
                />
                <small>
                  {modality.includes('grupo')
                    ? 'Digite os códigos dos animais (1-25) separados por vírgula'
                    : 'Digite os números separados por vírgula'}
                </small>
              </div>

              <div className="form-group">
                <label>Posições</label>
                <input
                  type="text"
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                  placeholder="Ex: 1 ou 1,3,5 ou 1-5"
                  className="input-field"
                  required
                />
                <small>
                  {modality.includes('milhar')
                    ? 'Posições: 1-5 (Ex: 1, 1-3, 1-5)'
                    : 'Posições: 1-7 (Ex: 1, 1-3, 1-7)'}
                </small>
              </div>

              <div className="form-group">
                <label>Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                  required
                />
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="todos"
                      checked={divisionType === 'todos'}
                      onChange={(e) => setDivisionType(e.target.value)}
                    />
                    <span>Dividir entre todas as unidades</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="cada"
                      checked={divisionType === 'cada'}
                      onChange={(e) => setDivisionType(e.target.value)}
                    />
                    <span>Valor por unidade</span>
                  </label>
                </div>
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
                  disabled={!betValue || !positions || !value}
                >
                  Próximo →
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: Confirmação */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="step-content">
              <h2>Confirme sua Aposta</h2>

              {calculation && (
                <div className="calculation-card">
                  <h3>Resumo da Aposta</h3>
                  <div className="calculation-details">
                    <div className="calc-row">
                      <span className="highlight">Modalidade:</span>
                      <span>{odds[modality]?.name || modality}</span>
                    </div>
                    {selectedExtraction && (
                      <div className="calc-row">
                        <span className="highlight">Extração:</span>
                        <span>{selectedExtraction.description}</span>
                      </div>
                    )}
                    <div className="calc-row">
                      <span className="highlight">Valor:</span>
                      <span>{betValue}</span>
                    </div>
                    <div className="calc-row">
                      <span className="highlight">Posições:</span>
                      <span>{positions}</span>
                    </div>
                    <div className="calc-row">
                      <span className="highlight">Unidades:</span>
                      <span>{calculation.units}</span>
                    </div>
                    <div className="calc-row">
                      <span className="highlight">Valor por unidade:</span>
                      <span>R$ {calculation.value_per_unit?.toFixed(2)}</span>
                    </div>
                    <div className="calc-row">
                      <span className="highlight">Valor total:</span>
                      <span className="highlight">R$ {calculation.total_value?.toFixed(2)}</span>
                    </div>
                    <div className="calc-row">
                      <span className="highlight">Multiplicador:</span>
                      <span>{calculation.multiplier}x</span>
                    </div>
                    <div className="calc-row">
                      <span className="highlight">Prêmio potencial:</span>
                      <span className="prize">R$ {calculation.potential_prize?.toFixed(2)}</span>
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
                  {submitting ? 'Processando...' : 'Finalizar Aposta'}
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
