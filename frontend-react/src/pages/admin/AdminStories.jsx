import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminStories.css';

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 1,
    active: true,
  });

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backend/admin/stories.php');
      if (response.data.success) {
        setStories(response.data.stories || []);
      }
    } catch (error) {
      console.error('Erro ao carregar stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingStory
        ? `/backend/admin/stories.php?id=${editingStory.id}`
        : '/backend/admin/stories.php';
      const method = editingStory ? 'PUT' : 'POST';

      const response = await api({
        method,
        url,
        data: formData,
      });

      if (response.data.success) {
        setShowForm(false);
        setEditingStory(null);
        setFormData({
          title: '',
          image_url: '',
          link_url: '',
          position: 1,
          active: true,
        });
        loadStories();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao salvar story');
    }
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setFormData({
      title: story.title || '',
      image_url: story.image_url || '',
      link_url: story.link_url || '',
      position: story.position || 1,
      active: story.active !== undefined ? story.active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este story?')) return;

    try {
      const response = await api.delete(`/backend/admin/stories.php?id=${id}`);
      if (response.data.success) {
        loadStories();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao deletar story');
    }
  };

  if (loading && stories.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-stories">
      <div className="section-header">
        <h2>Gerenciar Stories</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(true);
            setEditingStory(null);
            setFormData({
              title: '',
              image_url: '',
              link_url: '',
              position: 1,
              active: true,
            });
          }}
        >
          + Novo Story
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editingStory ? 'Editar Story' : 'Novo Story'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Promoção Especial"
                required
              />
            </div>

            <div className="form-group">
              <label>URL da Imagem</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                required
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="image-preview" />
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>URL do Link</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://exemplo.com/promocao"
                />
              </div>

              <div className="form-group">
                <label>Posição</label>
                <input
                  type="number"
                  min="1"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
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
                {editingStory ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingStory(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {stories.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum story cadastrado.</p>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map((story) => (
            <div key={story.id} className="story-card">
              <div className="story-image">
                <img src={story.image_url} alt={story.title} />
                <span className={`status-badge ${story.active ? 'status-active' : 'status-blocked'}`}>
                  {story.active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="story-info">
                <h3>{story.title}</h3>
                <p className="story-position">Posição: {story.position}</p>
                {story.link_url && (
                  <a href={story.link_url} target="_blank" rel="noopener noreferrer" className="story-link">
                    Ver Link →
                  </a>
                )}
              </div>
              <div className="story-actions">
                <button className="btn-view" onClick={() => handleEdit(story)}>
                  Editar
                </button>
                <button className="btn-reject" onClick={() => handleDelete(story.id)}>
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

export default AdminStories;

