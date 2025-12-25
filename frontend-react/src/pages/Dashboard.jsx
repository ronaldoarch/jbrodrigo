import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, checkAuth } = useAuth();
  const [balance, setBalance] = useState(null);
  const [recentBets, setRecentBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [balanceRes, betsRes] = await Promise.all([
        api.get('/backend/wallet/balance.php'),
        api.get('/backend/bets/list.php?limit=5'),
      ]);

      if (balanceRes.data.success) {
        setBalance(balanceRes.data);
      }
      if (betsRes.data.success) {
        setRecentBets(betsRes.data.bets);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
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
    <div className="dashboard">
      <div className="container">
        <h1>Dashboard</h1>
        <p className="welcome">Bem-vindo, {user?.name}!</p>

        <div className="dashboard-grid">
          <div className="dashboard-card balance-card">
            <h2>Saldo Disponível</h2>
            <div className="balance-amount">
              R$ {balance?.total_balance?.toFixed(2) || '0.00'}
            </div>
            <div className="balance-details">
              <span>Principal: R$ {balance?.balance?.toFixed(2) || '0.00'}</span>
              {balance?.bonus_balance > 0 && (
                <span>Bônus: R$ {balance?.bonus_balance?.toFixed(2)}</span>
              )}
            </div>
            <Link to="/carteira" className="btn btn-primary">
              Ver Carteira
            </Link>
          </div>

          <div className="dashboard-card quick-actions-card">
            <h2>Ações Rápidas</h2>
            <div className="quick-actions-list">
              <Link to="/apostar" className="quick-action">
                <span className="icon">🎲</span>
                <span>Apostar</span>
              </Link>
              <Link to="/carteira" className="quick-action">
                <span className="icon">💰</span>
                <span>Depositar</span>
              </Link>
              <Link to="/resultados" className="quick-action">
                <span className="icon">📊</span>
                <span>Resultados</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="recent-bets">
          <div className="section-header">
            <h2>Suas Últimas Apostas</h2>
            <Link to="/minhas-apostas" className="link">
              Ver todas →
            </Link>
          </div>

          {recentBets.length === 0 ? (
            <div className="empty-state">
              <p>Você ainda não fez nenhuma aposta.</p>
              <Link to="/apostar" className="btn btn-primary">
                Fazer Primeira Aposta
              </Link>
            </div>
          ) : (
            <div className="bets-list">
              {recentBets.map((bet) => (
                <div key={bet.id} className="bet-item">
                  <div className="bet-info">
                    <h3>{bet.game_type}</h3>
                    <p className="bet-date">
                      {new Date(bet.created_at).toLocaleString('pt-BR')}
                    </p>
                    <p className="bet-amount">
                      Valor: R$ {parseFloat(bet.total_amount).toFixed(2)}
                    </p>
                  </div>
                  <div className="bet-status">
                    <span className={`status-badge status-${bet.status}`}>
                      {bet.status === 'pending' && 'Pendente'}
                      {bet.status === 'settled_won' && 'Ganhou'}
                      {bet.status === 'settled_lost' && 'Perdeu'}
                      {bet.status === 'settling' && 'Liquidando'}
                    </span>
                    {bet.prize_amount > 0 && (
                      <p className="prize-amount">
                        Prêmio: R$ {parseFloat(bet.prize_amount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

