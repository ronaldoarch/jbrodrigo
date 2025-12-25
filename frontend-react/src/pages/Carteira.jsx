import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Carteira.css';

const Carteira = () => {
  const { user, checkAuth } = useAuth();
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  // Estados do modal de depósito
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [pixQrCode, setPixQrCode] = useState(null);
  const [pixCode, setPixCode] = useState('');
  const [paymentId, setPaymentId] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  // Estados do modal de saque
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawLimits, setWithdrawLimits] = useState({ min: 30, max: 10000 });

  useEffect(() => {
    loadData();
    loadWithdrawLimits();
  }, [page]);

  // Verificar status do pagamento a cada 5 segundos quando houver QR Code
  useEffect(() => {
    if (!paymentId || !pixQrCode) return;

    const interval = setInterval(async () => {
      await checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, pixQrCode]);

  const loadData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/backend/wallet/balance.php'),
        api.get(`/backend/wallet/transactions.php?page=${page}&limit=20`),
      ]);

      if (balanceRes.data.success) {
        setBalance(balanceRes.data);
      }
      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.transactions);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawLimits = async () => {
    try {
      const response = await api.get('/backend/admin/withdrawal-limits.php').catch(() => ({
        data: { success: false }
      }));
      if (response.data.success) {
        setWithdrawLimits({
          min: response.data.min_amount || 30,
          max: response.data.max_amount || 10000,
        });
      }
    } catch (error) {
      console.debug('Erro ao carregar limites:', error);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setDepositError('');
    setDepositLoading(true);

    const amount = parseFloat(depositAmount);
    if (!amount || amount < 10) {
      setDepositError('Valor mínimo de depósito é R$ 10,00');
      setDepositLoading(false);
      return;
    }

    try {
      const response = await api.post('/backend/payments/create.php', {
        amount,
        type: 'deposit',
        method: 'pix',
      });

      if (response.data.success) {
        setPixQrCode(response.data.qr_code || response.data.qr_code_url);
        setPixCode(response.data.pix_code || response.data.code);
        setPaymentId(response.data.payment_id || response.data.id);
      } else {
        setDepositError(response.data.error || 'Erro ao criar depósito');
      }
    } catch (error) {
      setDepositError(error.response?.data?.error || 'Erro ao processar depósito');
    } finally {
      setDepositLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId || checkingPayment) return;

    setCheckingPayment(true);
    try {
      const response = await api.get(`/backend/payments/check-status.php?id=${paymentId}`);
      
      if (response.data.success && response.data.status === 'completed') {
        // Depósito confirmado!
        setPixQrCode(null);
        setPixCode('');
        setPaymentId(null);
        setDepositAmount('');
        setShowDepositModal(false);
        
        // Atualizar saldo
        await loadData();
        await checkAuth();
        
        // Disparar evento Facebook Pixel
        if (window.trackFacebookEvent) {
          window.trackFacebookEvent('Depósito Completo', { value: parseFloat(depositAmount) });
        }
        
        // Mostrar popup de sucesso
        alert('Depósito confirmado com sucesso!');
      }
    } catch (error) {
      console.debug('Erro ao verificar pagamento:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawLoading(true);

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < withdrawLimits.min) {
      setWithdrawError(`Valor mínimo de saque é R$ ${withdrawLimits.min.toFixed(2)}`);
      setWithdrawLoading(false);
      return;
    }
    if (amount > withdrawLimits.max) {
      setWithdrawError(`Valor máximo de saque é R$ ${withdrawLimits.max.toFixed(2)}`);
      setWithdrawLoading(false);
      return;
    }
    if (!pixKey || pixKey.trim().length < 5) {
      setWithdrawError('Chave PIX inválida');
      setWithdrawLoading(false);
      return;
    }
    if (amount > (balance?.balance || 0)) {
      setWithdrawError('Saldo insuficiente');
      setWithdrawLoading(false);
      return;
    }

    try {
      const response = await api.post('/backend/payments/withdraw.php', {
        amount,
        pix_key: pixKey.trim(),
      });

      if (response.data.success) {
        setWithdrawAmount('');
        setPixKey('');
        setShowWithdrawModal(false);
        await loadData();
        await checkAuth();
        alert('Solicitação de saque enviada com sucesso!');
      } else {
        setWithdrawError(response.data.error || 'Erro ao solicitar saque');
      }
    } catch (error) {
      setWithdrawError(error.response?.data?.error || 'Erro ao processar saque');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const copyPixCode = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      alert('Código PIX copiado!');
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      bet: 'Aposta',
      prize: 'Prêmio',
      deposit: 'Depósito',
      withdraw: 'Saque',
      refund: 'Reembolso',
      bonus: 'Bônus',
      fee: 'Taxa',
    };
    return labels[type] || type;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="carteira">
      <div className="container">
        <h1>Carteira</h1>

        <div className="balance-cards">
          <div className="balance-card">
            <h2>Saldo Disponível</h2>
            <div className="balance-amount">
              {formatCurrency(balance?.total_balance || 0)}
            </div>
            <div className="balance-details">
              <span>Principal: {formatCurrency(balance?.balance || 0)}</span>
              {balance?.bonus_balance > 0 && (
                <span>Bônus: {formatCurrency(balance?.bonus_balance)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="wallet-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowDepositModal(true)}
          >
            Depositar
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowWithdrawModal(true)}
          >
            Sacar
          </button>
        </div>

        <div className="transactions-section">
          <h2>Histórico de Transações</h2>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <h3>{getTypeLabel(transaction.type)}</h3>
                    <p className="transaction-date">
                      {new Date(transaction.created_at).toLocaleString('pt-BR')}
                    </p>
                    {transaction.description && (
                      <p className="transaction-description">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                  <div className="transaction-amount">
                    <span
                      className={
                        transaction.type === 'prize' ||
                        transaction.type === 'deposit' ||
                        transaction.type === 'bonus'
                          ? 'positive'
                          : 'negative'
                      }
                    >
                      {transaction.type === 'prize' ||
                      transaction.type === 'deposit' ||
                      transaction.type === 'bonus'
                        ? '+'
                        : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <p className="balance-after">
                      Saldo: {formatCurrency(transaction.balance_after || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Depósito */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => !pixQrCode && setShowDepositModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Depositar via PIX</h2>
              {!pixQrCode && (
                <button className="modal-close" onClick={() => setShowDepositModal(false)}>×</button>
              )}
            </div>

            <div className="modal-body">
              {!pixQrCode ? (
                <form onSubmit={handleDeposit}>
                  <div className="form-group">
                    <label>Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="10"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="10.00"
                      required
                    />
                    <small>Valor mínimo: R$ 10,00</small>
                  </div>

                  {depositError && <div className="error">{depositError}</div>}

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" disabled={depositLoading}>
                      {depositLoading ? 'Processando...' : 'Gerar QR Code PIX'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setShowDepositModal(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="pix-payment">
                  <p className="pix-instructions">
                    Escaneie o QR Code ou copie o código PIX para fazer o pagamento
                  </p>
                  
                  {pixQrCode && (
                    <div className="qr-code-container">
                      <img src={pixQrCode} alt="QR Code PIX" className="qr-code" />
                    </div>
                  )}

                  {pixCode && (
                    <div className="pix-code-container">
                      <label>Código PIX:</label>
                      <div className="pix-code-wrapper">
                        <input
                          type="text"
                          value={pixCode}
                          readOnly
                          className="pix-code-input"
                        />
                        <button 
                          className="btn btn-secondary"
                          onClick={copyPixCode}
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}

                  {checkingPayment && (
                    <div className="checking-payment">
                      <div className="spinner"></div>
                      <p>Verificando pagamento...</p>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setPixQrCode(null);
                        setPixCode('');
                        setPaymentId(null);
                        setDepositAmount('');
                        setShowDepositModal(false);
                      }}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Saque */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Solicitar Saque</h2>
              <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleWithdraw}>
                <div className="form-group">
                  <label>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={withdrawLimits.min}
                    max={withdrawLimits.max}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`${withdrawLimits.min.toFixed(2)} - ${withdrawLimits.max.toFixed(2)}`}
                    required
                  />
                  <small>
                    Mínimo: R$ {withdrawLimits.min.toFixed(2)} | Máximo: R$ {withdrawLimits.max.toFixed(2)}
                  </small>
                </div>

                <div className="form-group">
                  <label>Chave PIX</label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                    required
                  />
                  <small>Digite sua chave PIX para receber o saque</small>
                </div>

                {withdrawError && <div className="error">{withdrawError}</div>}

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={withdrawLoading}>
                    {withdrawLoading ? 'Processando...' : 'Solicitar Saque'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowWithdrawModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carteira;
