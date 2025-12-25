import { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    wonBets: 0,
    lostBets: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/backend/admin/reports.php?period=${period}`);
      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Administrativo</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="period-select"
        >
          <option value="today">Hoje</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
          <option value="year">Este Ano</option>
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total de Usuários</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎲</div>
          <div className="stat-info">
            <h3>Total de Apostas</h3>
            <div className="stat-value">{stats.totalBets}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total de Depósitos</h3>
            <div className="stat-value">R$ {stats.totalDeposits?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-info">
            <h3>Total de Saques</h3>
            <div className="stat-value">R$ {stats.totalWithdrawals?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Apostas Ganhas</h3>
            <div className="stat-value">{stats.wonBets}</div>
          </div>
        </div>

        <div className="stat-card error">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Apostas Perdidas</h3>
            <div className="stat-value">{stats.lostBets}</div>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Receita Total</h3>
            <div className="stat-value">R$ {stats.totalRevenue?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

