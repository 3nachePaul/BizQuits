import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Form.css';

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
          <span className="alert-icon">⏳</span>
          <div>
            <strong>Account Pending Approval</strong>
            <p>Your entrepreneur account is awaiting admin approval. You will be able to log in once your account has been verified.</p>
          </div>
        </div>
      )}
      {errors.general && !isPendingApproval && (
        <div className="alert alert-danger">
          <span className="alert-icon">⚠️</span>
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
          {errors.email && <span className="field-error">⚠️ {errors.email}</span>}
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
          {errors.password && <span className="field-error">⚠️ {errors.password}</span>}
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