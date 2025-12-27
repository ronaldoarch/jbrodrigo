import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';
import Carousel from './Carousel';
import SupportButton from './SupportButton';
import FacebookPixel from './FacebookPixel';
import api from '../services/api';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [banners, setBanners] = useState([]);
  const [showHero, setShowHero] = useState(false);

  useEffect(() => {
    // Mostrar hero banner apenas em páginas específicas
    const heroPages = ['/dashboard', '/inicio', '/', '/apostar'];
    setShowHero(heroPages.includes(location.pathname));
    
    if (showHero) {
      loadBanners();
    }
  }, [location.pathname, showHero]);

  const loadBanners = async () => {
    try {
      const response = await api.get('/api/banners.php?position=hero');
      if (response.data.success) {
        setBanners(response.data.banners);
      }
    } catch (error) {
      console.debug('Erro ao carregar banners:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <FacebookPixel />
      <div className="layout">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <Link to="/" className="logo">
                <span className="icon">🎲</span>
                <h1>Tradição do Bicho</h1>
              </Link>
              <nav className="header-nav">
                {user ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className={isActive('/dashboard') || isActive('/inicio') ? 'active' : ''}
                    >
                      Início
                    </Link>
                    <Link 
                      to="/apostar" 
                      className={isActive('/apostar') ? 'active' : ''}
                    >
                      Apostar
                    </Link>
                    <Link 
                      to="/resultados" 
                      className={isActive('/resultados') ? 'active' : ''}
                    >
                      Resultados
                    </Link>
                    <Link 
                      to="/carteira" 
                      className={isActive('/carteira') ? 'active' : ''}
                    >
                      Carteira
                    </Link>
                    <Link 
                      to="/bingo" 
                      className={isActive('/bingo') ? 'active' : ''}
                    >
                      Bingo
                    </Link>
                    {user.is_admin && (
                      <Link 
                        to="/admin" 
                        className={isActive('/admin') ? 'active' : ''}
                      >
                        Admin
                      </Link>
                    )}
                    <span className="balance">
                      R$ {user.wallet?.balance !== undefined && typeof user.wallet.balance === 'number' 
                        ? user.wallet.balance.toFixed(2) 
                        : (user.wallet?.balance ? parseFloat(user.wallet.balance).toFixed(2) : '0.00')}
                    </span>
                    <button 
                      onClick={logout} 
                      className="btn btn-secondary"
                      style={{ marginLeft: '12px' }}
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Entrar
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </header>

        {showHero && banners.length > 0 && (
          <div className="hero-banner-container">
            <Carousel banners={banners} />
          </div>
        )}

        <main className="main-content">
          <Outlet />
        </main>

        {user && <BottomNav />}
        <SupportButton />

        <footer className="footer">
          <div className="container">
            <p>&copy; 2024 Tradição do Bicho. Todos os direitos reservados.</p>
            <p className="warning">
              ⚠️ Jogue com responsabilidade. Apostas podem causar dependência.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;

