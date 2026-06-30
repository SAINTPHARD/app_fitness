import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <span style={styles.kicker}>System Fitness</span>
          <h1 style={styles.title}>Área do Atleta</h1>
        </div>

        <div style={styles.session}>
          <span style={styles.email}>{user?.email}</span>
          <button onClick={logout} style={styles.logoutButton} type="button">
            Sair
          </button>
        </div>
      </header>

      <section style={styles.grid}>
        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>📋 Meus Treinos</h2>
            <span style={styles.status}>Atualizado</span>
          </div>
          <p style={styles.cardText}>
            Acompanhe suas séries diárias, exercícios planejados, descanso entre séries e orientações para cada sessão.
          </p>
          <button style={styles.primaryAction} type="button">
            Ver Treinos
          </button>
        </article>

        <article style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>🍎 Minha Dieta</h2>
            <span style={styles.status}>Plano ativo</span>
          </div>
          <p style={styles.cardText}>
            Resumo nutricional diário para hipertrofia, com calorias e macros alinhados ao ganho de massa magra.
          </p>

          <div style={styles.macros}>
            <div style={styles.macroItem}>
              <strong style={styles.macroValue}>2.150</strong>
              <span style={styles.macroLabel}>kcal</span>
            </div>
            <div style={styles.macroItem}>
              <strong style={styles.macroValue}>165g</strong>
              <span style={styles.macroLabel}>proteínas</span>
            </div>
            <div style={styles.macroItem}>
              <strong style={styles.macroValue}>230g</strong>
              <span style={styles.macroLabel}>carboidratos</span>
            </div>
            <div style={styles.macroItem}>
              <strong style={styles.macroValue}>68g</strong>
              <span style={styles.macroLabel}>gorduras</span>
            </div>
          </div>

          <button style={styles.primaryAction} type="button">
            Ver Dieta
          </button>
        </article>
      </section>
    </main>
  );
}

const styles = {
  page: {
    background: '#f6f8fb',
    color: '#0f172a',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    minHeight: '100vh',
    padding: '28px clamp(18px, 4vw, 56px)',
  },
  header: {
    alignItems: 'center',
    display: 'flex',
    gap: 18,
    justifyContent: 'space-between',
    margin: '0 auto 28px',
    maxWidth: 1120,
  },
  kicker: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    lineHeight: 1.1,
    margin: '6px 0 0',
  },
  session: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-end',
  },
  email: {
    background: '#ffffff',
    border: '1px solid #dbe3ee',
    borderRadius: 8,
    color: '#334155',
    fontSize: 14,
    fontWeight: 700,
    padding: '10px 12px',
  },
  logoutButton: {
    background: '#111827',
    border: 0,
    borderRadius: 8,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 800,
    padding: '11px 16px',
  },
  grid: {
    display: 'grid',
    gap: 20,
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    margin: '0 auto',
    maxWidth: 1120,
  },
  card: {
    background: '#ffffff',
    border: '1px solid #dbe3ee',
    borderRadius: 8,
    boxShadow: '0 18px 46px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    minHeight: 280,
    padding: 24,
  },
  cardHeader: {
    alignItems: 'flex-start',
    display: 'flex',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 22,
    lineHeight: 1.2,
    margin: 0,
  },
  status: {
    background: '#ecfdf5',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    color: '#047857',
    fontSize: 12,
    fontWeight: 800,
    padding: '6px 8px',
    whiteSpace: 'nowrap',
  },
  cardText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
  },
  macros: {
    display: 'grid',
    gap: 10,
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  macroItem: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    display: 'grid',
    gap: 2,
    padding: 12,
  },
  macroValue: {
    color: '#0f172a',
    fontSize: 18,
  },
  macroLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  primaryAction: {
    background: '#0f766e',
    border: 0,
    borderRadius: 8,
    color: '#ffffff',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 800,
    marginTop: 'auto',
    padding: '13px 16px',
  },
};
