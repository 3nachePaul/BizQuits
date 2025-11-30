import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Form.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(0); // 0 = Client
  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (role === 1) { // Entrepreneur
      if (!companyName.trim()) {
        setError('Company Name is required for entrepreneurs.');
        return false;
      }
      if (!cui.trim()) {
        setError('CUI is required for entrepreneurs.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData = { email, password, role };
      if (role === 1) { // Entrepreneur
        registerData.companyName = companyName;
        registerData.cui = cui;
      }

      await authService.register(registerData);
      
      if (role === 1) {
        setSuccess('Registration successful! Your entrepreneur account is pending admin approval. You will be notified once approved.');
      } else {
        setSuccess('Registration successful! Redirecting to login...');
      }
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.errors) {
          const messages = Object.values(errorData.errors).flat().join(' ');
          setError(messages);
        } else if (errorData.title) {
          setError(errorData.title);
        } else {
          setError('Registration failed. Please check your input.');
        }
      } else {
        setError('Registration failed. An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
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
            minLength={6}
          />
          <small className="form-hint">Minimum 6 characters</small>
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select 
            className="form-control" 
            value={role} 
            onChange={(e) => setRole(parseInt(e.target.value))}
            disabled={isLoading}
          >
            <option value={0}>Client</option>
            <option value={1}>Entrepreneur</option>
          </select>
        </div>
        {role === 1 && (
          <div className="entrepreneur-fields">
            <div className="info-box">
              <p>Entrepreneur accounts require admin approval before you can log in.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">CUI (Company Registration Number)</label>
              <input
                type="text"
                className="form-control"
                value={cui}
                onChange={(e) => setCui(e.target.value)}
                required
                disabled={isLoading}
                placeholder="e.g., RO12345678"
              />
            </div>
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="form-text">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;