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

export const serviceApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.search) queryParams.append('search', params.search);
    const queryString = queryParams.toString();
    return api.get(`/service${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/service/${id}`),
  getCategories: () => api.get('/service/categories'),
  getMyServices: () => api.get('/service/my'),
  create: (data) => api.post('/service', data),
  update: (id, data) => api.put(`/service/${id}`, data),
  toggle: (id) => api.patch(`/service/${id}/toggle`),
  delete: (id) => api.delete(`/service/${id}`),
};

export const bookingApi = {
  create: (serviceId, message) => api.post('/booking', { serviceId, message }),
  getMyBookings: () => api.get('/booking/my'),
  cancel: (id) => api.patch(`/booking/${id}/cancel`),
  complete: (id) => api.patch(`/booking/${id}/complete`),
  getEntrepreneurBookings: () => api.get('/booking/entrepreneur'),
  updateStatus: (id, status, response) => api.patch(`/booking/${id}/status`, { status, response }),
  getById: (id) => api.get(`/booking/${id}`),
};

export default api;
