import axios from 'axios';

const API_BASE_URL = 'http://localhost:5204/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
};

export const adminService = {
  getAllUsers: () => api.get('/admin/users'),
  getPendingEntrepreneurs: () => api.get('/admin/pending'),
  approveEntrepreneur: (id) => api.post(`/admin/approve/${id}`),
  rejectEntrepreneur: (id) => api.post(`/admin/reject/${id}`),
};

export default api;
