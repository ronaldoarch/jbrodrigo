import axios from 'axios';

// URL da API - usar variável de ambiente ou padrão do Coolify
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://dsssg0wkk4cwcgcckkwsco0w.agenciamidas.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies de sessão
});

// Interceptor para adicionar token se necessário
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Não redirecionar se já estamos na página de login
    // Não redirecionar se a requisição é para verificar autenticação (me.php)
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/login/';
    const isAuthCheck = error.config?.url?.includes('/auth/me.php');
    
    if (error.response?.status === 401 && !isLoginPage && !isAuthCheck) {
      // Não autenticado - redirecionar para login apenas se não estiver na página de login
      // e não for uma verificação de autenticação
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

