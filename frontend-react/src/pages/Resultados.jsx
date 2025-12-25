import { useState, useEffect } from 'react';
import api from '../services/api';
import './Resultados.css';

const Resultados = () => {
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const response = await api.get('/api/extractions-list.php');
      if (response.data.success) {
        // Filtrar apenas extrações completadas
        const completed = response.data.extractions.filter(
          (e) => e.status === 'completed'
        );
        setExtractions(completed);
      }
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAnimalName = (code) => {
    const animals = {
      1: 'Avestruz',
      2: 'Águia',
      3: 'Burro',
      4: 'Borboleta',
      5: 'Cachorro',
      6: 'Cabra',
      7: 'Carneiro',
      8: 'Camelo',
      9: 'Cobra',
      10: 'Coelho',
      11: 'Cavalo',
      12: 'Elefante',
      13: 'Galo',
      14: 'Gato',
      15: 'Jacaré',
      16: 'Leão',
      17: 'Macaco',
      18: 'Porco',
      19: 'Pavão',
      20: 'Peru',
      21: 'Touro',
      22: 'Tigre',
      23: 'Urso',
      24: 'Veado',
      25: 'Vaca',
    };
    return animals[code] || `Animal ${code}`;
  };

  if (loading) {
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

        {extractions.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum resultado disponível no momento.</p>
          </div>
        ) : (
          <div className="results-list">
            {extractions.map((extraction) => (
              <div key={extraction.id} className="result-card">
                <div className="result-header">
                  <h2>{extraction.description}</h2>
                  <span className="game-type">{extraction.game_type}</span>
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
                            {animal} - {getAnimalName(animal)}
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
                      'pt-BR'
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resultados;

