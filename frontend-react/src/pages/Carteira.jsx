import { useState, useEffect } from 'react';
import api from '../services/api';
import './Carteira.css';

const Carteira = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

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
            <h2>Saldo Total</h2>
            <div className="balance-amount">
              {formatCurrency(balance?.total_balance || 0)}
            </div>
          </div>
          <div className="balance-card">
            <h2>Saldo Principal</h2>
            <div className="balance-amount secondary">
              {formatCurrency(balance?.balance || 0)}
            </div>
          </div>
          {balance?.bonus_balance > 0 && (
            <div className="balance-card">
              <h2>Saldo Bônus</h2>
              <div className="balance-amount bonus">
                {formatCurrency(balance?.bonus_balance || 0)}
              </div>
            </div>
          )}
        </div>

        <div className="wallet-actions">
          <button className="btn btn-primary">Depositar</button>
          <button className="btn btn-secondary">Sacar</button>
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
                      Saldo: {formatCurrency(transaction.balance_after)}
                    </p>
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

export default Carteira;

