import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const CHAVE_PERFIL_COMPLETO = 'profile_complete';
const CHAVE_NOME = 'userName';
const CHAVE_EMAIL = 'userEmail';

function lerLocal(chave) {
  try {
    return window.localStorage.getItem(chave);
  } catch {
    return null;
  }
}

const AuthContext = createContext({
  user: null,
  signed: false,
  loading: true,
  autenticando: false,
  perfilCompleto: false,
  error: null,
  login: async () => {},
  logout: () => {},
  marcarPerfilCompleto: () => {},
  reiniciarPerfilCompleto: () => {},
  sincronizarPerfil: async () => {},
  definirNomeUsuario: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `loading` cobre APENAS a checagem inicial da sessão guardada. O App usa
  // esse flag para segurar a árvore de rotas antes de saber se há sessão.
  const [loading, setLoading] = useState(true);
  // O login em andamento tem flag próprio: se ele mexesse em `loading`, o
  // App trocaria as rotas pela tela "Carregando…", desmontando o Router no
  // meio do fluxo e invalidando o `navigate()` que vem logo depois.
  const [autenticando, setAutenticando] = useState(false);
  const [error, setError] = useState(null);

  // Antes isso era lido direto do localStorage dentro do App, a cada render.
  // Como escrita em localStorage não dispara re-render, o App continuava
  // enxergando `false` depois que o Onboarding concluía — a rota protegida
  // devolvia o usuário para /onboarding, que remontava no passo 1. Era esse
  // o "loop do onboarding". Agora o valor é estado do React.
  const [perfilCompleto, setPerfilCompleto] = useState(
    () => lerLocal(CHAVE_PERFIL_COMPLETO) === 'true',
  );

  const definirNomeUsuario = useCallback((nome) => {
    const nomeLimpo = String(nome ?? '').trim();
    if (!nomeLimpo) return;

    try {
      window.localStorage.setItem(CHAVE_NOME, nomeLimpo);
    } catch {
      /* modo privado / storage bloqueado: o nome segue só em memória */
    }
    setUser((atual) => (atual ? { ...atual, nome: nomeLimpo } : atual));
  }, []);

  /**
   * Busca o perfil real em /usuarios/me para ter o NOME cadastrado — o
   * token e o retorno do login só trazem o e-mail, e a interface não deve
   * mostrar e-mail em lugar nenhum. Falha em silêncio: se a API estiver
   * fria ou fora do ar, seguimos com o nome guardado localmente.
   */
  const sincronizarPerfil = useCallback(async (emailFallback) => {
    try {
      const { data } = await api.get('/usuarios/me', { silenciarErroGlobal: true });
      const nome = String(data?.nome ?? '').trim();
      const email = data?.email || emailFallback || lerLocal(CHAVE_EMAIL) || '';

      if (nome) {
        try {
          window.localStorage.setItem(CHAVE_NOME, nome);
        } catch {
          /* ignora storage indisponível */
        }
      }

      setUser({ nome: nome || lerLocal(CHAVE_NOME) || null, email });
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const token = authService.getToken();
    const email = lerLocal(CHAVE_EMAIL);

    if (!token || !email) {
      setLoading(false);
      return;
    }

    // Pinta a sessão imediatamente com o que já está salvo e só depois
    // confirma com o backend. Sem isso, um cold start de 30s deixaria o app
    // preso na tela "Carregando…" antes de mostrar qualquer coisa.
    setUser({ nome: lerLocal(CHAVE_NOME) || null, email });
    setLoading(false);
    sincronizarPerfil(email);
  }, [sincronizarPerfil]);

  const login = useCallback(
    async (email, password) => {
      setAutenticando(true);
      try {
        const data = await authService.login(email, password);
        const emailFinal = data?.email || email;

        setUser({ nome: lerLocal(CHAVE_NOME) || null, email: emailFinal });
        setError(null);

        // Sem await: o nome chega assim que a API responder, sem segurar o
        // redirecionamento para o dashboard.
        sincronizarPerfil(emailFinal);

        return data;
      } catch (err) {
        setError(err?.message || 'Erro de autenticação');
        throw err;
      } finally {
        setAutenticando(false);
      }
    },
    [sincronizarPerfil],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setPerfilCompleto(false);
  }, []);

  const marcarPerfilCompleto = useCallback(() => {
    try {
      window.localStorage.setItem(CHAVE_PERFIL_COMPLETO, 'true');
    } catch {
      /* ignora storage indisponível */
    }
    setPerfilCompleto(true);
  }, []);

  const reiniciarPerfilCompleto = useCallback(() => {
    try {
      window.localStorage.removeItem(CHAVE_PERFIL_COMPLETO);
    } catch {
      /* ignora storage indisponível */
    }
    setPerfilCompleto(false);
  }, []);

  const signed = Boolean(user && authService.getToken());

  const value = useMemo(
    () => ({
      user,
      signed,
      loading,
      autenticando,
      perfilCompleto,
      error,
      login,
      logout,
      marcarPerfilCompleto,
      reiniciarPerfilCompleto,
      sincronizarPerfil,
      definirNomeUsuario,
    }),
    [
      user,
      signed,
      loading,
      autenticando,
      perfilCompleto,
      error,
      login,
      logout,
      marcarPerfilCompleto,
      reiniciarPerfilCompleto,
      sincronizarPerfil,
      definirNomeUsuario,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
}
