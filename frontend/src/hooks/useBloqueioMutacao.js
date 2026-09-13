import { useCallback, useRef } from 'react';

/** Impede que dois eventos do mesmo controle iniciem a mesma mutação antes do re-render. */
export function useBloqueioMutacao() {
  const emVoo = useRef(new Set());

  return useCallback(async (chave, operacao) => {
    if (emVoo.current.has(chave)) return undefined;
    emVoo.current.add(chave);
    try {
      return await operacao();
    } finally {
      emVoo.current.delete(chave);
    }
  }, []);
}
