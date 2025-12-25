import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let url = `/backend/admin/users.php?page=${page}&limit=20`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.role) url += `&role=${filters.role}`;
      if (filters.search) url += `&search=${filters.search}`;

      const response = await api.get(url);
      if (response.data.success) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId, block) => {
    try {
      const response = await api.post(`/backend/admin/users.php`, {
        action: block ? 'block' : 'unblock',
        id: userId,
      });
      if (response.data.success) {
        loadUsers();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="section-header">
        <h2>Gerenciar Usuários</h2>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
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
          <option value="active">Ativo</option>
          <option value="blocked">Bloqueado</option>
        </select>

        <select
          value={filters.role}
          onChange={(e) => {
            setFilters({ ...filters, role: e.target.value });
            setPage(1);
          }}
        >
          <option value="">Todos os Perfis</option>
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>CPF</th>
                  <th>Saldo</th>
                  <th>Status</th>
                  <th>Perfil</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.cpf || 'N/A'}</td>
                    <td className="amount-cell">
                      R$ {parseFloat(user.balance || 0).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.status === 'active' ? 'status-active' : 'status-blocked'
                        }`}
                      >
                        {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>
                    <td>
                      <span className={`role-badge ${user.is_admin ? 'role-admin' : 'role-user'}`}>
                        {user.is_admin ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleEdit(user)}
                        >
                          Editar
                        </button>
                        <button
                          className={user.status === 'active' ? 'btn-reject' : 'btn-approve'}
                          onClick={() => handleBlock(user.id, user.status === 'active')}
                        >
                          {user.status === 'active' ? 'Bloquear' : 'Desbloquear'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Modal de Edição */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Usuário</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Modal de edição em desenvolvimento</p>
              <p>Usuário: {selectedUser.name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

