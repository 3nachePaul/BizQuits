import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Form.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [cui, setCui] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (role === 1) {
      if (!companyName.trim()) {
        newErrors.companyName = 'Company Name is required for entrepreneurs.';
      }
      if (!cui.trim()) {
        newErrors.cui = 'CUI is required for entrepreneurs.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData = { email, password, role };
      if (role === 1) {
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
          setErrors({ general: errorData });
        } else if (errorData.errors) {
          const fieldErrors = {};
          Object.entries(errorData.errors).forEach(([key, value]) => {
            fieldErrors[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
          });
          setErrors(fieldErrors);
        } else if (errorData.title) {
          setErrors({ general: errorData.title });
        } else {
          setErrors({ general: 'Registration failed. Please check your input.' });
        }
      } else {
        setErrors({ general: 'Registration failed. An unknown error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      {errors.general && (
        <div className="alert alert-danger">
          <span className="alert-icon">⚠️</span>
          <span>{errors.general}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          <span>{success}</span>
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
            minLength={6}
          />
          {errors.password ? (
            <span className="field-error">⚠️ {errors.password}</span>
          ) : (
            <small className="form-hint">Minimum 6 characters</small>
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? 'input-error' : ''}`}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({...prev, confirmPassword: ''})); }}
            required
            disabled={isLoading}
          />
          {errors.confirmPassword && <span className="field-error">⚠️ {errors.confirmPassword}</span>}
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
              <p>ℹ️ Entrepreneur accounts require admin approval before you can log in.</p>
            </div>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className={`form-control ${errors.companyName ? 'input-error' : ''}`}
                value={companyName}
                onChange={(e) => { setCompanyName(e.target.value); setErrors(prev => ({...prev, companyName: ''})); }}
                required
                disabled={isLoading}
              />
              {errors.companyName && <span className="field-error">⚠️ {errors.companyName}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">CUI (Company Registration Number)</label>
              <input
                type="text"
                className={`form-control ${errors.cui ? 'input-error' : ''}`}
                value={cui}
                onChange={(e) => { setCui(e.target.value); setErrors(prev => ({...prev, cui: ''})); }}
                required
                disabled={isLoading}
                placeholder="e.g., RO12345678"
              />
              {errors.cui && <span className="field-error">⚠️ {errors.cui}</span>}
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