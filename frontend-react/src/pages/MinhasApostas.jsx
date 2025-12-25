import { useState, useEffect } from 'react';
import api from '../services/api';
import './MinhasApostas.css';

const MinhasApostas = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadBets();
  }, [page, statusFilter]);

  const loadBets = async () => {
    setLoading(true);
    try {
      const url = `/backend/bets/list.php?page=${page}&limit=20${
        statusFilter ? `&status=${statusFilter}` : ''
      }`;
      const response = await api.get(url);

      if (response.data.success) {
        setBets(response.data.bets);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Erro ao carregar apostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      settling: 'Liquidando',
      settled_won: 'Ganhou',
      settled_lost: 'Perdeu',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  if (loading && bets.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="minhas-apostas">
      <div className="container">
        <h1>Minhas Apostas</h1>

        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            <option value="pending">Pendentes</option>
            <option value="settled_won">Ganhas</option>
            <option value="settled_lost">Perdidas</option>
          </select>
        </div>

        {bets.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não fez nenhuma aposta.</p>
          </div>
        ) : (
          <>
            <div className="bets-list">
              {bets.map((bet) => (
                <div key={bet.id} className="bet-card">
                  <div className="bet-header">
                    <div>
                      <h3>{bet.game_type}</h3>
                      <p className="bet-date">
                        {new Date(bet.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <span className={getStatusClass(bet.status)}>
                      {getStatusLabel(bet.status)}
                    </span>
                  </div>

                  <div className="bet-details">
                    <div className="detail-row">
                      <span>Valor apostado:</span>
                      <span className="value">
                        R$ {parseFloat(bet.total_amount).toFixed(2)}
                      </span>
                    </div>
                    {bet.prize_amount > 0 && (
                      <div className="detail-row">
                        <span>Prêmio:</span>
                        <span className="prize">
                          R$ {parseFloat(bet.prize_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {bet.extraction_description && (
                      <div className="detail-row">
                        <span>Extração:</span>
                        <span>{bet.extraction_description}</span>
                      </div>
                    )}
                  </div>

                  {bet.items && bet.items.length > 0 && (
                    <div className="bet-items">
                      <h4>Itens da aposta:</h4>
                      {bet.items.map((item, index) => (
                        <div key={index} className="bet-item">
                          <span>
                            {item.modality} - {item.bet_value} ({item.positions})
                          </span>
                          <span>
                            {item.units} un. × R${' '}
                            {parseFloat(item.value_per_unit).toFixed(2)} = R${' '}
                            {(
                              parseFloat(item.value_per_unit) * item.units
                            ).toFixed(2)}
                          </span>
                          {item.won && (
                            <span className="won-badge">✓ Ganhou</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MinhasApostas;

