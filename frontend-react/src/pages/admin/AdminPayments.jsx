import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayments();
  }, [page, filters]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      let url = `/backend/admin/payments.php?page=${page}&limit=20`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.type) url += `&type=${filters.type}`;

      const response = await api.get(url);
      if (response.data.success) {
        setPayments(response.data.payments || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      const response = await api.post(`/backend/admin/payments.php`, {
        action: 'approve',
        id: paymentId,
      });
      if (response.data.success) {
        loadPayments();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao aprovar pagamento');
    }
  };

  const handleReject = async (paymentId) => {
    try {
      const response = await api.post(`/backend/admin/payments.php`, {
        action: 'reject',
        id: paymentId,
      });
      if (response.data.success) {
        loadPayments();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao rejeitar pagamento');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', label: 'Pendente' },
      completed: { class: 'status-completed', label: 'Concluído' },
      failed: { class: 'status-failed', label: 'Falhou' },
      cancelled: { class: 'status-cancelled', label: 'Cancelado' },
    };
    return badges[status] || { class: '', label: status };
  };

  if (loading && payments.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-payments">
      <div className="section-header">
        <h2>Gerenciar Pagamentos</h2>
      </div>

      <div className="filters-bar">
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="completed">Concluído</option>
          <option value="failed">Falhou</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => {
            setFilters({ ...filters, type: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todos os Tipos</option>
          <option value="deposit">Depósito</option>
          <option value="withdrawal">Saque</option>
        </select>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum pagamento encontrado.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuário</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status);
                  return (
                    <tr key={payment.id}>
                      <td>#{payment.id}</td>
                      <td>{payment.user_name || payment.user_email || 'N/A'}</td>
                      <td>
                        <span className={`type-badge ${payment.type}`}>
                          {payment.type === 'deposit' ? 'Depósito' : 'Saque'}
                        </span>
                      </td>
                      <td className="amount-cell">
                        R$ {parseFloat(payment.amount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td>
                        {new Date(payment.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {payment.status === 'pending' && (
                            <>
                              <button
                                className="btn-approve"
                                onClick={() => handleApprove(payment.id)}
                              >
                                Aprovar
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleReject(payment.id)}
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                          <button
                            className="btn-view"
                            onClick={() => {
                              // Abrir modal de detalhes
                              alert(`Detalhes do pagamento #${payment.id}`);
                            }}
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
    </div>
  );
};

export default AdminPayments;

