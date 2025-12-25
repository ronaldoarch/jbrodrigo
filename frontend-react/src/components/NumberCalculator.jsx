import { useState, useEffect } from 'react';
import './NumberCalculator.css';

const NumberCalculator = ({ modality, selectedNumbers = [], onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [numbers, setNumbers] = useState(selectedNumbers);

  useEffect(() => {
    onSelect(numbers);
  }, [numbers, onSelect]);

  const getRequiredDigits = () => {
    if (modality.includes('milhar')) return 4;
    if (modality.includes('centena')) return 3;
    if (modality.includes('dezena')) return 2;
    return 4; // padrão
  };

  const requiredDigits = getRequiredDigits();

  const handleNumberClick = (num) => {
    if (inputValue.length < requiredDigits) {
      setInputValue(inputValue + num);
    }
  };

  const handleClear = () => {
    setInputValue('');
  };

  const handleDelete = () => {
    setInputValue(inputValue.slice(0, -1));
  };

  const handleInsert = () => {
    if (inputValue.length === requiredDigits) {
      const num = inputValue.padStart(requiredDigits, '0');
      if (!numbers.includes(num)) {
        setNumbers([...numbers, num]);
        setInputValue('');
      }
    }
  };

  const handleRandom = () => {
    const randomNum = Math.floor(Math.random() * Math.pow(10, requiredDigits))
      .toString()
      .padStart(requiredDigits, '0');
    setInputValue(randomNum);
  };

  const handleRemoveNumber = (num) => {
    setNumbers(numbers.filter((n) => n !== num));
  };

  const isValid = inputValue.length === requiredDigits;

  return (
    <div className="number-calculator">
      <div className="calculator-header">
        <h3>Números:</h3>
        <p className="instruction">
          Insira {requiredDigits} dígitos para {modality.includes('milhar') ? 'Milhar' : modality.includes('centena') ? 'Centena' : 'Dezena'} ou gere um número aleatório.
        </p>
      </div>

      {/* Números Selecionados */}
      {numbers.length > 0 && (
        <div className="selected-numbers">
          <label>Números Selecionados:</label>
          <div className="numbers-list">
            {numbers.map((num, idx) => (
              <div key={idx} className="number-chip">
                {num}
                <button
                  type="button"
                  className="remove-number"
                  onClick={() => handleRemoveNumber(num)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

      {/* Campo de Input */}
      <div className="input-section">
        <div className="input-display">
          <input
            type="text"
            value={inputValue || ''}
            placeholder={Array(requiredDigits).fill('0').join('')}
            readOnly
            className={`number-input ${isValid ? 'valid' : ''}`}
          />
          <button
            type="button"
            className="btn-random"
            onClick={handleRandom}
            title="Gerar número aleatório"
          >
            Sorte
          </button>
        </div>
        <small>Digite {requiredDigits} dígitos para {modality.includes('milhar') ? 'Milhar' : modality.includes('centena') ? 'Centena' : 'Dezena'}</small>
      </div>

      {/* Teclado Numérico */}
      <div className="number-keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            className="keypad-button"
            onClick={() => handleNumberClick(num.toString())}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className="keypad-button delete"
          onClick={handleDelete}
        >
          ⌫
        </button>
        <button
          type="button"
          className="keypad-button"
          onClick={() => handleNumberClick('0')}
        >
          0
        </button>
        <button
          type="button"
          className="keypad-button insert"
          onClick={handleInsert}
          disabled={!isValid}
        >
          Inserir
        </button>
      </div>
    </div>
  );
};

export default NumberCalculator;

