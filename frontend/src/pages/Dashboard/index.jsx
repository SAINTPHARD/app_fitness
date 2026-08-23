import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './Dashboard.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  return (
    <div className="dashboard">
      <Sidebar onLogout={logout} abertoNoMobile={menuMobileAberto} aoFecharNoMobile={() => setMenuMobileAberto(false)} />
      <div className="main">
        <Header user={user} onLogout={logout} aoAbrirMenu={() => setMenuMobileAberto(true)} />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
