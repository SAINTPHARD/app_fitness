import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <section className="page">
      <h2>Bem-vindo ao AppFitness</h2>
      <p>Use os botões abaixo para entrar na sua conta ou criar um novo perfil.</p>
      <div className="button-group">
        <Link className="button-link" to="/login">Entrar</Link>
        <Link className="button-link button-secondary" to="/onboarding">Cadastrar</Link>
      </div>
    </section>
  );
}
