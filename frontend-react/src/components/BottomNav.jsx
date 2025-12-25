import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Início' },
    { path: '/apostar', icon: '🎲', label: 'Apostar' },
    { path: '/minhas-apostas', icon: '📋', label: 'Apostas' },
    { path: '/carteira', icon: '💰', label: 'Carteira' },
    { path: '/resultados', icon: '📊', label: 'Resultados' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${
            location.pathname === item.path ? 'active' : ''
          }`}
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;

