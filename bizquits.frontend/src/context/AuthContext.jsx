import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService, setAccessToken, clearAccessToken, getAccessToken, isTokenExpired } from '../services/api';

const AuthContext = createContext(null);

const decodeToken = (token) => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return {
      id: payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role,
      exp: payload.exp,
      iat: payload.iat,
      jti: payload.jti
    };
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = useCallback(async () => {
    try {
      const token = getAccessToken();
      
      if (token && !isTokenExpired()) {
        const decoded = decodeToken(token);
        if (decoded) {
          setUser({ 
            id: decoded.id,
            email: decoded.email, 
            role: decoded.role 
          });
        }
      } else if (token) {
        try {
          const response = await authService.refresh();
          const decoded = decodeToken(response.data.accessToken);
          if (decoded) {
            setUser({ 
              id: decoded.id,
              email: decoded.email, 
              role: decoded.role 
            });
          }
        } catch (error) {
          clearAccessToken();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = setInterval(async () => {
      if (isTokenExpired()) {
        try {
          await authService.refresh();
        } catch (error) {
          logout();
        }
      }
    }, 60000);

    return () => clearInterval(checkTokenExpiry);
  }, [user]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { accessToken, user: userData } = response.data;
    
    const decoded = decodeToken(accessToken);
    if (decoded) {
      setUser({ 
        id: decoded.id,
        email: decoded.email, 
        role: decoded.role,
        ...userData
      });
    }
    
    return response.data;
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const logoutAllDevices = useCallback(async () => {
    try {
      await authService.revokeAll();
    } catch (error) {
      console.error('Revoke all API call failed:', error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    login,
    logout,
    logoutAllDevices,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isEntrepreneur: user?.role === 'Entrepreneur',
    isClient: user?.role === 'Client'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};