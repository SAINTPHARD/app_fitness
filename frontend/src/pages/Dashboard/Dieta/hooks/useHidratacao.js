import { useCallback, useEffect, useMemo } from 'react';
import { useNutrition } from '../../../../context/NutritionContext';
import { useMetas } from './useMetas';

export function useHidratacao(dataSelecionadaISO) {
  const nutrition = useNutrition();
  const { metas, atualizarMetas } = useMetas();
  const registros = nutrition.obterRegistrosAguaDaData(dataSelecionadaISO);
  const status = nutrition.obterStatusAguaDaData(dataSelecionadaISO);
  const metaMl = metas.aguaMl;

  useEffect(() => {
    nutrition.carregarAgua(dataSelecionadaISO);
  }, [nutrition, dataSelecionadaISO]);

  const totalMl = useMemo(
    () => registros.reduce((total, registro) => total + (Number(registro.quantidadeMl) || 0), 0),
    [registros]
  );

  const adicionarAgua = useCallback(
    (quantidadeMl) => nutrition.adicionarAguaMl(dataSelecionadaISO, quantidadeMl),
    [nutrition, dataSelecionadaISO]
  );

  const removerRegistro = useCallback(
    (idRegistro) => nutrition.removerRegistroAgua(dataSelecionadaISO, idRegistro),
    [nutrition, dataSelecionadaISO]
  );

  const definirMetaMl = useCallback(
    (novoValorMl) => atualizarMetas({ ...metas, aguaMl: Number(novoValorMl) }),
    [atualizarMetas, metas]
  );

  return {
    registros,
    totalMl,
    metaMl,
    loading: status.loading,
    erro: status.erro,
    adicionarAgua,
    removerRegistro,
    definirMetaMl,
    recarregar: () => nutrition.carregarAgua(dataSelecionadaISO, { forcar: true }),
  };
}
