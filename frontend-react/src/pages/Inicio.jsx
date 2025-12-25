import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import useBetSettlement from '../hooks/useBetSettlement';
import Carousel from '../components/Carousel';
import './Inicio.css';

const Inicio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [banners, setBanners] = useState([]);
  const [odds, setOdds] = useState({});
  const [loading, setLoading] = useState(true);

  // Verificação automática de liquidações
  useBetSettlement(() => {
    loadBalance();
  });

  useEffect(() => {
    loadInicio();
    
    // Atualizar cotações a cada 5 minutos
    const interval = setInterval(() => {
      loadOdds();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadInicio = async () => {
    try {
      const [bannersRes, oddsRes, balanceRes] = await Promise.all([
        api.get('/api/banners.php?position=home'),
        api.get('/backend/bets/odds.php'),
        api.get('/backend/wallet/balance.php'),
      ]);

      if (bannersRes.data.success) {
        setBanners(bannersRes.data.banners || []);
      }
      if (oddsRes.data.success) {
        setOdds(oddsRes.data.odds || {});
      }
      if (balanceRes.data.success) {
        setBalance(balanceRes.data);
      }
    } catch (error) {
      console.error('Erro ao carregar início:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const response = await api.get('/backend/wallet/balance.php');
      if (response.data.success) {
        setBalance(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
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

  // Modalidades destacadas para a seção de cotações (baseado na imagem)
  // Nota: "Quina de Grupo" (5) não existe no backend, usando "Terno de Grupo" como alternativa
  const featuredModalities = [
    { key: 'terno-grupo', name: 'Terno de Grupo', number: 5, defaultMultiplier: 150 }, // Substituindo Quina
    { key: 'milhar-centena', name: 'Milhar/Centena', number: 9, defaultMultiplier: 3300 },
    { key: 'milhar-invertida', name: 'Milhar Invertida', number: 12, defaultMultiplier: 6000 },
    { key: 'milhar', name: 'Milhar', number: 8, defaultMultiplier: 6000 },
    { key: 'terno-dezena', name: 'Terno de Dezena', number: 14, defaultMultiplier: 3500 },
    { key: 'quadra-grupo', name: 'Quadra de Grupo', number: 4, defaultMultiplier: 1000 },
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="inicio">
      {/* Carrossel de Banners */}
      <div className="hero-section">
        <Carousel banners={banners} />
      </div>

      <div className="container">
        {/* Seção de Boas-vindas */}
        <section className="welcome-section">
          <h1 className="welcome-title">Bem-vindo ao LOTBICHO</h1>
          <p className="welcome-slogan">A maior cotação do mercado</p>
        </section>

        {/* Seção de Cotações ao Vivo */}
        <section className="live-odds-section">
          <h2 className="section-title">COTAÇÃO AO VIVO</h2>
          <div className="odds-grid">
            {featuredModalities.map((mod, index) => {
              const odd = odds[mod.key] || { multiplier: mod.defaultMultiplier || 0, name: mod.name };
              // Usar índice único para evitar duplicatas
              const uniqueKey = `${mod.key}-${index}`;
              const multiplier = odd.multiplier || mod.defaultMultiplier || 0;
              return (
                <div key={uniqueKey} className="odds-card">
                  <div className="odds-number">{mod.number}.</div>
                  <h3 className="odds-name">{odd.name || mod.name}</h3>
                  <div className="odds-value">
                    1x R$ {multiplier.toFixed(2).replace('.', ',')}
                  </div>
                  <button
                    className="btn-play"
                    onClick={() => navigate('/apostar')}
                  >
                    JOGAR
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Seção de Resultados */}
        <section className="results-section">
          <h2 className="section-title">RESULTADOS</h2>
          <div className="results-content">
            <p className="no-results">Nenhum resultado disponível no momento.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Inicio;

