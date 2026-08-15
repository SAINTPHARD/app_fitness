import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fitnessApi } from '../services/fitnessApi';
import { useAuth } from './AuthContext';

export const METAS_PADRAO = {
  calorias: 2000,
  proteinas: 150,
  carboidratos: 250,
  gorduras: 65,
  aguaMl: 2000,
};

const MetasContext = createContext(null);

function normalizarMetas(metas) {
  return {
    calorias: Number(metas?.calorias ?? metas?.metaCalorias ?? METAS_PADRAO.calorias),
    proteinas: Number(metas?.proteinas ?? metas?.metaProteinas ?? METAS_PADRAO.proteinas),
    carboidratos: Number(metas?.carboidratos ?? metas?.metaCarboidratos ?? METAS_PADRAO.carboidratos),
    gorduras: Number(metas?.gorduras ?? metas?.metaGorduras ?? METAS_PADRAO.gorduras),
    aguaMl: Number(metas?.aguaMl ?? metas?.metaAguaMl ?? METAS_PADRAO.aguaMl),
  };
}

export function MetasProvider({ children }) {
  const { signed } = useAuth();
  const [metas, setMetas] = useState(METAS_PADRAO);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregarMetas = useCallback(async () => {
    setLoading(true);
    setErro('');

    try {
      const dados = await fitnessApi.getMetas();
      setMetas(normalizarMetas(dados));
    } catch (error) {
      console.error('Erro ao carregar metas do usuário', error);
      setErro('Não foi possível carregar suas metas. Usando valores padrão até a conexão voltar.');
      setMetas(METAS_PADRAO);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!signed) {
      setMetas(METAS_PADRAO);
      setLoading(false);
      return;
    }

    carregarMetas();
  }, [carregarMetas, signed]);

  const atualizarMetas = useCallback(async (novasMetas) => {
    const metasAnteriores = metas;
    const normalizadas = normalizarMetas(novasMetas);

    setSalvando(true);
    setErro('');
    setMetas(normalizadas);

    try {
      const salvas = await fitnessApi.updateMetas(normalizadas);
      const metasPersistidas = normalizarMetas(salvas);
      setMetas(metasPersistidas);
      return metasPersistidas;
    } catch (error) {
      console.error('Erro ao atualizar metas', error);
      setMetas(metasAnteriores);
      setErro('Não foi possível salvar suas metas. Os valores anteriores foram preservados.');
      throw error;
    } finally {
      setSalvando(false);
    }
  }, [metas]);

  const valor = useMemo(
    () => ({ metas, loading, salvando, erro, atualizarMetas, recarregarMetas: carregarMetas }),
    [atualizarMetas, carregarMetas, erro, loading, metas, salvando]
  );

  return <MetasContext.Provider value={valor}>{children}</MetasContext.Provider>;
}

export function useMetasContext() {
  const contexto = useContext(MetasContext);
  if (!contexto) {
    throw new Error('useMetasContext deve ser usado dentro de MetasProvider.');
  }
  return contexto;
}
