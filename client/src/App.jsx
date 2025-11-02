import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import DashboardEngine from './components/DashboardEngine'
import DashboardView from './components/DashboardView'
import DatabaseEngine from './components/DatabaseEngine'
import UserManagement from './components/UserManagement'
import logo from '../assets/chola-ms2559.jpg'

function AppContent() {
  const { user, isAuthenticated, logout, hasPermission, loading } = useAuth();
  const [tab, setTab] = useState(null);

  // Define available tabs based on permissions
  const availableTabs = [];
  
  if (hasPermission('databaseEngine', 'view')) {
    availableTabs.push('Database Engine');
  }
  
  if (hasPermission('dashboards', 'view')) {
    availableTabs.push('Dashboard Engine');
    availableTabs.push('Dashboard View');
  }
  
  if (hasPermission('users', 'view')) {
    availableTabs.push('User Management');
  }

  // Set default tab on mount or when permissions change
  useEffect(() => {
    if (isAuthenticated && !tab && availableTabs.length > 0) {
      setTab(availableTabs[0]);
    } else if (isAuthenticated && tab && !availableTabs.includes(tab) && availableTabs.length > 0) {
      setTab(availableTabs[0]);
    }
  }, [isAuthenticated, tab, availableTabs.length]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20,
        padding: '16px 20px',
        background: 'white',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: 60, height: 60, objectFit: 'contain' }}
          />
          <h2 style={{ margin: 0, fontSize: 22, color: '#212529' }}>Insurance Visualiser</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4
          }}>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 600,
              color: '#212529'
            }}>
              {user?.username}
            </div>
            <span style={{
              padding: '3px 10px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              color: 'white',
              backgroundColor: user?.role === 'admin' ? '#dc3545' : 
                               user?.role === 'manager' ? '#fd7e14' :
                               user?.role === 'analyst' ? '#0dcaf0' : '#6c757d',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {user?.role}
            </span>
          </div>
          <button 
            className="btn danger" 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </div>

      <div className="nav">
        {availableTabs.map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={tab === t ? "btn btn-active" : "btn"}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="panel">
        {!tab ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>
        ) : (
          <>
            {tab === 'Database Engine' && hasPermission('databaseEngine', 'view') && (
              <DatabaseEngine />
            )}
            {tab === 'Dashboard Engine' && hasPermission('dashboards', 'view') && (
              <DashboardEngine />
            )}
            {tab === 'Dashboard View' && hasPermission('dashboards', 'view') && (
              <DashboardView />
            )}
            {tab === 'User Management' && hasPermission('users', 'view') && (
              <UserManagement />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
