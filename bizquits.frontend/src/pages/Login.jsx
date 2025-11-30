import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Form.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsPendingApproval(false);
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
        setError(errorMessage);
      } else {
        setError('Login failed. An unknown error occurred.');
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
          <strong>Account Pending Approval</strong>
          <p>Your entrepreneur account is awaiting admin approval. You will be able to log in once your account has been verified.</p>
        </div>
      )}
      {error && !isPendingApproval && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
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