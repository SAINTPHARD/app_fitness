import { useEffect, useState } from 'react';

const CHAVE_ARMAZENAMENTO = 'tema';

function lerTemaSalvo() {
  if (typeof window === 'undefined') return 'light';

  try {
    return window.localStorage.getItem(CHAVE_ARMAZENAMENTO) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Hook compartilhado de tema claro/escuro. Aplica `data-theme` no `<html>`
 * (fonte única usada tanto pelas variáveis CSS globais em `index.css`
 * quanto pela estratégia `darkMode: 'selector'` do Tailwind), e persiste a
 * escolha do usuário em localStorage.
 */
export function useTema() {
  const [tema, setTema] = useState(lerTemaSalvo);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, tema);
  }, [tema]);

  const alternarTema = () => {
    setTema((anterior) => (anterior === 'dark' ? 'light' : 'dark'));
  };

  return { tema, alternarTema, ehEscuro: tema === 'dark' };
}
