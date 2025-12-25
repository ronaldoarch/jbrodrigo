import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminSettings.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    whatsapp_number: '',
    cashtime_api_key: '',
    cashtime_client_id: '',
    cashtime_client_secret: '',
    cashtime_redirect_uri: '',
    vizzionpay_client_id: '',
    vizzionpay_client_secret: '',
    vizzionpay_api_url: '',
  });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);

  useEffect(() => {
    loadSettings();
    loadBanners();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/backend/admin/settings.php');
      if (response.data.success) {
        setSettings(response.data.settings || settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBanners = async () => {
    try {
      const response = await api.get('/backend/admin/banners.php');
      if (response.data.success) {
        setBanners(response.data.banners || []);
      }
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await api.post('/backend/admin/settings.php', settings);
      if (response.data.success) {
        alert('Configurações salvas com sucesso!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar configurações');
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
    <div className="admin-settings">
      <h2>Configurações do Sistema</h2>

      {/* Integrações de Pagamento */}
      <div className="settings-section">
        <h3>Integrações de Pagamento</h3>
        
        <div className="form-group">
          <label>Cashtime API Key</label>
          <input
            type="text"
            value={settings.cashtime_api_key}
            onChange={(e) => setSettings({ ...settings, cashtime_api_key: e.target.value })}
            placeholder="API Key do Cashtime"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cashtime Client ID</label>
            <input
              type="text"
              value={settings.cashtime_client_id}
              onChange={(e) => setSettings({ ...settings, cashtime_client_id: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Cashtime Client Secret</label>
            <input
              type="password"
              value={settings.cashtime_client_secret}
              onChange={(e) => setSettings({ ...settings, cashtime_client_secret: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Cashtime Redirect URI</label>
          <input
            type="text"
            value={settings.cashtime_redirect_uri}
            onChange={(e) => setSettings({ ...settings, cashtime_redirect_uri: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>VizzionPay Client ID</label>
            <input
              type="text"
              value={settings.vizzionpay_client_id}
              onChange={(e) => setSettings({ ...settings, vizzionpay_client_id: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>VizzionPay Client Secret</label>
            <input
              type="password"
              value={settings.vizzionpay_client_secret}
              onChange={(e) => setSettings({ ...settings, vizzionpay_client_secret: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>VizzionPay API URL</label>
          <input
            type="text"
            value={settings.vizzionpay_api_url}
            onChange={(e) => setSettings({ ...settings, vizzionpay_api_url: e.target.value })}
          />
        </div>
      </div>

      {/* Configurações do Site */}
      <div className="settings-section">
        <h3>Configurações do Site</h3>
        
        <div className="form-group">
          <label>Número do WhatsApp</label>
          <input
            type="text"
            value={settings.whatsapp_number}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
            placeholder="5511999999999"
          />
        </div>
      </div>

      {/* Banners */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Banners</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowBannerForm(true)}
          >
            + Novo Banner
          </button>
        </div>

        {banners.length === 0 ? (
          <p className="empty-note">Nenhum banner cadastrado.</p>
        ) : (
          <div className="banners-list">
            {banners.map((banner) => (
              <div key={banner.id} className="banner-item">
                <img src={banner.image_url} alt={banner.title} />
                <div className="banner-info">
                  <h4>{banner.title}</h4>
                  <p>{banner.description}</p>
                  <span className="banner-position">Posição: {banner.position}</span>
                </div>
                <div className="banner-actions">
                  <button className="btn-view">Editar</button>
                  <button className="btn-reject">Deletar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="settings-actions">
        <button
          className="btn btn-primary"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;

