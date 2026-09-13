import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../servicos/axiosConfig.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const usuarioId = localStorage.getItem('usuarioId');

  useEffect(() => {
    if (!usuarioId) {
      navigate('/login');
      return;
    }

    axios
      .get(`/usuarios/${usuarioId}/dashboard`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError('Não foi possível carregar o dashboard.');
      })
      .finally(() => setLoading(false));
  }, [navigate, usuarioId]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioId');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  if (loading) {
    return <div className="page">Carregando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="page">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  if (!data) {
    return <div className="page">Nenhum dado disponível.</div>;
  }

  const percentual = Math.round(((data.caloriasConsumidas / data.metaCalorias) * 100) || 0);

  return (
    <section className="page">
      <div className="page-header">
        <h2>Dashboard</h2>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>
      <div className="card">
        <p><strong>Meta diária:</strong> {data.metaCalorias.toFixed(0)} kcal</p>
        <p><strong>Consumido:</strong> {data.caloriasConsumidas.toFixed(0)} kcal</p>
        <p><strong>Restante:</strong> {data.restante.toFixed(0)} kcal</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, percentual)}%` }} />
        </div>
        <p><strong>Avanço:</strong> {percentual}%</p>
      </div>

      <div className="card">
        <h3>Macros alvo</h3>
        <p>Proteínas: {data.macrosTarget?.proteinas ?? 0} g</p>
        <p>Carboidratos: {data.macrosTarget?.carboidratos ?? 0} g</p>
        <p>Gorduras: {data.macrosTarget?.gorduras ?? 0} g</p>
      </div>
    </section>
  );
}
