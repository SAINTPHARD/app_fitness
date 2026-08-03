import { useCallback } from 'react';
import { useNutrition } from '../../../../context/NutritionContext';

export function useHidratacao(dataSelecionadaISO) {
  const nutrition = useNutrition();
  const copos = nutrition.hidratacaoPorData[dataSelecionadaISO] || 0;

  const alternarCopo = useCallback(
    (indiceClicado) => nutrition.alternarCopo(dataSelecionadaISO, indiceClicado),
    [nutrition, dataSelecionadaISO]
  );

  const adicionarCopo = useCallback(
    () => nutrition.adicionarCopo(dataSelecionadaISO),
    [nutrition, dataSelecionadaISO]
  );

  const definirConsumoMl = useCallback(
    (novoTotalMl) => nutrition.definirConsumoAguaMl(dataSelecionadaISO, novoTotalMl),
    [nutrition, dataSelecionadaISO]
  );

  return {
    copos,
    metaCopos: nutrition.metaCopos,
    totalMl: copos * nutrition.mlPorCopo,
    metaMl: nutrition.metaMl,
    alternarCopo,
    adicionarCopo,
    definirConsumoMl,
    definirMetaMl: nutrition.definirMetaMl,
  };
}
