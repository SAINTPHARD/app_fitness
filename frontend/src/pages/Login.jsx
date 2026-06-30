import React, { useState } from 'react';
import exercicioImage from '../assets/exercicio.png';
import planoImage from '../assets/plano.png';
import muscleImage from '../assets/silhueta-de-braco-musculoso.png';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  
  // Estado para alternar entre as Boas-Vindas e o Formulário de Login
  const [showForm, setShowForm] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Envia as credenciais limpando espaços vazios
      await login(email.trim(), password);
    } catch (err) {
      console.error('Erro retornado do STS:', err);

      if (err?.message) {
        setError(err.message);
      } else if (err?.data?.message) {
        setError(err.data.message);
      } else {
        setError('Não foi possível autenticar. Confira o e-mail e a senha cadastrados.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 1. TELA DE BOAS-VINDAS (Aparece primeiro)
  if (!showForm) {
    return (
      <main style={styles.welcomePage}>
        <section style={styles.welcomeShell}>
          <div style={styles.welcomeContent}>
            <div style={styles.brandRow}>
              <img alt="AppFitness" src={muscleImage} style={styles.brandImage} />
              <span style={styles.badge}>System Fitness</span>
            </div>

            <h1 style={styles.welcomeTitle}>Bem-vindo ao AppFitness & Dieta</h1>
            <p style={styles.welcomeSubtitle}>
              Uma área de atleta para organizar treinos de hipertrofia, acompanhar calorias e manter seus macronutrientes
              sob controle com uma experiência simples e objetiva.
            </p>

            <div style={styles.welcomeActions}>
              <button onClick={() => setShowForm(true)} style={styles.heroButton} type="button">
                Acessar Minha Área de Atleta
              </button>
              <span style={styles.helperText}>Treinos, dieta e evolução no mesmo painel.</span>
            </div>
          </div>

          <div style={styles.assetBoard}>
            <article style={styles.assetCardLarge}>
              <div style={styles.assetTextBlock}>
                <span style={styles.cardEyebrow}>Módulo de Treinos</span>
                <h2 style={styles.assetTitle}>Séries diárias com foco em evolução.</h2>
                <p style={styles.assetText}>Visualize exercícios, volume, intensidade e planejamento da semana.</p>
              </div>
              <img alt="Exercícios do atleta" src={exercicioImage} style={styles.exerciseImage} />
            </article>

            <div style={styles.assetCardsRow}>
              <article style={styles.assetCardSmall}>
                <img alt="Plano nutricional" src={planoImage} style={styles.smallAssetImage} />
                <div>
                  <span style={styles.cardEyebrow}>Minha Dieta</span>
                  <p style={styles.smallCardText}>Calorias, proteínas, carboidratos e gorduras para hipertrofia.</p>
                </div>
              </article>

              <article style={styles.metricCard}>
                <span style={styles.metricValue}>2.850</span>
                <span style={styles.metricLabel}>kcal diárias</span>
                <span style={styles.metricHint}>Resumo nutricional do atleta</span>
              </article>
            </div>
          </div>
        </section>
      </main>
    );
  }

  // 2. TELA DO FORMULÁRIO DE LOGIN
  return (
    <main style={styles.page}>
      <section style={styles.panel}>
        <button onClick={() => setShowForm(false)} style={styles.backButton} type="button">
          ⬅ Voltar para o início
        </button>

        <div style={styles.brandBlock}>
          <span style={styles.badge}>Autenticação Segura</span>
          <h1 style={{ ...styles.title, fontSize: 26 }}>Entrar no Sistema</h1>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="robedson@pucrio1.com"
            required
            style={styles.input}
            type="email"
            value={email}
          />

          <label style={styles.label} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            required
            style={styles.input}
            type="password"
            value={password}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button disabled={submitting} style={submitting ? styles.buttonDisabled : styles.button} type="submit">
            {submitting ? 'Validando Atleta...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    alignItems: 'center',
    background: '#eef2f7',
    display: 'flex',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: 24,
  },
  welcomePage: {
    background: '#eef2f7',
    color: '#0f172a',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    minHeight: '100vh',
    width: '100%',
  },
  welcomeShell: {
    alignItems: 'center',
    display: 'grid',
    gap: 36,
    gridTemplateColumns: 'minmax(320px, 0.95fr) minmax(360px, 1.05fr)',
    margin: '0 auto',
    maxWidth: 1240,
    minHeight: '100vh',
    padding: 'clamp(24px, 5vw, 72px)',
    width: '100%',
  },
  welcomeContent: {
    display: 'grid',
    gap: 22,
  },
  brandRow: {
    alignItems: 'center',
    display: 'flex',
    gap: 12,
  },
  brandImage: {
    height: 54,
    objectFit: 'contain',
    width: 54,
  },
  welcomeTitle: {
    color: '#0f172a',
    fontSize: 'clamp(38px, 6vw, 70px)',
    lineHeight: 1,
    margin: 0,
    maxWidth: 760,
  },
  welcomeSubtitle: {
    color: '#475569',
    fontSize: 18,
    lineHeight: 1.65,
    margin: 0,
    maxWidth: 680,
  },
  welcomeActions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },
  heroButton: {
    background: '#0f766e',
    border: 0,
    borderRadius: 8,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 800,
    padding: '16px 22px',
  },
  helperText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: 700,
  },
  assetBoard: {
    display: 'grid',
    gap: 16,
  },
  assetCardLarge: {
    alignItems: 'center',
    background: '#ffffff',
    border: '1px solid #dbe3ee',
    borderRadius: 8,
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
    display: 'grid',
    gap: 18,
    gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 0.75fr)',
    minHeight: 330,
    overflow: 'hidden',
    padding: 28,
  },
  assetTextBlock: {
    display: 'grid',
    gap: 12,
  },
  cardEyebrow: {
    color: '#0f766e',
    fontSize: 12,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  assetTitle: {
    color: '#0f172a',
    fontSize: 32,
    lineHeight: 1.08,
    margin: 0,
  },
  assetText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 1.55,
    margin: 0,
  },
  exerciseImage: {
    filter: 'drop-shadow(0 18px 24px rgba(15, 23, 42, 0.18))',
    justifySelf: 'center',
    maxHeight: 230,
    maxWidth: '100%',
    objectFit: 'contain',
  },
  assetCardsRow: {
    display: 'grid',
    gap: 16,
    gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 0.65fr)',
  },
  assetCardSmall: {
    alignItems: 'center',
    background: '#ffffff',
    border: '1px solid #dbe3ee',
    borderRadius: 8,
    boxShadow: '0 18px 46px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    gap: 16,
    padding: 20,
  },
  smallAssetImage: {
    height: 74,
    objectFit: 'contain',
    width: 74,
  },
  smallCardText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.45,
    margin: '6px 0 0',
  },
  metricCard: {
    background: '#0f172a',
    borderRadius: 8,
    color: '#ffffff',
    display: 'grid',
    gap: 4,
    padding: 20,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1,
  },
  metricLabel: {
    color: '#99f6e4',
    fontSize: 13,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  metricHint: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 1.35,
    marginTop: 8,
  },
  panel: {
    background: '#ffffff',
    border: '1px solid #dbe3ee',
    borderRadius: 8,
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.12)',
    display: 'grid',
    gap: 24,
    maxWidth: 440,
    padding: 32,
    width: '100%',
  },
  brandBlock: {
    display: 'grid',
    gap: 8,
  },
  badge: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    lineHeight: 1.1,
    margin: 0,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
  featuresBlock: {
    display: 'grid',
    gap: 12,
    background: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
  },
  featureItem: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 1.4,
  },
  form: {
    display: 'grid',
    gap: 12,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: 700,
  },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    color: '#0f172a',
    fontSize: 15,
    outlineColor: '#0f766e',
    padding: '13px 14px',
    width: '100%',
    boxSizing: 'border-box'
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 1.4,
    padding: '12px 14px',
  },
  button: {
    background: '#0f766e',
    border: 0,
    borderRadius: 8,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 800,
    marginTop: 6,
    padding: '14px 18px',
    textAlign: 'center'
  },
  buttonDisabled: {
    background: '#94a3b8',
    border: 0,
    borderRadius: 8,
    color: '#ffffff',
    cursor: 'not-allowed',
    fontSize: 16,
    fontWeight: 800,
    marginTop: 6,
    padding: '14px 18px',
  },
  backButton: {
    background: 'none',
    border: 0,
    color: '#0f766e',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    textAlign: 'left',
    padding: 0,
    width: 'fit-content'
  }
};
