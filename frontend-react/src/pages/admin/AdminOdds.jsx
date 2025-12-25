import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminOdds.css';

const AdminOdds = () => {
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOdd, setEditingOdd] = useState(null);
  const [formData, setFormData] = useState({
    game_type: '',
    bet_type: '',
    position: '',
    multiplier: '',
    min_bet: '',
    max_bet: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    loadOdds();
  }, []);

  const loadOdds = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/odds.php');
      if (response.data.success) {
        setOdds(response.data.odds || []);
      }
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingOdd
        ? `/backend/admin/odds.php?id=${editingOdd.id}`
        : '/backend/admin/odds.php';
      const method = editingOdd ? 'PUT' : 'POST';

      const response = await api({
        method,
        url,
        data: formData,
      });

      if (response.data.success) {
        setShowForm(false);
        setEditingOdd(null);
        setFormData({
          game_type: '',
          bet_type: '',
          position: '',
          multiplier: '',
          min_bet: '',
          max_bet: '',
          description: '',
          active: true,
        });
        loadOdds();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar cotação');
    }
  };

  const handleEdit = (odd) => {
    setEditingOdd(odd);
    setFormData({
      game_type: odd.game_type || '',
      bet_type: odd.bet_type || '',
      position: odd.position || '',
      multiplier: odd.multiplier || '',
      min_bet: odd.min_bet || '',
      max_bet: odd.max_bet || '',
      description: odd.description || '',
      active: odd.active !== undefined ? odd.active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta cotação?')) return;

    try {
      const response = await api.delete(`/backend/admin/odds.php?id=${id}`);
      if (response.data.success) {
        loadOdds();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao deletar cotação');
    }
  };

  if (loading && odds.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-odds">
      <div className="section-header">
        <h2>Gerenciar Cotações</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingOdd(null);
            setFormData({
              game_type: '',
              bet_type: '',
              position: '',
              multiplier: '',
              min_bet: '',
              max_bet: '',
              description: '',
              active: true,
            });
          }}
        >
          + Nova Cotação
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingOdd ? 'Editar Cotação' : 'Nova Cotação'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Game Type</label>
                <select
                  value={formData.game_type}
                  onChange={(e) => setFormData({ ...formData, game_type: e.target.value })}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="PT SP">PT SP</option>
                  <option value="PT RIO">PT RIO</option>
                  <option value="LOOK">LOOK</option>
                  <option value="LOTEP">LOTEP</option>
                  <option value="LOTECE">LOTECE</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bet Type</label>
                <select
                  value={formData.bet_type}
                  onChange={(e) => setFormData({ ...formData, bet_type: e.target.value })}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="grupo">Grupo</option>
                  <option value="milhar">Milhar</option>
                  <option value="centena">Centena</option>
                  <option value="dezena">Dezena</option>
                </select>
              </div>

              <div className="form-group">
                <label>Posição</label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Multiplicador</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.multiplier}
                  onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Aposta Mínima</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.min_bet}
                  onChange={(e) => setFormData({ ...formData, min_bet: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Aposta Máxima</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.max_bet}
                  onChange={(e) => setFormData({ ...formData, max_bet: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                Ativo
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingOdd ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingOdd(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {odds.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma cotação cadastrada.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Game Type</th>
                <th>Bet Type</th>
                <th>Posição</th>
                <th>Multiplicador</th>
                <th>Min/Max</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {odds.map((odd) => (
                <tr key={odd.id}>
                  <td>#{odd.id}</td>
                  <td>{odd.game_type}</td>
                  <td>{odd.bet_type}</td>
                  <td>{odd.position}</td>
                  <td className="amount-cell">{odd.multiplier}x</td>
                  <td>
                    R$ {parseFloat(odd.min_bet || 0).toFixed(2)} / R${' '}
                    {parseFloat(odd.max_bet || 0).toFixed(2)}
                  </td>
                  <td>
                    <span className={`status-badge ${odd.active ? 'status-active' : 'status-blocked'}`}>
                      {odd.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" onClick={() => handleEdit(odd)}>
                        Editar
                      </button>
                      <button className="btn-reject" onClick={() => handleDelete(odd.id)}>
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOdds;

