import axios from 'axios';

// Dynamically determine the correct API Base URL
export const getApiBaseUrl = () => {
  // If in browser and deployed (e.g. Vercel, mobile, any remote domain)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://safehelp-ai-backend.onrender.com/api';
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Local fallback
  return envUrl || 'https://safehelp-ai-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Attach dynamic baseURL and JWT token to all requests
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const token = localStorage.getItem('safehelp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Graceful interceptor for Render cold starts or network reconnects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      const friendlyError = new Error('Server connection taking longer than expected.');
      friendlyError.response = {
        data: {
          message: 'The cloud server is warming up or network is slow. Please retry in a few seconds.'
        }
      };
      return Promise.reject(friendlyError);
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// AI Emergency Analysis Endpoints
export const aiApi = {
  analyzeText: (text) => api.post('/ai/analyze-text', { text }),
  analyzeImage: (formData) => api.post('/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// SOS Alert Endpoints
export const sosApi = {
  create: (data) => api.post('/sos', data),
  getAll: () => api.get('/sos'),
  getMyEvents: () => api.get('/sos/my-events'),
  getById: (id) => api.get(`/sos/${id}`),
  updateStatus: (id, status) => api.patch(`/sos/${id}/status`, { status }),
};

// Emergency Contacts Endpoints
export const contactApi = {
  getAll: () => api.get('/contacts'),
  create: (data) => api.post('/contacts', data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export default api;
