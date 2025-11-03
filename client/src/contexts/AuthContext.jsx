import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Role-based permissions
  const permissions = {
    admin: {
      users: { view: true, create: true, edit: true, delete: true },
      customers: { view: true, create: true, edit: true, delete: true },
      agents: { view: true, create: true, edit: true, delete: true },
      policies: { view: true, create: true, edit: true, delete: true },
      claims: { view: true, create: true, edit: true, delete: true },
      dashboards: { view: true, create: true, edit: true, delete: true },
      databaseEngine: { view: true, create: true, edit: true, delete: true }
    },
    manager: {
      users: { view: true, create: false, edit: false, delete: false },
      customers: { view: true, create: true, edit: true, delete: true },
      agents: { view: true, create: true, edit: true, delete: true },
      policies: { view: true, create: true, edit: true, delete: true },
      claims: { view: true, create: true, edit: true, delete: true },
      dashboards: { view: true, create: true, edit: true, delete: true },
      databaseEngine: { view: true, create: true, edit: true, delete: true }
    },
    analyst: {
      users: { view: false, create: false, edit: false, delete: false },
      customers: { view: true, create: false, edit: false, delete: false },
      agents: { view: true, create: false, edit: false, delete: false },
      policies: { view: true, create: false, edit: false, delete: false },
      claims: { view: true, create: false, edit: false, delete: false },
      dashboards: { view: true, create: true, edit: true, delete: true },
      databaseEngine: { view: true, create: false, edit: false, delete: false }
    },
    viewer: {
      users: { view: false, create: false, edit: false, delete: false },
      customers: { view: true, create: false, edit: false, delete: false },
      agents: { view: true, create: false, edit: false, delete: false },
      policies: { view: true, create: false, edit: false, delete: false },
      claims: { view: true, create: false, edit: false, delete: false },
      dashboards: { view: true, create: false, edit: false, delete: false },
      databaseEngine: { view: true, create: false, edit: false, delete: false }
    }
  };

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          // Token is invalid
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, email, password, full_name) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, full_name })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check if user has permission for a specific action
  const hasPermission = (resource, action) => {
    if (!user || !user.role) return false;
    const rolePerms = permissions[user.role];
    if (!rolePerms || !rolePerms[resource]) return false;
    return rolePerms[resource][action] === true;
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasPermission,
    getAuthHeaders,
    isAuthenticated: !!user
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
