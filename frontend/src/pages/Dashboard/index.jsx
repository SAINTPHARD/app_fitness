import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './Dashboard.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <Sidebar onLogout={logout} />
      <div className="main">
        <Header user={user} onLogout={logout} />
        <div className="content">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}
