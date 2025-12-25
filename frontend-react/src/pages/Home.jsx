import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Carousel from '../components/Carousel';
import './Home.css';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [extractions, setExtractions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirecionar para dashboard se autenticado
    if (!authLoading && user) {
      navigate('/dashboard'); // ou '/inicio'
      return;
    }
    loadData();
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    try {
      const [extractionsRes, bannersRes] = await Promise.all([
        api.get('/api/extractions-list.php'),
        api.get('/api/banners.php?position=home'),
      ]);

      if (extractionsRes.data.success) {
        setExtractions(extractionsRes.data.extractions);
      }
      if (bannersRes.data.success) {
        setBanners(bannersRes.data.banners);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Não mostrar conteúdo se usuário está autenticado (será redirecionado)
  if (user) {
    return null;
  }

  return (
    <div className="home">
      <div className="container">
        {banners.length > 0 && <Carousel banners={banners} />}

        <section className="hero">
          <h1>Bem-vindo ao Jogo do Bicho</h1>
          <p>A melhor plataforma para suas apostas</p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary">
              Entrar
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Cadastrar
            </Link>
          </div>
        </section>

        <section className="extractions-preview">
          <h2>Próximos Sorteios</h2>
          <div className="extractions-grid">
            {extractions
              .filter((e) => e.type === 'normal')
              .slice(0, 6)
              .map((extraction) => (
                <div key={extraction.id} className="extraction-card">
                  <h3>{extraction.description}</h3>
                  <p className="game-type">{extraction.game_type}</p>
                  <p className="close-time">
                    Fecha às {extraction.close_time}
                  </p>
                  <Link
                    to={`/apostar?extraction=${extraction.id}`}
                    className="btn btn-primary"
                  >
                    Apostar
                  </Link>
                </div>
              ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;

