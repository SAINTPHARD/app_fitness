import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

function getIsLoggedIn() {
  return Boolean(localStorage.getItem('token'));
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn());

  useEffect(() => {
    const update = () => setIsLoggedIn(getIsLoggedIn());
    window.addEventListener('auth-change', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('auth-change', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return (
    <header className="app-header">
      <h1>AppFitness</h1>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/onboarding">Cadastro</Link>
        {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}
      </nav>
    </header>
  );
}
