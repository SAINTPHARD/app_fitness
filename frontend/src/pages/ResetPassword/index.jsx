import { useState } from 'react';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { mensagemErroAutenticacao } from '../../utils/authErrors';
import styles from '../Login/login.module.css';

const REGEX_SENHA_FORTE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const token = params.get('token') || '';

  async function enviar(event) {
    event.preventDefault();
    setErro('');
    if (!token) return setErro('Link de recuperação inválido ou incompleto.');
    if (!REGEX_SENHA_FORTE.test(senha)) return setErro('A senha deve ter no mínimo 8 caracteres, com letras e números.');
    if (senha !== confirmacao) return setErro('As senhas não coincidem.');
    setEnviando(true);
    try {
      const resposta = await authService.resetPassword(token, senha);
      setSucesso(resposta?.message || 'Senha redefinida com sucesso.');
      setSenha('');
      setConfirmacao('');
    } catch (error) {
      setErro(mensagemErroAutenticacao(error));
    } finally {
      setEnviando(false);
    }
  }

  return <main className={styles.loginContainer}>
    <section className={styles.welcomeSection} aria-hidden="true">
      <div className={styles.welcomeContent}><span className={styles.logoIcon}><Zap /></span><h1>System Fitness</h1></div>
    </section>
    <section className={styles.formSection}>
      <div className={styles.card}>
        <h1 className={styles.formTitle}>Defina uma nova senha</h1>
        <p className={styles.formSubtitle}>Use ao menos 8 caracteres, incluindo uma letra e um número.</p>
        <form className={styles.form} onSubmit={enviar}>
          {[['Nova senha', senha, setSenha], ['Confirmar nova senha', confirmacao, setConfirmacao]].map(([rotulo, valor, setter]) =>
            <label className={styles.field} key={rotulo}><span className={styles.label}>{rotulo}</span>
              <span className={styles.passwordField}><input className={styles.input} type={mostrar ? 'text' : 'password'}
                autoComplete="new-password" value={valor} onChange={(e) => setter(e.target.value)}
                aria-describedby={erro ? 'reset-error' : undefined} disabled={enviando || Boolean(sucesso)} required />
                <button type="button" className={styles.passwordToggle} onClick={() => setMostrar((v) => !v)}
                  aria-label={mostrar ? 'Ocultar senhas' : 'Mostrar senhas'}>{mostrar ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button>
              </span></label>)}
          {erro && <p id="reset-error" className={styles.error} role="alert">{erro}</p>}
          <p className={styles.feedback} aria-live="polite">{sucesso}</p>
          {!sucesso && <button className={styles.submitBtn} disabled={enviando} aria-busy={enviando}>{enviando ? 'Salvando…' : 'Redefinir senha'}</button>}
          {sucesso && <Link className={styles.backButton} to="/login">Entrar com a nova senha</Link>}
        </form>
      </div>
    </section>
  </main>;
}
