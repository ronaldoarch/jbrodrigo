import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminFacebookPixel.css';

const AdminFacebookPixel = () => {
  const [pixelId, setPixelId] = useState('');
  const [events, setEvents] = useState({
    lead: false,
    deposit_complete: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPixelConfig();
  }, []);

  const loadPixelConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/facebook-pixel.php');
      if (response.data.success) {
        setPixelId(response.data.pixel_id || '');
        setEvents(response.data.events || {
          lead: false,
          deposit_complete: false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do Pixel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/backend/admin/facebook-pixel.php', {
        pixel_id: pixelId,
        events,
      });
      if (response.data.success) {
        alert('Configuração do Facebook Pixel salva com sucesso!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar configuração');
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
    <div className="admin-facebook-pixel">
      <h2>Configuração do Facebook Pixel</h2>

      <div className="settings-section">
        <div className="form-group">
          <label>Pixel ID</label>
          <input
            type="text"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="123456789012345"
          />
          <small>Digite o ID do seu Facebook Pixel</small>
        </div>

        <div className="form-group">
          <label>Eventos Pré-cadastrados</label>
          <div className="events-list">
            <label className="event-item">
              <input
                type="checkbox"
                checked={events.lead}
                onChange={(e) => setEvents({ ...events, lead: e.target.checked })}
              />
              <div className="event-info">
                <span className="event-name">Lead (Cadastro)</span>
                <span className="event-description">
                  Dispara quando um usuário se cadastra
                </span>
              </div>
            </label>

            <label className="event-item">
              <input
                type="checkbox"
                checked={events.deposit_complete}
                onChange={(e) => setEvents({ ...events, deposit_complete: e.target.checked })}
              />
              <div className="event-info">
                <span className="event-name">Depósito Completo</span>
                <span className="event-description">
                  Dispara quando um depósito é confirmado
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Configuração'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFacebookPixel;

