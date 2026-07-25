import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext({
  user: null,
  signed: false,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = authService.getToken();
    const email = localStorage.getItem('userEmail');

    if (token && email) {
      setUser({ email });
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser({ email: data.email || email });
      setError(null);
      return data;
    } catch (err) {
      setError(err?.message || 'Erro de autenticação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const signed = Boolean(user && authService.getToken());

  const value = useMemo(
    () => ({
      user,
      signed,
      loading,
      error,
      login,
      logout,
    }),
    [user, signed, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
