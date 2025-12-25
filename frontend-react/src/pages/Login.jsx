import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    referral_code: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        navigate('/dashboard'); // ou '/inicio'
      } else {
        setError(result.error || 'Erro ao processar solicitação');
      }
    } catch (err) {
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-card">
          <div className="tabs">
            <button
              type="button"
              className={`tab ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  cpf: '',
                  phone: '',
                  referral_code: '',
                });
              }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`tab ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setError('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  cpf: '',
                  phone: '',
                  referral_code: '',
                });
              }}
            >
              Criar Conta
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label>CPF</label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    required
                    placeholder="000.000.000-00"
                    maxLength="14"
                  />
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="form-group">
                  <label>Código de Indicação (Opcional)</label>
                  <input
                    type="text"
                    name="referral_code"
                    value={formData.referral_code}
                    onChange={handleChange}
                    placeholder="Código de indicação"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          {isLogin && (
            <div className="forgot-password">
              <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

