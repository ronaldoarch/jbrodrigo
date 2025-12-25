import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminExtractions.css';

const AdminExtractions = () => {
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExtraction, setEditingExtraction] = useState(null);
  const [formData, setFormData] = useState({
    loteria: '',
    description: '',
    real_close_time: '',
    close_time: '',
    days: [],
    p_maximo: '',
    active: true,
  });

  const daysOptions = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

  useEffect(() => {
    loadExtractions();
  }, []);

  const loadExtractions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/extractions.php');
      if (response.data.success) {
        setExtractions(response.data.extractions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar extrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter((d) => d !== day)
        : [...formData.days, day],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingExtraction
        ? `/backend/admin/extractions.php?id=${editingExtraction.id}`
        : '/backend/admin/extractions.php';
      const method = editingExtraction ? 'PUT' : 'POST';

      const response = await api({
        method,
        url,
        data: {
          ...formData,
          days: JSON.stringify(formData.days),
        },
      });

      if (response.data.success) {
        setShowForm(false);
        setEditingExtraction(null);
        setFormData({
          loteria: '',
          description: '',
          real_close_time: '',
          close_time: '',
          days: [],
          p_maximo: '',
          active: true,
        });
        loadExtractions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar extração');
    }
  };

  const handleEdit = (extraction) => {
    setEditingExtraction(extraction);
    setFormData({
      loteria: extraction.loteria || '',
      description: extraction.description || '',
      real_close_time: extraction.real_close_time || '',
      close_time: extraction.close_time || '',
      days: typeof extraction.days === 'string' 
        ? JSON.parse(extraction.days) 
        : extraction.days || [],
      p_maximo: extraction.p_maximo || '',
      active: extraction.active !== undefined ? extraction.active : true,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await api.post(`/backend/admin/extractions.php`, {
        action: 'toggle',
        id,
        active: !currentStatus,
      });
      if (response.data.success) {
        loadExtractions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleSyncWhitelist = async () => {
    if (!confirm('Sincronizar com Whitelist? Isso pode alterar extrações existentes.')) return;

    try {
      const response = await api.post('/backend/admin/extractions.php', {
        action: 'sync_whitelist',
      });
      if (response.data.success) {
        alert('Sincronização concluída!');
        loadExtractions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao sincronizar');
    }
  };

  const handleFetchTimes = async () => {
    try {
      const response = await api.post('/backend/admin/extractions.php', {
        action: 'fetch_times',
      });
      if (response.data.success) {
        alert('Horários atualizados!');
        loadExtractions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao buscar horários');
    }
  };

  if (loading && extractions.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-extractions">
      <div className="section-header">
        <h2>Gerenciar Extrações</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleSyncWhitelist}>
            Sincronizar Whitelist
          </button>
          <button className="btn btn-secondary" onClick={handleFetchTimes}>
            Buscar Horários
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setEditingExtraction(null);
              setFormData({
                loteria: '',
                description: '',
                real_close_time: '',
                close_time: '',
                days: [],
                p_maximo: '',
                active: true,
              });
            }}
          >
            + Nova Extração
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingExtraction ? 'Editar Extração' : 'Nova Extração'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Loteria</label>
                <select
                  value={formData.loteria}
                  onChange={(e) => setFormData({ ...formData, loteria: e.target.value })}
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
                <label>Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: LOTEP 15:45"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Horário Real do Sorteio</label>
                <input
                  type="time"
                  value={formData.real_close_time}
                  onChange={(e) => setFormData({ ...formData, real_close_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Horário de Fechamento</label>
                <input
                  type="time"
                  value={formData.close_time}
                  onChange={(e) => setFormData({ ...formData, close_time: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Prêmio Máximo</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.p_maximo}
                  onChange={(e) => setFormData({ ...formData, p_maximo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dias da Semana</label>
              <div className="days-checkboxes">
                {daysOptions.map((day) => (
                  <label key={day} className="day-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.days.includes(day)}
                      onChange={() => handleDayToggle(day)}
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
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
                {editingExtraction ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingExtraction(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {extractions.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma extração cadastrada.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Loteria</th>
                <th>Descrição</th>
                <th>Horário Real</th>
                <th>Fechamento</th>
                <th>Dias</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {extractions.map((extraction) => {
                const days = typeof extraction.days === 'string' 
                  ? JSON.parse(extraction.days) 
                  : extraction.days || [];
                return (
                  <tr key={extraction.id}>
                    <td>#{extraction.id}</td>
                    <td>{extraction.loteria}</td>
                    <td>{extraction.description}</td>
                    <td>{extraction.real_close_time}</td>
                    <td>{extraction.close_time}</td>
                    <td>
                      <div className="days-badge">
                        {days.map((day) => (
                          <span key={day} className="day-tag">{day}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${extraction.active ? 'status-active' : 'status-blocked'}`}>
                        {extraction.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-view" onClick={() => handleEdit(extraction)}>
                          Editar
                        </button>
                        <button
                          className={extraction.active ? 'btn-reject' : 'btn-approve'}
                          onClick={() => handleToggleActive(extraction.id, extraction.active)}
                        >
                          {extraction.active ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminExtractions;

