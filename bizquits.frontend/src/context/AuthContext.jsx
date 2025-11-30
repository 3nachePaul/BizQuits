import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role,
      exp: payload.exp
    };
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        return;
      }
      const decoded = decodeToken(token);
      if (decoded) {
        setUser({ email: decoded.email, role: decoded.role });
      } else {
        logout();
      }
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { token: newToken } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decoded = decodeToken(newToken);
    if (decoded) {
      setUser({ email: decoded.email, role: decoded.role });
    }
    return newToken;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !isTokenExpired(token),
    isAdmin: user && user.role === 'Admin',
    isEntrepreneur: user && user.role === 'Entrepreneur',
    isClient: user && user.role === 'Client'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};