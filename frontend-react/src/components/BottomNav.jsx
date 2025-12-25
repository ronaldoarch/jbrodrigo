import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'MENU', highlight: false },
    { path: '/inicio', icon: '🏠', label: 'MENU', highlight: false },
    { path: '/resultados', icon: '📊', label: 'RESULTADOS', highlight: false },
    { path: '/apostar', icon: '🎲', label: 'APOSTAR', highlight: true },
    { path: '/minhas-apostas', icon: '📋', label: 'APOSTAS', highlight: false },
    { path: '/carteira', icon: '💰', label: 'CARTEIRA', highlight: false },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${
            location.pathname === item.path ? 'active' : ''
          } ${item.highlight ? 'highlight' : ''}`}
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;

