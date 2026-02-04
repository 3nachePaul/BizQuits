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
    const isAuthEndpoint =
      config.url?.includes('/auth/') &&
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
        retryAfter,
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

// --------------------
// AUTH
// --------------------
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    if (response.data.accessToken) {
      setAccessToken(response.data.accessToken, response.data.expiresAt);
    }
    return response;
  },
  register: (data) =>
    api.post('/auth/register', {
      ...data,
      email: data.email?.trim().toLowerCase(),
      companyName: data.companyName?.trim(),
      cui: data.cui?.trim().toUpperCase(),
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
  },
};

// --------------------
// USER
// --------------------
export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', sanitizeObject(data)),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } }),
};

// --------------------
// ADMIN USERS
// --------------------
export const adminService = {
  getAllUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${encodeURIComponent(id)}`),
  updateUser: (id, data) => api.put(`/admin/users/${encodeURIComponent(id)}`, sanitizeObject(data)),
  deleteUser: (id) => api.delete(`/admin/users/${encodeURIComponent(id)}`),
  getPendingEntrepreneurs: () => api.get('/admin/pending'),
  approveEntrepreneur: (id) => api.post(`/admin/approve/${encodeURIComponent(id)}`),
  rejectEntrepreneur: (id) => api.post(`/admin/reject/${encodeURIComponent(id)}`),
};

// --------------------
// SERVICES
// --------------------
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

// --------------------
// BOOKINGS
// --------------------
export const bookingApi = {
  create: (serviceId, message) =>
    api.post('/booking', {
      serviceId: parseInt(serviceId, 10),
      message: sanitizeInput(message),
    }),
  getMyBookings: () => api.get('/booking/my'),
  cancel: (id) => api.patch(`/booking/${encodeURIComponent(id)}/cancel`),
  complete: (id) => api.patch(`/booking/${encodeURIComponent(id)}/complete`),
  getEntrepreneurBookings: () => api.get('/booking/entrepreneur'),
  updateStatus: (id, status, response) =>
    api.patch(`/booking/${encodeURIComponent(id)}/status`, {
      status,
      response: sanitizeInput(response),
    }),
  getById: (id) => api.get(`/booking/${encodeURIComponent(id)}`),
  delete: (id) => api.delete(`/booking/${encodeURIComponent(id)}`),
};

// ✅ Gamification (Client only)
export const gamificationApi = {
  me: () => api.get('/gamification/me'),
};

// ✅ Reviews (BOOKING-based)
export const reviewApi = {
  createForBooking: (bookingId, data) => api.post(`/review/booking/${bookingId}`, data),
};

// ✅ Admin reviews moderation
export const adminReviewApi = {
  getPending: () => api.get('/admin/reviews/pending'),
  approve: (id) => api.post(`/admin/reviews/${id}/approve`),
  reject: (id) => api.post(`/admin/reviews/${id}/reject`),
};

// ✅ Public entrepreneur profile (ratings + reviews)
export const publicEntrepreneurApi = {
  getProfile: (entrepreneurProfileId) => api.get(`/public/entrepreneurs/${entrepreneurProfileId}`),
};

// ✅ Offers API
export const offerApi = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', encodeURIComponent(params.type));
    if (params.search) queryParams.append('search', encodeURIComponent(params.search));
    const queryString = queryParams.toString();
    return api.get(`/offer${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/offer/${encodeURIComponent(id)}`),
  getTypes: () => api.get('/offer/types'),
  getMyOffers: () => api.get('/offer/my'),
  create: (data) => api.post('/offer', sanitizeObject(data)),
  update: (id, data) => api.put(`/offer/${encodeURIComponent(id)}`, sanitizeObject(data)),
  toggle: (id) => api.patch(`/offer/${encodeURIComponent(id)}/toggle`),
  delete: (id) => api.delete(`/offer/${encodeURIComponent(id)}`),
  // Claims
  claim: (id, data = {}) => api.post(`/offer/${encodeURIComponent(id)}/claim`, data),
  getMyClaims: () => api.get('/offer/claims/my'),
  cancelClaim: (claimId) => api.delete(`/offer/claims/${encodeURIComponent(claimId)}`),
  getOfferClaims: (offerId) => api.get(`/offer/${encodeURIComponent(offerId)}/claims`),
  markClaimUsed: (claimId) => api.patch(`/offer/claims/${encodeURIComponent(claimId)}/use`),
};

// ✅ Challenges API (Sprint 4)
export const challengeApi = {
  // Public
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', encodeURIComponent(params.type));
    if (params.search) queryParams.append('search', encodeURIComponent(params.search));
    const queryString = queryParams.toString();
    return api.get(`/challenge${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/challenge/${encodeURIComponent(id)}`),
  getTypes: () => api.get('/challenge/types'),

  // Entrepreneur
  getMyChallenges: () => api.get('/challenge/my'),
  create: (data) => api.post('/challenge', sanitizeObject(data)),
  update: (id, data) => api.put(`/challenge/${encodeURIComponent(id)}`, sanitizeObject(data)),
  activate: (id) => api.patch(`/challenge/${encodeURIComponent(id)}/activate`),
  delete: (id) => api.delete(`/challenge/${encodeURIComponent(id)}`),
  getParticipants: (id) => api.get(`/challenge/${encodeURIComponent(id)}/participants`),
  respondParticipation: (participationId, data) =>
    api.patch(`/challenge/participations/${encodeURIComponent(participationId)}/respond`, data),
  updateProgress: (participationId, data) =>
    api.patch(`/challenge/participations/${encodeURIComponent(participationId)}/progress`, data),
  markFailed: (participationId) =>
    api.patch(`/challenge/participations/${encodeURIComponent(participationId)}/fail`),

  // Client
  join: (id, data = {}) => api.post(`/challenge/${encodeURIComponent(id)}/join`, data),
  getMyParticipations: () => api.get('/challenge/my/participations'),
  withdraw: (participationId) =>
    api.delete(`/challenge/participations/${encodeURIComponent(participationId)}`),
};

// ✅ Admin Moderation API (Sprint 4)
export const adminModerationApi = {
  // Offers
  getAllOffers: () => api.get('/admin/offers'),
  updateOffer: (id, data) => api.put(`/admin/offers/${encodeURIComponent(id)}`, data),
  deleteOffer: (id) => api.delete(`/admin/offers/${encodeURIComponent(id)}`),

  // Services
  getAllServices: () => api.get('/admin/services'),
  updateService: (id, data) => api.put(`/admin/services/${encodeURIComponent(id)}`, data),
  deleteService: (id) => api.delete(`/admin/services/${encodeURIComponent(id)}`),

  // Challenges
  getAllChallenges: () => api.get('/admin/challenges'),
  updateChallenge: (id, data) => api.put(`/admin/challenges/${encodeURIComponent(id)}`, data),
  deleteChallenge: (id) => api.delete(`/admin/challenges/${encodeURIComponent(id)}`),
};

// --------------------
// ✅ Sprint 6: BUG REPORTING
// --------------------

export const bugReportApi = {
  create: (data) => api.post('/bugreport', sanitizeObject(data)),
  my: () => api.get('/bugreport/my'),
  myById: (id) => api.get(`/bugreport/my/${encodeURIComponent(id)}`),
};

// --------------------
// ✅ Sprint 6: ADMIN BUG MONITORING
// --------------------

export const adminBugReportApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status != null) query.append("status", params.status);
    if (params.severity != null) query.append("severity", params.severity);
    if (params.priority != null) query.append("priority", params.priority);
    return api.get(`/admin/bugreports${query.toString() ? `?${query}` : ""}`);
  },

  // ✅ send DTO objects
  updateStatus: (id, status) =>
    api.patch(`/admin/bugreports/${encodeURIComponent(id)}/status`, { status: Number(status) }),

  updateSeverity: (id, severity) =>
    api.patch(`/admin/bugreports/${encodeURIComponent(id)}/severity`, { severity: Number(severity) }),

  updatePriority: (id, priority) =>
    api.patch(`/admin/bugreports/${encodeURIComponent(id)}/priority`, { priority: Number(priority) }),
};


export const adminMonitoringApi = {
  overview: () => api.get("/admin/monitoring/overview"),
  bugStats: (params = {}) => {
    const query = new URLSearchParams();
    if (params.days != null) query.append("days", params.days);
    return api.get(`/admin/monitoring/bug-stats${query.toString() ? `?${query}` : ""}`);
  },
};


export default api;
