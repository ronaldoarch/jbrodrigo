import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Apostar.css';

const Apostar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [extractions, setExtractions] = useState([]);
  const [selectedExtraction, setSelectedExtraction] = useState(null);
  const [betType, setBetType] = useState('normal');
  const [modality, setModality] = useState('grupo');
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
    calculateBet();
  }, [modality, betValue, positions, value, divisionType]);

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
    if (!betValue || !value) {
      setCalculation(null);
      return;
    }

    try {
      // Simulação de cálculo (em produção, fazer chamada à API)
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
      // Se não houver endpoint de cálculo, calcular localmente
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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
        navigate('/minhas-apostas');
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

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="bet-form">
          <div className="form-section">
            <h2>Tipo de Aposta</h2>
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

          {betType === 'normal' && (
            <div className="form-section">
              <h2>Selecionar Extração</h2>
              <select
                value={selectedExtraction?.id || ''}
                onChange={(e) => {
                  const ext = extractions.find(
                    (ex) => ex.id === parseInt(e.target.value)
                  );
                  setSelectedExtraction(ext);
                }}
                required
              >
                <option value="">Selecione uma extração</option>
                {extractions
                  .filter((e) => e.type === 'normal')
                  .map((extraction) => (
                    <option key={extraction.id} value={extraction.id}>
                      {extraction.description} - {extraction.close_time}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="form-section">
            <h2>Modalidade</h2>
            <select
              value={modality}
              onChange={(e) => setModality(e.target.value)}
              required
            >
              {Object.keys(odds).map((key) => (
                <option key={key} value={key}>
                  {odds[key].name} ({odds[key].multiplier}x)
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h2>Número/Animal</h2>
            <input
              type="text"
              value={betValue}
              onChange={(e) => setBetValue(e.target.value)}
              placeholder={
                modality === 'grupo'
                  ? 'Ex: 1,2,3 (códigos dos animais)'
                  : 'Ex: 1234 ou 1234,5678'
              }
              required
            />
            <small>
              {modality === 'grupo'
                ? 'Digite os códigos dos animais (1-25) separados por vírgula'
                : 'Digite os números separados por vírgula'}
            </small>
          </div>

          <div className="form-section">
            <h2>Posições</h2>
            <input
              type="text"
              value={positions}
              onChange={(e) => setPositions(e.target.value)}
              placeholder="Ex: 1 ou 1,3,5 ou 1-5"
              required
            />
            <small>Ex: 1, 1-3, 1-5, etc.</small>
          </div>

          <div className="form-section">
            <h2>Valor</h2>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
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

          {calculation && (
            <div className="calculation-card">
              <h3>Resumo da Aposta</h3>
              <div className="calculation-details">
                <div className="calc-row">
                  <span>Unidades:</span>
                  <span>{calculation.units}</span>
                </div>
                <div className="calc-row">
                  <span>Valor por unidade:</span>
                  <span>R$ {calculation.value_per_unit?.toFixed(2)}</span>
                </div>
                <div className="calc-row">
                  <span>Valor total:</span>
                  <span className="highlight">
                    R$ {calculation.total_value?.toFixed(2)}
                  </span>
                </div>
                <div className="calc-row">
                  <span>Multiplicador:</span>
                  <span>{calculation.multiplier}x</span>
                </div>
                <div className="calc-row">
                  <span>Prêmio potencial:</span>
                  <span className="prize">
                    R$ {calculation.potential_prize?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !calculation}
          >
            {submitting ? 'Processando...' : 'Confirmar Aposta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Apostar;

