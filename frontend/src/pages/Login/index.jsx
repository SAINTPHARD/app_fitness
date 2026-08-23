import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { notificarErro } from '../../utils/notificacoes';
import ToastBoasVindas from '../../components/ui/ToastBoasVindas';
import styles from './login.module.css';

// Tempo que o toast de boas-vindas fica na tela antes do redirecionamento.
const DURACAO_BOAS_VINDAS_MS = 2200;

const FORMULARIO_VAZIO = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function LoginPage() {
  // Estado para alternar entre o formulário de Login (false) e Cadastro (true)
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState(FORMULARIO_VAZIO);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();
  // `login` do contexto (e não `authService.login` direto): é ele que marca o
  // usuário como autenticado, sem isso o `signed` do App continua false e a
  // rota protegida devolve o usuário para cá.
  const { login, reiniciarPerfilCompleto } = useAuth();

  const timeoutRef = useRef(null);

  // Cancela o redirecionamento pendente se a tela sair antes da hora.
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Atualiza os campos do formulário dinamicamente
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const alternarModo = () => {
    setIsSignUp((prev) => !prev);
    setMensagemSucesso('');
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  };

  const finalizarCadastroComFalhaNoLogin = (erro) => {
    clearTimeout(timeoutRef.current);
    setMensagemSucesso('');
    setEnviando(false);
    setIsSignUp(false);
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    notificarErro(
      `Conta criada, mas não foi possível entrar automaticamente${
        erro?.message ? `: ${erro.message}` : '.'
      } Faça login com o e-mail e a senha que acabou de cadastrar.`,
    );
  };

  const cadastrar = async () => {
    const nome = `${formData.firstName} ${formData.lastName}`.trim();

    // 1. Cria a conta no backend (POST /usuarios via instância Axios).
    await authService.register({
      nome,
      email: formData.email,
      password: formData.password,
    });

    // 2. Zera o marcador de perfil concluído — no localStorage E no estado
    //    do contexto. Ele é global (não é por usuário), então uma conta
    //    anterior usada neste mesmo browser faria o usuário novo pular o
    //    onboarding e cair direto num dashboard sem dados.
    reiniciarPerfilCompleto();

    // 3. Mostra o toast de boas-vindas com o primeiro nome informado.
    const primeiroNome = formData.firstName.trim() || nome || 'atleta';
    setMensagemSucesso(`🎉 Bem-vindo ao System Fitness, ${primeiroNome}! Conta criada com sucesso.`);

    // 4. Só autentica depois do toast: assim que o contexto marca o usuário
    //    como logado a tela é desmontada pelo redirecionamento da rota.
    timeoutRef.current = setTimeout(async () => {
      try {
        await login(formData.email, formData.password);
        navigate('/onboarding', { replace: true });
      } catch (erroLogin) {
        finalizarCadastroComFalhaNoLogin(erroLogin);
      }
    }, DURACAO_BOAS_VINDAS_MS);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (enviando) return;

    if (isSignUp && formData.password !== formData.confirmPassword) {
      notificarErro('As senhas não coincidem!');
      return;
    }

    setEnviando(true);

    try {
      if (isSignUp) {
        await cadastrar();
        // `enviando` continua true de propósito: o botão fica travado durante
        // o toast, até o redirecionamento acontecer.
        return;
      }

      await login(formData.email, formData.password);
      // O App decide o destino final pela guarda de rota; aqui só saímos da
      // tela de login para o painel.
      navigate('/dashboard/inicio', { replace: true });
    } catch (err) {
      notificarErro(`Erro ao entrar: ${err?.message || 'tente novamente em instantes.'}`);
      setEnviando(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <ToastBoasVindas mensagem={mensagemSucesso} duracaoMs={DURACAO_BOAS_VINDAS_MS} />

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
                <input
                  className={styles.input}
                  name="firstName"
                  placeholder="Nome"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={enviando}
                  required
                />
                <input
                  className={styles.input}
                  name="lastName"
                  placeholder="Sobrenome"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={enviando}
                  required
                />
              </div>
            )}

            <input
              className={styles.input}
              name="email"
              type="email"
              placeholder="Endereço de Email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={enviando}
              required
            />

            <input
              className={styles.input}
              name="password"
              type="password"
              placeholder="Palavra-passe"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={formData.password}
              onChange={handleInputChange}
              disabled={enviando}
              required
            />

            {isSignUp && (
              <input
                className={styles.input}
                name="confirmPassword"
                type="password"
                placeholder="Confirmar Palavra-passe"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={enviando}
                required
              />
            )}

            <button type="submit" className={styles.submitBtn} disabled={enviando}>
              {enviando
                ? isSignUp
                  ? 'Criando a sua conta…'
                  : 'Entrando…'
                : isSignUp
                  ? 'Finalizar Cadastro'
                  : 'Entrar no Sistema'}
            </button>
          </form>

          {/* Link de alternância entre as duas abas internas */}
          <p className={styles.toggleText}>
            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            <button type="button" className={styles.toggleLink} onClick={alternarModo} disabled={enviando}>
              {isSignUp ? ' Inicie sessão aqui' : ' Registe-se agora'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
