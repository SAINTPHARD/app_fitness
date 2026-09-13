import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { metasService } from '../services/dominio/metasService';
import { mapearErroApi } from '../utils/erroApi';
import { METAS_PADRAO, normalizarMetas } from './metasConfig';
import { MetasContext } from './metasContextBase';
import { useAuth } from '../hooks/useAuth';

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
      const dados = await metasService.buscar();
      setMetas(normalizarMetas(dados));
    } catch (error) {
      console.error('Erro ao carregar metas do usuário', error);
      setErro(mapearErroApi(error, 'carregar suas metas').mensagem);
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
      const salvas = await metasService.atualizar(normalizadas);
      const metasPersistidas = normalizarMetas(salvas);
      setMetas(metasPersistidas);
      return metasPersistidas;
    } catch (error) {
      console.error('Erro ao atualizar metas', error);
      setMetas(metasAnteriores);
      setErro(`${mapearErroApi(error, 'salvar suas metas').mensagem} Os valores anteriores foram preservados.`);
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

MetasProvider.propTypes = { children: PropTypes.node.isRequired };
