import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './componentes/Header/index.jsx';
import PrivateRoute from './componentes/PrivateRoute/index.jsx';
import WelcomePage from './paginas/Welcome/index.jsx';
import OnboardingPage from './paginas/Onboarding/index.jsx';
import LoginPage from './paginas/Login/index.jsx';
import DashboardPage from './paginas/Dashboard/index.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
