import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // User not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // User is authenticated but does not have the required role, redirect to home or unauthorized page
    return <Navigate to="/" replace />; // or to a /unauthorized page
  }

  return children;
};

export default PrivateRoute;
