import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NutritionProvider } from './context/NutritionContext';
import { MetasProvider } from './context/MetasContext';
import ToastHost from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/Login';
import OnboardingPage from './pages/Onboarding';
import DashboardLayout from './pages/Dashboard';
import HomePage from './pages/Dashboard/Home';
import DietaPage from './pages/Dashboard/Dieta/PainelDieta';
import TreinoPage from './pages/Dashboard/Treino';
import EvolucaoPage from './pages/Dashboard/Evolucao';
import RelatoriosPage from './pages/Dashboard/Relatorios';
import PerfilPage from './pages/Dashboard/Perfil';
import ConfiguracoesPage from './pages/Dashboard/Configuracoes';

function AppRoutes() {
  const { signed, loading } = useAuth();
  const profileComplete = localStorage.getItem('profile_complete') === 'true';

  if (loading) {
    return (
      <div className="app-shell-loading">
        <div className="app-shell-spinner">Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            signed ? (
              <Navigate to={profileComplete ? '/dashboard/inicio' : '/onboarding'} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/onboarding"
          element={
            signed ? (
              profileComplete ? (
                <Navigate to="/dashboard/inicio" replace />
              ) : (
                <OnboardingPage />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            signed && profileComplete ? (
              <DashboardLayout />
            ) : (
              <Navigate to={signed ? '/onboarding' : '/login'} replace />
            )
          }
        >
          <Route path="inicio" element={<HomePage />} />
          <Route path="dieta" element={<DietaPage />} />
          <Route path="treino" element={<TreinoPage />} />
          <Route path="evolucao" element={<EvolucaoPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="perfil" element={<PerfilPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
          <Route path="" element={<Navigate to="inicio" replace />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={signed ? (profileComplete ? '/dashboard/inicio' : '/onboarding') : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MetasProvider>
        <NutritionProvider>
          <ErrorBoundary>
            <AppRoutes />
            <ToastHost />
          </ErrorBoundary>
        </NutritionProvider>
      </MetasProvider>
    </AuthProvider>
  );
}
