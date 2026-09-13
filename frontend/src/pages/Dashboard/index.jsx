import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './Dashboard.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const botaoMenuRef = useRef(null);

  return (
    <div className="dashboard">
      <Sidebar
        onLogout={logout}
        abertoNoMobile={menuMobileAberto}
        aoFecharNoMobile={() => setMenuMobileAberto(false)}
        referenciaGatilho={botaoMenuRef}
      />
      <div className="main">
        <Header user={user} onLogout={logout} aoAbrirMenu={() => setMenuMobileAberto(true)} referenciaBotaoMenu={botaoMenuRef} />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
