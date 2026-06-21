import React, { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Componente de Tela de Login para o Sistema Fitness.
 */
export function Login() {
  // Estados para capturar os inputs do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  /**
   * Manipula o envio do formulário de login.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Chama o serviço que configuramos com o Axios
      const data = await authService.login(email, senha);
      alert('Login efetuado com sucesso! Token armazenado.');
      console.log('Dados do Atleta:', data);
      
      // Aqui depois faremos o redirecionamento para o Dashboard (Dieta/Treino)
    } catch (err) {
      // Captura a mensagem tratada pelo seu GlobalExceptionHandler do Java
      if (err.mensagens && err.mensagens.length > 0) {
        setErro(err.mensagens.join(' | '));
      } else {
        setErro(err.error || 'Falha ao autenticar. Verifique suas credenciais.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Área do Atleta - Login 🏋️‍♂️</h2>
      
      {erro && <div style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>{erro}</div>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>E-mail:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={carregando}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {carregando ? 'Autenticando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}