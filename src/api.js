import axios from 'axios';
import { clearAuthSession } from './utils/auth';

// Keep API requests on the Vite origin in development; vite.config.js proxies /api.
const configuredApiBaseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
// Normalize the base so relative endpoint paths combine consistently.
const apiBaseURL = configuredApiBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: apiBaseURL,
});

export const apiBaseURLWithoutVersion = apiBaseURL.replace(/\/v1\/?$/, '');

api.interceptors.request.use((config) => {
  // Django's slash-terminated routes can redirect slashless requests. A
  // cross-origin redirect is rejected by browsers before CORS can succeed.
  // Add the slash to the path while preserving query strings and fragments.
  if (config.url && !/^([a-z][a-z\d+.-]*:)?\/\//i.test(config.url)) {
    const urlParts = config.url.match(/^([^?#]*)([?#].*)?$/);
    const path = urlParts?.[1] ?? config.url;
    const suffix = urlParts?.[2] ?? '';

    if (path && !path.endsWith('/')) {
      config.url = `${path}/${suffix}`;
    }
  }

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
