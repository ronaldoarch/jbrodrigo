import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminBets.css';

const AdminBets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    modality: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBet, setSelectedBet] = useState(null);

  useEffect(() => {
    loadBets();
  }, [page, filters]);

  const loadBets = async () => {
    setLoading(true);
    try {
      let url = `/backend/admin/bets.php?page=${page}&limit=20`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.modality) url += `&modality=${filters.modality}`;
      if (filters.search) url += `&search=${filters.search}`;

      const response = await api.get(url);
      if (response.data.success) {
        setBets(response.data.bets || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar apostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (betId) => {
    if (!confirm('Tem certeza que deseja liquidar esta aposta?')) return;

    try {
      const response = await api.post(`/backend/admin/bets.php`, {
        action: 'settle',
        id: betId,
      });
      if (response.data.success) {
        loadBets();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao liquidar aposta');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', label: 'Pendente' },
      won: { class: 'status-won', label: 'Ganhou' },
      lost: { class: 'status-lost', label: 'Perdeu' },
      cancelled: { class: 'status-cancelled', label: 'Cancelada' },
    };
    return badges[status] || { class: '', label: status };
  };

  if (loading && bets.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-bets">
      <div className="section-header">
        <h2>Gerenciar Apostas</h2>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar por ID ou usuário..."
          value={filters.search}
          onChange={(e) => {
            setFilters({ ...filters, search: e.target.value });
            setPage(1);
          }}
          className="search-input"
        />

        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="won">Ganhou</option>
          <option value="lost">Perdeu</option>
          <option value="cancelled">Cancelada</option>
        </select>

        <select
          value={filters.modality}
          onChange={(e) => {
            setFilters({ ...filters, modality: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todas as Modalidades</option>
          <option value="grupo">Grupo</option>
          <option value="milhar">Milhar</option>
          <option value="centena">Centena</option>
          <option value="dezena">Dezena</option>
        </select>
      </div>

      {bets.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma aposta encontrada.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Modalidade</th>
                  <th>Valor</th>
                  <th>Prêmio</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => {
                  const statusBadge = getStatusBadge(bet.status);
                  return (
                    <tr key={bet.id}>
                      <td>#{bet.id}</td>
                      <td>{bet.user_name || bet.user_email || 'N/A'}</td>
                      <td>{bet.modality || 'N/A'}</td>
                      <td className="amount-cell">
                        R$ {parseFloat(bet.total_value || 0).toFixed(2)}
                      </td>
                      <td className="amount-cell prize-cell">
                        R$ {parseFloat(bet.prize || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        {new Date(bet.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {bet.status === 'pending' && (
                            <button
                              className="btn-approve"
                              onClick={() => handleSettle(bet.id)}
                            >
                              Liquidar
                            </button>
                          )}
                          <button
                            className="btn-view"
                            onClick={() => setSelectedBet(bet)}
                          >
                            Ver
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
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

      {/* Modal de Detalhes */}
      {selectedBet && (
        <div className="modal-overlay" onClick={() => setSelectedBet(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes da Aposta #{selectedBet.id}</h2>
              <button className="modal-close" onClick={() => setSelectedBet(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="bet-details">
                <div className="detail-row">
                  <span>Usuário:</span>
                  <span>{selectedBet.user_name || selectedBet.user_email}</span>
                </div>
                <div className="detail-row">
                  <span>Modalidade:</span>
                  <span>{selectedBet.modality}</span>
                </div>
                <div className="detail-row">
                  <span>Valor:</span>
                  <span>R$ {parseFloat(selectedBet.total_value || 0).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>Prêmio:</span>
                  <span className="prize">R$ {parseFloat(selectedBet.prize || 0).toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span>{getStatusBadge(selectedBet.status).label}</span>
                </div>
                <div className="detail-row">
                  <span>Data:</span>
                  <span>{new Date(selectedBet.created_at).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBets;

