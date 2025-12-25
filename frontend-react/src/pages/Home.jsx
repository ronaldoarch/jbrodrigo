import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Carousel from '../components/Carousel';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const [extractions, setExtractions] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="container">
        {banners.length > 0 && <Carousel banners={banners} />}

        <section className="hero">
          <h1>Bem-vindo ao Jogo do Bicho</h1>
          <p>Aposte e ganhe com os melhores resultados!</p>
          {!user && (
            <div className="hero-actions">
              <Link to="/login" className="btn btn-primary">
                Criar Conta
              </Link>
              <Link to="/resultados" className="btn btn-secondary">
                Ver Resultados
              </Link>
            </div>
          )}
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
                  {user && (
                    <Link
                      to={`/apostar?extraction=${extraction.id}`}
                      className="btn btn-primary"
                    >
                      Apostar
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </section>

        {user && (
          <section className="quick-actions">
            <h2>Ações Rápidas</h2>
            <div className="actions-grid">
              <Link to="/apostar" className="action-card">
                <span className="icon">🎲</span>
                <h3>Apostar Agora</h3>
                <p>Faça sua aposta instantânea</p>
              </Link>
              <Link to="/carteira" className="action-card">
                <span className="icon">💰</span>
                <h3>Minha Carteira</h3>
                <p>Deposite e saque</p>
              </Link>
              <Link to="/minhas-apostas" className="action-card">
                <span className="icon">📋</span>
                <h3>Minhas Apostas</h3>
                <p>Veja suas apostas</p>
              </Link>
              <Link to="/resultados" className="action-card">
                <span className="icon">📊</span>
                <h3>Resultados</h3>
                <p>Veja os últimos resultados</p>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;

