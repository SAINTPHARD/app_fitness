import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../servicos/axiosConfig.js';

export default function OnboardingPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [idade, setIdade] = useState('25');
  const [peso, setPeso] = useState('70');
  const [altura, setAltura] = useState('175');
  const [sexo, setSexo] = useState('M');
  const [objetivo, setObjetivo] = useState('EMAGRECER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cadastrar = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        nome,
        email,
        senha,
        idade: parseInt(idade, 10),
        peso: parseFloat(peso),
        altura: parseFloat(altura),
        sexo: sexo.charAt(0),
        objetivo,
      };

      const res = await axios.post('/usuarios', payload);
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
      setError('Erro ao cadastrar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <h2>Cadastro</h2>
      <form className="form" onSubmit={cadastrar}>
        <label>
          Nome
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo" required />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="seu@email.com" required />
        </label>
        <label>
          Senha
          <input value={senha} onChange={e => setSenha(e.target.value)} type="password" placeholder="Senha" required />
        </label>
        <div className="grid-two">
          <label>
            Idade
            <input value={idade} onChange={e => setIdade(e.target.value)} type="number" min="1" required />
          </label>
          <label>
            Peso (kg)
            <input value={peso} onChange={e => setPeso(e.target.value)} type="number" min="1" step="0.1" required />
          </label>
        </div>
        <div className="grid-two">
          <label>
            Altura (cm)
            <input value={altura} onChange={e => setAltura(e.target.value)} type="number" min="1" step="0.1" required />
          </label>
          <label>
            Sexo
            <select value={sexo} onChange={e => setSexo(e.target.value)}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </label>
        </div>
        <label>
          Objetivo
          <select value={objetivo} onChange={e => setObjetivo(e.target.value)}>
            <option value="EMAGRECER">Emagrecer</option>
            <option value="MANTER">Manter</option>
            <option value="HIPERTROFIA">Hipertrofia</option>
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
      </form>
    </section>
  );
}
