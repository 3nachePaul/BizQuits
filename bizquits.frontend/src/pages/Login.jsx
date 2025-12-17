import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Form.css';

// SVG Icons
const Icons = {
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  alertTriangle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsPendingApproval(false);
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        let errorMessage = '';
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else {
          errorMessage = 'Login failed. Please check your credentials.';
        }
        
        if (errorMessage.toLowerCase().includes('pending approval')) {
          setIsPendingApproval(true);
        }
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: 'Login failed. An unknown error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {isPendingApproval && (
        <div className="alert alert-warning">
          <span className="alert-icon">{Icons.clock}</span>
          <div>
            <strong>Account Pending Approval</strong>
            <p>Your entrepreneur account is awaiting admin approval. You will be able to log in once your account has been verified.</p>
          </div>
        </div>
      )}
      {errors.general && !isPendingApproval && (
        <div className="alert alert-danger">
          <span className="alert-icon">{Icons.alertTriangle}</span>
          <span>{errors.general}</span>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'input-error' : ''}`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({...prev, email: ''})); }}
            required
            disabled={isLoading}
          />
          {errors.email && <span className="field-error">{Icons.alertTriangle} {errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className={`form-control ${errors.password ? 'input-error' : ''}`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({...prev, password: ''})); }}
            required
            disabled={isLoading}
          />
          {errors.password && <span className="field-error">{Icons.alertTriangle} {errors.password}</span>}
        </div>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="form-text">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;