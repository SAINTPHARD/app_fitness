import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function AppRoutes() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingCard}>Carregando sessão...</div>
      </div>
    );
  }

  return signed ? <Dashboard /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

const styles = {
  loadingScreen: {
    alignItems: 'center',
    background: '#f3f4f6',
    display: 'flex',
    minHeight: '100vh',
    justifyContent: 'center',
  },
  loadingCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
    color: '#334155',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '24px 28px',
  },
};
