import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminWithdrawalLimits.css';

const AdminWithdrawalLimits = () => {
  const [limits, setLimits] = useState({
    min_amount: 30,
    max_amount: 10000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLimits();
  }, []);

  const loadLimits = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/withdrawal-limits.php');
      if (response.data.success) {
        setLimits({
          min_amount: response.data.min_amount || 30,
          max_amount: response.data.max_amount || 10000,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar limites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/backend/admin/withdrawal-limits.php', limits);
      if (response.data.success) {
        alert('Limites de saque atualizados com sucesso!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar limites');
    } finally {
      setSaving(false);
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
    <div className="admin-withdrawal-limits">
      <h2>Limites de Saque</h2>

      <div className="settings-section">
        <div className="form-row">
          <div className="form-group">
            <label>Valor Mínimo de Saque (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={limits.min_amount}
              onChange={(e) => setLimits({ ...limits, min_amount: parseFloat(e.target.value) })}
            />
            <small>Valor mínimo que um usuário pode sacar</small>
          </div>

          <div className="form-group">
            <label>Valor Máximo de Saque (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={limits.max_amount}
              onChange={(e) => setLimits({ ...limits, max_amount: parseFloat(e.target.value) })}
            />
            <small>Valor máximo que um usuário pode sacar</small>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Limites'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalLimits;

