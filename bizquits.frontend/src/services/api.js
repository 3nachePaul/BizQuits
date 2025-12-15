import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5204/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

let accessToken = null;
let tokenExpiry = null;

export const setAccessToken = (token, expiresAt) => {
  accessToken = token;
  tokenExpiry = expiresAt ? new Date(expiresAt) : null;
};

export const clearAccessToken = () => {
  accessToken = null;
  tokenExpiry = null;
};

export const getAccessToken = () => accessToken;

export const isTokenExpired = () => {
  if (!tokenExpiry) return true;
  return new Date() >= new Date(tokenExpiry.getTime() - 30000);
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers.forEach((cb) => cb(null));
  refreshSubscribers = [];
};

api.interceptors.request.use(
  async (config) => {
    const isAuthEndpoint = config.url?.includes('/auth/') && 
      !config.url?.includes('/logout') && 
      !config.url?.includes('/revoke');
    
    if (!isAuthEndpoint && accessToken) {
      if (isTokenExpired() && !config.url?.includes('/refresh')) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const response = await authService.refresh();
            setAccessToken(response.data.accessToken, response.data.expiresAt);
            onRefreshed(response.data.accessToken);
          } catch (error) {
            onRefreshFailed();
            clearAccessToken();
            window.location.href = '/login';
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        }
        
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(config);
          });
        });
      }
      
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 429) {
      const retryAfter = error.response.data?.retryAfter || 60;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds.`);
      return Promise.reject({
        ...error,
        message: `Too many requests. Please wait ${retryAfter} seconds.`,
        isRateLimited: true,
        retryAfter
      });
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response.headers['token-expired'] === 'true') {
        originalRequest._retry = true;
        
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const response = await authService.refresh();
            setAccessToken(response.data.accessToken, response.data.expiresAt);
            onRefreshed(response.data.accessToken);
            
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            onRefreshFailed();
            clearAccessToken();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
      
      clearAccessToken();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { 
      email: email.trim().toLowerCase(), 
      password 
    });
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken, response.data.expiresAt);
    }
    return response;
  },
  register: (data) => api.post('/auth/register', {
    ...data,
    email: data.email?.trim().toLowerCase(),
    companyName: data.companyName?.trim(),
    cui: data.cui?.trim().toUpperCase()
  }),
  refresh: () => api.post('/auth/refresh'),
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAccessToken();
    }
  },
  revokeAll: async () => {
    try {
      await api.post('/auth/revoke-all');
    } finally {
      clearAccessToken();
    }
  }
};

export const userService = {
  getProfile: () => api.get('/user/profile'),
};

export const adminService = {
  getAllUsers: () => api.get('/admin/users'),
  getPendingEntrepreneurs: () => api.get('/admin/pending'),
  approveEntrepreneur: (id) => api.post(`/admin/approve/${encodeURIComponent(id)}`),
  rejectEntrepreneur: (id) => api.post(`/admin/reject/${encodeURIComponent(id)}`),
};

export const serviceApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', encodeURIComponent(params.category));
    if (params.minPrice) queryParams.append('minPrice', encodeURIComponent(params.minPrice));
    if (params.maxPrice) queryParams.append('maxPrice', encodeURIComponent(params.maxPrice));
    if (params.search) queryParams.append('search', encodeURIComponent(params.search));
    const queryString = queryParams.toString();
    return api.get(`/service${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/service/${encodeURIComponent(id)}`),
  getCategories: () => api.get('/service/categories'),
  getMyServices: () => api.get('/service/my'),
  create: (data) => api.post('/service', sanitizeObject(data)),
  update: (id, data) => api.put(`/service/${encodeURIComponent(id)}`, sanitizeObject(data)),
  toggle: (id) => api.patch(`/service/${encodeURIComponent(id)}/toggle`),
  delete: (id) => api.delete(`/service/${encodeURIComponent(id)}`),
};

export const bookingApi = {
  create: (serviceId, message) => api.post('/booking', { 
    serviceId: parseInt(serviceId, 10), 
    message: sanitizeInput(message) 
  }),
  getMyBookings: () => api.get('/booking/my'),
  cancel: (id) => api.patch(`/booking/${encodeURIComponent(id)}/cancel`),
  complete: (id) => api.patch(`/booking/${encodeURIComponent(id)}/complete`),
  getEntrepreneurBookings: () => api.get('/booking/entrepreneur'),
  updateStatus: (id, status, response) => api.patch(`/booking/${encodeURIComponent(id)}/status`, { 
    status, 
    response: sanitizeInput(response) 
  }),
  getById: (id) => api.get(`/booking/${encodeURIComponent(id)}`),
};

export default api;
