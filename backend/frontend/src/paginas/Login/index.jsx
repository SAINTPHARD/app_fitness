import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../servicos/axiosConfig.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/auth/login', { email, senha });
      const { token, usuarioId } = res.data;
      if (token && usuarioId) {
        localStorage.setItem('token', token);
        localStorage.setItem('usuarioId', String(usuarioId));
        window.dispatchEvent(new Event('auth-change'));
        navigate('/dashboard');
      } else {
        setError('Resposta inválida do servidor.');
      }
    } catch (err) {
      console.error(err);
      setError('Login falhou. Verifique seu email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <h2>Login</h2>
      <form className="form" onSubmit={login}>
        <label>
          Email
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="seu@email.com"
            required
          />
        </label>
        <label>
          Senha
          <input
            value={senha}
            onChange={e => setSenha(e.target.value)}
            type="password"
            placeholder="Senha"
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      </form>
      <p style={{ marginTop: '18px' }}>
        Ainda não tem conta? <Link to="/onboarding">Cadastre-se aqui</Link>.
      </p>
    </section>
  );
}
