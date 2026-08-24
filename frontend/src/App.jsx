import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NutritionProvider } from './context/NutritionContext';
import { MetasProvider } from './context/MetasContext';
import ToastHost from './components/ui/Toast';
import TelaCarregamento from './components/ui/TelaCarregamento';
import ErrorBoundary from './components/ErrorBoundary';
const LoginPage = lazy(() => import('./pages/Login'));
const OnboardingPage = lazy(() => import('./pages/Onboarding'));
const DashboardLayout = lazy(() => import('./pages/Dashboard'));
const HomePage = lazy(() => import('./pages/Dashboard/Home'));
const DietaPage = lazy(() => import('./pages/Dashboard/Dieta/PainelDieta'));
const TreinoPage = lazy(() => import('./pages/Dashboard/Treino'));
const EvolucaoPage = lazy(() => import('./pages/Dashboard/Evolucao'));
const RelatoriosPage = lazy(() => import('./pages/Dashboard/Relatorios'));
const PerfilPage = lazy(() => import('./pages/Dashboard/Perfil'));
const ConfiguracoesPage = lazy(() => import('./pages/Dashboard/Configuracoes'));

function AppRoutes() {
  // `perfilCompleto` vem do contexto (estado do React), e não mais de uma
  // leitura direta do localStorage a cada render: escrita em localStorage
  // não dispara re-render, então o valor antigo ficava congelado aqui e a
  // guarda de /dashboard jogava o usuário de volta para o onboarding.
  const { signed, loading, perfilCompleto: profileComplete } = useAuth();

  if (loading) {
    return <TelaCarregamento mensagem="Preparando o seu painel…" />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<TelaCarregamento mensagem="Carregando página…" />}>
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
      </Suspense>
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
