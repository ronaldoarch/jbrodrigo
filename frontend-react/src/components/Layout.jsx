import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';
import './Layout.css';

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <h1>🎲 Jogo do Bicho</h1>
            </Link>
            <nav className="header-nav">
              {user ? (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/apostar">Apostar</Link>
                  <Link to="/carteira">Carteira</Link>
                  <span className="balance">
                    R$ {user.wallet?.balance?.toFixed(2) || '0.00'}
                  </span>
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

      <main className="main-content">
        <Outlet />
      </main>

      {user && <BottomNav />}

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Jogo do Bicho. Todos os direitos reservados.</p>
          <p className="warning">
            ⚠️ Jogue com responsabilidade. Apostas podem causar dependência.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

