import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLoginMode) {
      // Login
      const result = await login(formData.username, formData.password);
      if (!result.success) {
        setError(result.error);
      }
      // If successful, AuthContext will handle the redirect
    } else {
      // Register
      if (!formData.email || !formData.username || !formData.password) {
        setError('All fields are required');
        setLoading(false);
        return;
      }

      const result = await register(
        formData.username,
        formData.email,
        formData.password,
        formData.full_name
      );

      if (result.success) {
        setSuccess('Registration successful! Please login.');
        setFormData({
          username: '',
          email: '',
          password: '',
          full_name: ''
        });
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccess('');
        }, 2000);
      } else {
        setError(result.error);
      }
    }

    setLoading(false);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: ''
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Insurance Visualiser</h1>
          <p>{isLoginMode ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="Enter your username"
            />
          </div>

          {!isLoginMode && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  autoComplete="name"
                  placeholder="Enter your full name (optional)"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete={isLoginMode ? 'current-password' : 'new-password'}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {isLoginMode && (
          <div className="login-footer">
            <p style={{ textAlign: 'center', color: '#6c757d', fontSize: 14 }}>
              Don't have an account? Contact the admin.
            </p>
          </div>
        )}

        {!isLoginMode && (
          <div className="login-footer">
            <button onClick={toggleMode} className="btn-link">
              Already have an account? Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
