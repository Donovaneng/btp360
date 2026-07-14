import axios from 'axios';

const API_BASE_URL = 'http://localhost/btp_360/backend_btp360/index.php';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token JWT (sauf sur les routes d'auth)
api.interceptors.request.use(
  (config) => {
    const publicRoutes = ['/login', '/register'];
    const isPublic = publicRoutes.some(r => config.url?.endsWith(r));
    
    if (!isPublic) {
      const token = localStorage.getItem('btp360_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.endsWith('/login') || error.config?.url?.endsWith('/register');
    
    if (error.response?.status === 401 && !isAuthRoute) {
      // Token expiré ou invalide → déconnexion automatique
      localStorage.removeItem('btp360_token');
      localStorage.removeItem('btp360_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
