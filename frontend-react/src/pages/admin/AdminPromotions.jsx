import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminPromotions.css';

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_percentage: '',
    min_deposit: '',
    max_discount: '',
    start_date: '',
    end_date: '',
    active: true,
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/promotions.php');
      if (response.data.success) {
        setPromotions(response.data.promotions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar promoções:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPromotion
        ? `/backend/admin/promotions.php?id=${editingPromotion.id}`
        : '/backend/admin/promotions.php';
      const method = editingPromotion ? 'PUT' : 'POST';

      const response = await api({
        method,
        url,
        data: formData,
      });

      if (response.data.success) {
        setShowForm(false);
        setEditingPromotion(null);
        setFormData({
          title: '',
          description: '',
          discount_percentage: '',
          min_deposit: '',
          max_discount: '',
          start_date: '',
          end_date: '',
          active: true,
        });
        loadPromotions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar promoção');
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title || '',
      description: promotion.description || '',
      discount_percentage: promotion.discount_percentage || '',
      min_deposit: promotion.min_deposit || '',
      max_discount: promotion.max_discount || '',
      start_date: promotion.start_date || '',
      end_date: promotion.end_date || '',
      active: promotion.active !== undefined ? promotion.active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return;

    try {
      const response = await api.delete(`/backend/admin/promotions.php?id=${id}`);
      if (response.data.success) {
        loadPromotions();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao deletar promoção');
    }
  };

  if (loading && promotions.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-promotions">
      <div className="section-header">
        <h2>Gerenciar Promoções</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingPromotion(null);
            setFormData({
              title: '',
              description: '',
              discount_percentage: '',
              min_deposit: '',
              max_discount: '',
              start_date: '',
              end_date: '',
              active: true,
            });
          }}
        >
          + Nova Promoção
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Desconto (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Depósito Mínimo</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_deposit}
                  onChange={(e) => setFormData({ ...formData, min_deposit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Desconto Máximo</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data de Início</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Data de Término</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
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
                {editingPromotion ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingPromotion(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {promotions.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma promoção cadastrada.</p>
        </div>
      ) : (
        <div className="promotions-grid">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="promotion-card">
              <div className="promotion-header">
                <h3>{promotion.title}</h3>
                <span className={`status-badge ${promotion.active ? 'status-active' : 'status-blocked'}`}>
                  {promotion.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <p className="promotion-description">{promotion.description}</p>
              <div className="promotion-details">
                <div className="detail-item">
                  <span>Desconto:</span>
                  <span>{promotion.discount_percentage}%</span>
                </div>
                <div className="detail-item">
                  <span>Depósito Mínimo:</span>
                  <span>R$ {parseFloat(promotion.min_deposit || 0).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span>Desconto Máximo:</span>
                  <span>R$ {parseFloat(promotion.max_discount || 0).toFixed(2)}</span>
                </div>
                <div className="detail-item">
                  <span>Período:</span>
                  <span>
                    {new Date(promotion.start_date).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(promotion.end_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="promotion-actions">
                <button className="btn-view" onClick={() => handleEdit(promotion)}>
                  Editar
                </button>
                <button className="btn-reject" onClick={() => handleDelete(promotion.id)}>
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;

