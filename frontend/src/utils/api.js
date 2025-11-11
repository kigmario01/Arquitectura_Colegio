import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
});

export const extractApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Ocurrió un error inesperado. Intenta nuevamente.';
};
