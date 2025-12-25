import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Verificar se é admin
  useEffect(() => {
    if (user && !user.is_admin) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  if (!user || !user.is_admin) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const menuItems = [
    {
      category: 'Principal',
      items: [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
      ],
    },
    {
      category: 'Financeiro',
      items: [
        { id: 'payments', icon: '💰', label: 'Pagamentos' },
        { id: 'withdrawal-limits', icon: '💵', label: 'Limites de Saque' },
      ],
    },
    {
      category: 'Usuários e Apostas',
      items: [
        { id: 'users', icon: '👥', label: 'Usuários' },
        { id: 'bets', icon: '🎲', label: 'Apostas' },
      ],
    },
    {
      category: 'Configurações de Jogo',
      items: [
        { id: 'odds', icon: '📈', label: 'Cotações' },
        { id: 'extractions', icon: '🎯', label: 'Extrações' },
        { id: 'modalities', icon: '🎮', label: 'Modalidades' },
      ],
    },
    {
      category: 'Marketing',
      items: [
        { id: 'promotions', icon: '🎁', label: 'Promoções' },
        { id: 'stories', icon: '📸', label: 'Stories' },
        { id: 'facebook-pixel', icon: '📱', label: 'Facebook Pixel' },
      ],
    },
    {
      category: 'Sistema',
      items: [
        { id: 'settings', icon: '⚙️', label: 'Configurações' },
      ],
    },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2>Admin</h2>}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((category) => (
            <div key={category.category} className="nav-category">
              {sidebarOpen && (
                <div className="category-title">{category.category}</div>
              )}
              {category.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                  title={sidebarOpen ? '' : item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {sidebarOpen && <span className="nav-label">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="admin-header">
          <h1>
            {menuItems
              .flatMap((c) => c.items)
              .find((i) => i.id === activeSection)?.label || 'Admin'}
          </h1>
        </div>

        <div className="admin-section-content">
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'payments' && <AdminPayments />}
          {activeSection === 'users' && <AdminUsers />}
          {activeSection === 'odds' && <AdminOdds />}
          {activeSection === 'bets' && <AdminBets />}
          {activeSection === 'extractions' && <AdminExtractions />}
          {activeSection === 'promotions' && <AdminPromotions />}
          {activeSection === 'stories' && <AdminStories />}
          {activeSection === 'settings' && <AdminSettings />}
          {activeSection === 'modalities' && <AdminModalities />}
          {activeSection === 'facebook-pixel' && <AdminFacebookPixel />}
          {activeSection === 'withdrawal-limits' && <AdminWithdrawalLimits />}
        </div>
      </main>
    </div>
  );
};

// Componentes das seções (placeholders por enquanto)
const AdminDashboard = () => (
  <div className="admin-section">
    <p>Dashboard Admin - Em desenvolvimento</p>
  </div>
);

const AdminPayments = () => (
  <div className="admin-section">
    <p>Pagamentos Admin - Em desenvolvimento</p>
  </div>
);

const AdminUsers = () => (
  <div className="admin-section">
    <p>Usuários Admin - Em desenvolvimento</p>
  </div>
);

const AdminOdds = () => (
  <div className="admin-section">
    <p>Cotações Admin - Em desenvolvimento</p>
  </div>
);

const AdminBets = () => (
  <div className="admin-section">
    <p>Apostas Admin - Em desenvolvimento</p>
  </div>
);

const AdminExtractions = () => (
  <div className="admin-section">
    <p>Extrações Admin - Em desenvolvimento</p>
  </div>
);

const AdminPromotions = () => (
  <div className="admin-section">
    <p>Promoções Admin - Em desenvolvimento</p>
  </div>
);

const AdminStories = () => (
  <div className="admin-section">
    <p>Stories Admin - Em desenvolvimento</p>
  </div>
);

const AdminSettings = () => (
  <div className="admin-section">
    <p>Configurações Admin - Em desenvolvimento</p>
  </div>
);

const AdminModalities = () => (
  <div className="admin-section">
    <p>Modalidades Admin - Em desenvolvimento</p>
  </div>
);

const AdminFacebookPixel = () => (
  <div className="admin-section">
    <p>Facebook Pixel Admin - Em desenvolvimento</p>
  </div>
);

const AdminWithdrawalLimits = () => (
  <div className="admin-section">
    <p>Limites de Saque Admin - Em desenvolvimento</p>
  </div>
);

export default Admin;

