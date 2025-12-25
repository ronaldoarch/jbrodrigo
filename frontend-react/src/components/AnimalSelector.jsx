import { useState } from 'react';
import { animals } from '../data/animals';
import './AnimalSelector.css';

const AnimalSelector = ({ selectedAnimals = [], onSelect, modality }) => {
  const [selected, setSelected] = useState(selectedAnimals);

  const handleAnimalClick = (animalId) => {
    let newSelected;
    
    // Regras baseadas na modalidade
    if (modality === 'grupo') {
      // Grupo: selecionar exatamente 1 animal
      newSelected = selected.includes(animalId) ? [] : [animalId];
    } else if (modality === 'dupla-grupo') {
      // Dupla: selecionar exatamente 2 animais
      if (selected.includes(animalId)) {
        newSelected = selected.filter((id) => id !== animalId);
      } else if (selected.length < 2) {
        newSelected = [...selected, animalId];
      } else {
        // Substituir o primeiro se já tiver 2
        newSelected = [selected[1], animalId];
      }
    } else if (modality === 'terno-grupo') {
      // Terno: selecionar exatamente 3 animais
      if (selected.includes(animalId)) {
        newSelected = selected.filter((id) => id !== animalId);
      } else if (selected.length < 3) {
        newSelected = [...selected, animalId];
      } else {
        // Substituir o primeiro se já tiver 3
        newSelected = [...selected.slice(1), animalId];
      }
    } else if (modality === 'quadra-grupo') {
      // Quadra: selecionar exatamente 4 animais
      if (selected.includes(animalId)) {
        newSelected = selected.filter((id) => id !== animalId);
      } else if (selected.length < 4) {
        newSelected = [...selected, animalId];
      } else {
        // Substituir o primeiro se já tiver 4
        newSelected = [...selected.slice(1), animalId];
      }
    } else {
      // Padrão: toggle simples
      newSelected = selected.includes(animalId)
        ? selected.filter((id) => id !== animalId)
        : [...selected, animalId];
    }

    setSelected(newSelected);
    onSelect(newSelected);
  };

  const getRequiredCount = () => {
    if (modality === 'grupo') return 1;
    if (modality === 'dupla-grupo') return 2;
    if (modality === 'terno-grupo') return 3;
    if (modality === 'quadra-grupo') return 4;
    return 0;
  };

  const requiredCount = getRequiredCount();
  const isValid = selected.length === requiredCount;

  return (
    <div className="animal-selector">
      <div className="animal-selector-header">
        <h3>Selecione os Animais</h3>
        <div className={`selection-info ${isValid ? 'valid' : 'invalid'}`}>
          <span>{selected.length} animal(is) selecionado(s)</span>
          {requiredCount > 0 && (
            <span className="required">
              {isValid ? '✓' : '⚠'} Selecione exatamente {requiredCount} grupo(s).
            </span>
          )}
        </div>
      </div>

      <div className="animals-grid">
        {animals.map((animal) => (
          <div
            key={animal.id}
            className={`animal-card ${selected.includes(animal.id) ? 'selected' : ''}`}
            onClick={() => handleAnimalClick(animal.id)}
          >
            <div className="animal-number">{String(animal.id).padStart(2, '0')}</div>
            <div className="animal-name">{animal.name}</div>
            <div className="animal-numbers">
              {animal.numbers.map((num, idx) => (
                <span key={idx} className="number-tag">
                  {num}
                </span>
              ))}
            </div>
            {selected.includes(animal.id) && (
              <div className="selected-badge">✓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimalSelector;

