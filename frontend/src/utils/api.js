import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers = config.headers || {};

  // If token exists, attach it
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  // Allow unauthenticated access to auth routes (login/register)
  const url = (config.url || '').toString();
  if (url.startsWith('/auth') || url.includes('/auth/')) {
    return config;
  }

  // No token and accessing a protected endpoint: reject early with a shaped error
  const err = new Error('No autorizado: token faltante');
  err.response = { status: 401, data: { message: 'No autorizado: token faltante' } };
  // Clear any stale token and navigate to login
  localStorage.removeItem('token');
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

// Optional: handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const extractApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
};
