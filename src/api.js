import axios from 'axios';
import { clearAuthSession } from './utils/auth';

// Keep API requests on the Vite origin in development; vite.config.js proxies /api.
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: apiBaseURL,
});

export const apiBaseURLWithoutVersion = apiBaseURL.replace(/\/v1\/?$/, '');

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();

      if (window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }

    return Promise.reject(error);
  },
);

export default api;
