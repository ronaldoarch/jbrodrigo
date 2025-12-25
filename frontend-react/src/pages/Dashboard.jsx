import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import useBetSettlement from '../hooks/useBetSettlement';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [recentBets, setRecentBets] = useState([]);
  const [stories, setStories] = useState([]);
  const [extractions, setExtractions] = useState([]);
  const [odds, setOdds] = useState({});
  const [promotions, setPromotions] = useState([]);
  const [stats, setStats] = useState({
    totalWon: 0,
    totalBets: 0,
    totalWagered: 0,
  });
  const [loading, setLoading] = useState(true);

  // Verificação automática de liquidações
  useBetSettlement(() => {
    loadDashboard();
  });

  useEffect(() => {
    loadDashboard();
    
    // Atualizar extrações e cotações a cada 5 minutos
    const interval = setInterval(() => {
      loadExtractions();
      loadOdds();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        balanceRes,
        betsRes,
        storiesRes,
        extractionsRes,
        oddsRes,
        promotionsRes,
        statsRes,
      ] = await Promise.all([
        api.get('/backend/wallet/balance.php'),
        api.get('/backend/bets/list.php?limit=5'),
        api.get('/backend/admin/stories.php?active=1'),
        api.get('/api/extractions-list.php'),
        api.get('/backend/bets/odds.php'),
        api.get('/backend/admin/promotions.php?active=1'),
        api.get('/backend/wallet/stats.php').catch(() => ({ data: { success: false } })),
      ]);

      if (balanceRes.data.success) {
        setBalance(balanceRes.data);
      }
      if (betsRes.data.success) {
        setRecentBets(betsRes.data.bets);
      }
      if (storiesRes.data.success) {
        setStories(storiesRes.data.stories || []);
      }
      if (extractionsRes.data.success) {
        // Filtrar apenas extrações normais (não instantâneas)
        const normalExtractions = extractionsRes.data.extractions.filter(
          (e) => e.type === 'normal' && e.active
        );
        setExtractions(normalExtractions);
      }
      if (oddsRes.data.success) {
        setOdds(oddsRes.data.odds || {});
      }
      if (promotionsRes.data.success) {
        setPromotions(promotionsRes.data.promotions || []);
      }
      if (statsRes.data.success) {
        setStats({
          totalWon: statsRes.data.total_won || 0,
          totalBets: statsRes.data.total_bets || 0,
          totalWagered: statsRes.data.total_wagered || 0,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExtractions = async () => {
    try {
      const response = await api.get('/api/extractions-list.php');
      if (response.data.success) {
        const normalExtractions = response.data.extractions.filter(
          (e) => e.type === 'normal' && e.active
        );
        setExtractions(normalExtractions);
      }
    } catch (error) {
      console.error('Erro ao carregar extrações:', error);
    }
  };

  const loadOdds = async () => {
    try {
      const response = await api.get('/backend/bets/odds.php');
      if (response.data.success) {
        setOdds(response.data.odds || {});
      }
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
    }
  };

  // Animais do Jogo do Bicho (para stories)
  const animals = [
    { id: 1, name: 'Avestruz', emoji: '🐦' },
    { id: 2, name: 'Águia', emoji: '🦅' },
    { id: 3, name: 'Burro', emoji: '🫏' },
    { id: 4, name: 'Borboleta', emoji: '🦋' },
    { id: 5, name: 'Cachorro', emoji: '🐕' },
    { id: 6, name: 'Cabra', emoji: '🐐' },
    { id: 7, name: 'Carneiro', emoji: '🐑' },
    { id: 8, name: 'Camelo', emoji: '🐪' },
    { id: 9, name: 'Cobra', emoji: '🐍' },
    { id: 10, name: 'Coelho', emoji: '🐰' },
    { id: 11, name: 'Cavalo', emoji: '🐴' },
    { id: 12, name: 'Elefante', emoji: '🐘' },
    { id: 13, name: 'Galo', emoji: '🐓' },
    { id: 14, name: 'Gato', emoji: '🐱' },
    { id: 15, name: 'Jacaré', emoji: '🐊' },
    { id: 16, name: 'Leão', emoji: '🦁' },
    { id: 17, name: 'Macaco', emoji: '🐵' },
    { id: 18, name: 'Porco', emoji: '🐷' },
    { id: 19, name: 'Pavão', emoji: '🦚' },
    { id: 20, name: 'Peru', emoji: '🦃' },
    { id: 21, name: 'Touro', emoji: '🐂' },
    { id: 22, name: 'Tigre', emoji: '🐅' },
    { id: 23, name: 'Urso', emoji: '🐻' },
    { id: 24, name: 'Veado', emoji: '🦌' },
    { id: 25, name: 'Vaca', emoji: '🐄' },
  ];

  // Usar stories do backend ou animais padrão
  const displayStories = stories.length > 0 
    ? stories 
    : animals.slice(0, 8).map((animal) => ({
        id: animal.id,
        title: animal.name,
        image_url: null,
        emoji: animal.emoji,
      }));

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

        {/* Stories Section */}
        {displayStories.length > 0 && (
          <section className="stories-section">
            <div className="stories-container">
              {displayStories.map((story) => (
                <Link
                  key={story.id}
                  to={`/apostar?animal=${story.id}`}
                  className="story-item"
                >
                  <div className="story-circle">
                    {story.emoji || story.image_url ? (
                      story.image_url ? (
                        <img src={story.image_url} alt={story.title} />
                      ) : (
                        <span>{story.emoji}</span>
                      )
                    ) : (
                      <span>🎲</span>
                    )}
                  </div>
                  <span className="story-label">{story.title}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Estatísticas */}
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

          <div className="dashboard-card stats-card">
            <h2>Ganhos Totais</h2>
            <div className="balance-amount">
              R$ {stats.totalWon.toFixed(2)}
            </div>
            <div className="balance-details">
              <span>Total Apostado: R$ {stats.totalWagered.toFixed(2)}</span>
              <span>Total de Apostas: {stats.totalBets}</span>
            </div>
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

        {/* Cotações ao Vivo */}
        {Object.keys(odds).length > 0 && (
          <section className="live-odds-section">
            <h2>Cotação ao Vivo</h2>
            <div className="odds-grid">
              {Object.entries(odds).slice(0, 6).map(([key, odd]) => (
                <div key={key} className="odds-card">
                  <h3>{odd.name || key}</h3>
                  <div className="odds-value">
                    R$ {odd.multiplier?.toFixed(2) || '0.00'}
                  </div>
                  <p className="odds-description">{odd.description || ''}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Extrações Disponíveis */}
        {extractions.length > 0 && (
          <section className="extractions-section">
            <div className="section-header">
              <h2>Extrações Disponíveis</h2>
              <Link to="/apostar" className="link">
                Ver todas →
              </Link>
            </div>
            <div className="extractions-grid">
              {extractions.slice(0, 6).map((extraction) => (
                <div key={extraction.id} className="extraction-card">
                  <h3>{extraction.description}</h3>
                  <p className="game-type">{extraction.game_type || extraction.loteria}</p>
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
        )}

        {/* Promoções */}
        {promotions.length > 0 && (
          <section className="promotions-section">
            <h2>Promoções</h2>
            <div className="promotions-grid">
              {promotions.map((promo) => (
                <div key={promo.id} className="promotion-card">
                  {promo.banner_url && (
                    <img src={promo.banner_url} alt={promo.name} />
                  )}
                  <div className="promotion-content">
                    <h3>{promo.name}</h3>
                    <p>{promo.description}</p>
                    {promo.bonus_value > 0 && (
                      <div className="promotion-bonus">
                        Bônus: R$ {promo.bonus_value.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Últimas Apostas */}
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
                    <h3>{bet.game_caption || bet.game_type}</h3>
                    <p className="bet-date">
                      {new Date(bet.created_at).toLocaleString('pt-BR')}
                    </p>
                    <p className="bet-amount">
                      Valor: R$ {parseFloat(bet.total_amount || bet.amount || 0).toFixed(2)}
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
