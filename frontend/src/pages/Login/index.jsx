import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import styles from './login.module.css';

export default function LoginPage() {
  // Estado para alternar entre o formulário de Login (false) e Cadastro (true)
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Atualiza os campos do formulário dinamicamente
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }
    
    try {
      if (isSignUp) {
        // 1. Cadastra o usuário
        await authService.register(formData);
        
        // 2. LOGO APÓS cadastrar, faz o login automático com as mesmas credenciais
        await authService.login(formData.email, formData.password);
        
        // 3. Redireciona para o Dashboard
        navigate('/dashboard/inicio');
      } else {
        // Login normal
        await authService.login(formData.email, formData.password);
        navigate('/dashboard/inicio');
      }
    } catch (err) {
      alert("Erro ao entrar: " + err.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      
      {/* SEÇÃO ESQUERDA: Aba Home / Boas-vindas (Estilo CalAI) */}
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <span className={styles.logoIcon}>⚡</span>
          <h1>System Fitness</h1>
          <p>Conquiste a sua melhor versão. Monitorize os seus treinos, calcule os seus macros e alcance hipertrofia com inteligência.</p>
          <div className={styles.featuresBadge}>
            <span>✓ Plano Nutricional</span>
            <span>✓ Fichas de Treino</span>
            <span>✓ Gráficos de Progresso</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO DIREITA: Aba de Acesso Dinâmica (Login / Cadastro) */}
      <div className={styles.formSection}>
        <div className={styles.card}>
          <h2 className={styles.formTitle}>
            {isSignUp ? 'Crie a sua conta' : 'Bem-vindo de volta'}
          </h2>
          <p className={styles.formSubtitle}>
            {isSignUp ? 'Preencha os dados abaixo para começar.' : 'Insira as suas credenciais para aceder ao painel.'}
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {isSignUp && (
              <div className={styles.rowInputs}>
                <input className={styles.input} name="firstName" placeholder="Nome" onChange={handleInputChange} required />
                <input className={styles.input} name="lastName" placeholder="Sobrenome" onChange={handleInputChange} required />
              </div>
            )}
            
            <input className={styles.input} name="email" type="email" placeholder="Endereço de Email" onChange={handleInputChange} required />

            <input className={styles.input} name="password" type="password" placeholder="Palavra-passe" onChange={handleInputChange} required />
            
            {isSignUp && (
              <input className={styles.input} name="confirmPassword" type="password" placeholder="Confirmar Palavra-passe" onChange={handleInputChange} required />
            )}

            <button type="submit" className={styles.submitBtn}>
              {isSignUp ? 'Finalizar Cadastro' : 'Entrar no Sistema'}
            </button>
          </form>
          
          {/* Link de alternância entre as duas abas internas */}
          <p className={styles.toggleText}>
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <span className={styles.toggleLink} onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? ' Inicie sessão aqui' : ' Registe-se agora'}
            </span>
          </p>
        </div>
      </div>

    </div>
  );
}