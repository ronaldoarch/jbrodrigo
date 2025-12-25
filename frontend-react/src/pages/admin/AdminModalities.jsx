import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminModalities.css';

const AdminModalities = () => {
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const modalityGroups = {
    grupos: [
      { id: 'grupo', name: 'Grupo', active: false },
      { id: 'dupla-grupo', name: 'Dupla de Grupo', active: false },
      { id: 'terno-grupo', name: 'Terno de Grupo', active: false },
      { id: 'quadra-grupo', name: 'Quadra de Grupo', active: false },
    ],
    dezenas: [
      { id: 'dezena', name: 'Dezena', active: false },
      { id: 'dezena-invertida', name: 'Dezena Invertida', active: false },
      { id: 'duque-dezena', name: 'Duque de Dezena', active: false },
      { id: 'terno-dezena', name: 'Terno de Dezena', active: false },
    ],
    centenas: [
      { id: 'centena', name: 'Centena', active: false },
      { id: 'centena-invertida', name: 'Centena Invertida', active: false },
    ],
    milhares: [
      { id: 'milhar', name: 'Milhar', active: false },
      { id: 'milhar-invertida', name: 'Milhar Invertida', active: false },
      { id: 'milhar-centena', name: 'Milhar/Centena', active: false },
    ],
    passe: [
      { id: 'passe-vai-1-2', name: 'Passe Vai', active: false },
      { id: 'passe-vai-vem-1-2', name: 'Passe Vai e Vem', active: false },
    ],
  };

  useEffect(() => {
    loadModalities();
  }, []);

  const loadModalities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/modalities.php');
      if (response.data.success) {
        const loadedModalities = response.data.modalities || {};
        
        // Atualizar estados ativos
        Object.keys(modalityGroups).forEach((groupKey) => {
          modalityGroups[groupKey].forEach((mod) => {
            mod.active = loadedModalities[mod.id] || false;
          });
        });
        
        setModalities(loadedModalities);
      }
    } catch (error) {
      console.error('Erro ao carregar modalidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (modalityId) => {
    const newState = { ...modalities };
    newState[modalityId] = !newState[modalityId];
    setModalities(newState);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.post('/backend/admin/modalities.php', {
        modalities,
      });
      if (response.data.success) {
        alert('Modalidades atualizadas com sucesso!');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar modalidades');
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
    <div className="admin-modalities">
      <div className="section-header">
        <h2>Ativar/Desativar Modalidades</h2>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="modalities-grid">
        {Object.entries(modalityGroups).map(([groupKey, groupModalities]) => (
          <div key={groupKey} className="modality-group">
            <h3 className="group-title">
              {groupKey === 'grupos' && 'Grupos'}
              {groupKey === 'dezenas' && 'Dezenas'}
              {groupKey === 'centenas' && 'Centenas'}
              {groupKey === 'milhares' && 'Milhares'}
              {groupKey === 'passe' && 'Passe'}
            </h3>
            <div className="modalities-list">
              {groupModalities.map((mod) => (
                <label key={mod.id} className="modality-item">
                  <input
                    type="checkbox"
                    checked={modalities[mod.id] || false}
                    onChange={() => handleToggle(mod.id)}
                  />
                  <span className="modality-name">{mod.name}</span>
                  <span className={`modality-status ${modalities[mod.id] ? 'active' : 'inactive'}`}>
                    {modalities[mod.id] ? 'Ativo' : 'Inativo'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminModalities;

