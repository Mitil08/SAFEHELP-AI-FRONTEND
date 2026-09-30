import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://safehelp-ai-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('safehelp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

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
