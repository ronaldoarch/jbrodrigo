import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useBetSettlement from '../hooks/useBetSettlement';
import './MinhasApostas.css';

const MinhasApostas = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [selectedBet, setSelectedBet] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    won: 0,
    lost: 0,
    pending: 0,
  });

  // Verificação automática de liquidações
  useBetSettlement(() => {
    loadBets();
    loadStats();
  });

  useEffect(() => {
    loadBets();
    loadStats();

    // Recarregar quando página recebe foco
    const handleFocus = () => {
      loadBets();
      loadStats();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [page, statusFilter, modalityFilter]);

  const loadBets = async () => {
    setLoading(true);
    try {
      let url = `/backend/bets/list.php?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (modalityFilter) url += `&modality=${modalityFilter}`;

      const response = await api.get(url);

      if (response.data.success) {
        setBets(response.data.bets);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar apostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/backend/bets/list.php?limit=1000');
      if (response.data.success) {
        const allBets = response.data.bets;
        const statsData = {
          total: allBets.length,
          won: allBets.filter((b) => b.status === 'settled_won').length,
          lost: allBets.filter((b) => b.status === 'settled_lost').length,
          pending: allBets.filter((b) => b.status === 'pending').length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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

  const openModal = (bet) => {
    setSelectedBet(bet);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBet(null);
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

        {/* Estatísticas */}
        <div className="stats-cards">
          <div className="stat-card">
            <h3>Total</h3>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card won">
            <h3>Ganhas</h3>
            <div className="stat-value">{stats.won}</div>
          </div>
          <div className="stat-card lost">
            <h3>Perdidas</h3>
            <div className="stat-value">{stats.lost}</div>
          </div>
          <div className="stat-card pending">
            <h3>Pendentes</h3>
            <div className="stat-value">{stats.pending}</div>
          </div>
        </div>

        {/* Filtros */}
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
            <option value="settling">Liquidando</option>
          </select>

          <select
            value={modalityFilter}
            onChange={(e) => {
              setModalityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas as Modalidades</option>
            <option value="grupo">Grupo</option>
            <option value="milhar">Milhar</option>
            <option value="centena">Centena</option>
            <option value="dezena">Dezena</option>
            <option value="dupla-grupo">Dupla-Grupo</option>
            <option value="terno-grupo">Terno-Grupo</option>
            <option value="quadra-grupo">Quadra-Grupo</option>
          </select>
        </div>

        {bets.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não fez nenhuma aposta.</p>
            <Link to="/apostar" className="btn btn-primary">
              Fazer Primeira Aposta
            </Link>
          </div>
        ) : (
          <>
            <div className="bets-list">
              {bets.map((bet) => (
                <div key={bet.id} className="bet-card" onClick={() => openModal(bet)}>
                  <div className="bet-header">
                    <div>
                      <h3>Ref: #{bet.id}</h3>
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
                      <span className="label">Extração:</span>
                      <span className="value">
                        {bet.extraction_description || bet.game_caption || bet.game_type}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Modalidade:</span>
                      <span className="value">
                        {bet.items?.[0]?.modality || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Valor apostado:</span>
                      <span className="value">
                        R$ {parseFloat(bet.total_amount || bet.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    {bet.prize_amount > 0 && (
                      <div className="detail-row">
                        <span className="label">Prêmio:</span>
                        <span className="prize">
                          R$ {parseFloat(bet.prize_amount).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {bet.items && bet.items.length > 0 && (
                    <div className="bet-items-preview">
                      <h4>Itens ({bet.items.length}):</h4>
                      <div className="items-preview">
                        {bet.items.slice(0, 2).map((item, index) => (
                          <span key={index} className="item-tag">
                            {item.bet_value} ({item.positions})
                          </span>
                        ))}
                        {bet.items.length > 2 && (
                          <span className="item-tag more">
                            +{bet.items.length - 2} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bet-actions">
                    <button className="btn-link">Ver Detalhes →</button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedBet && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Aposta #{selectedBet.id}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Informações Gerais</h3>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={getStatusClass(selectedBet.status)}>
                    {getStatusLabel(selectedBet.status)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Extração:</span>
                  <span className="value">
                    {selectedBet.extraction_description || selectedBet.game_caption || selectedBet.game_type}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Data:</span>
                  <span className="value">
                    {new Date(selectedBet.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Valor Total:</span>
                  <span className="value highlight">
                    R$ {parseFloat(selectedBet.total_amount || selectedBet.amount || 0).toFixed(2)}
                  </span>
                </div>
                {selectedBet.prize_amount > 0 && (
                  <div className="detail-row">
                    <span className="label">Prêmio:</span>
                    <span className="prize">
                      R$ {parseFloat(selectedBet.prize_amount).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {selectedBet.items && selectedBet.items.length > 0 && (
                <div className="modal-section">
                  <h3>Itens da Aposta</h3>
                  <div className="items-list">
                    {selectedBet.items.map((item, index) => (
                      <div key={index} className="item-detail">
                        <div className="item-header">
                          <span className="item-number">#{index + 1}</span>
                          <span className={getStatusClass(item.won ? 'settled_won' : selectedBet.status)}>
                            {item.won ? '✓ Ganhou' : getStatusLabel(selectedBet.status)}
                          </span>
                        </div>
                        <div className="item-info">
                          <div><strong>Modalidade:</strong> {item.modality}</div>
                          <div><strong>Valor:</strong> {item.bet_value}</div>
                          <div><strong>Posições:</strong> {item.positions}</div>
                          <div><strong>Unidades:</strong> {item.units}</div>
                          <div><strong>Valor/Unidade:</strong> R$ {parseFloat(item.value_per_unit || 0).toFixed(2)}</div>
                          <div><strong>Total:</strong> R$ {(parseFloat(item.value_per_unit || 0) * (item.units || 1)).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <Link
                  to={`/apostar?repeat=${selectedBet.id}`}
                  className="btn btn-primary"
                >
                  Repetir Rápido
                </Link>
                <button className="btn btn-secondary" onClick={closeModal}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinhasApostas;
