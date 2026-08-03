import { useMemo } from 'react';
import { useMetas } from '../../Dieta/hooks/useMetas';
import { useRefeicoes } from '../../Dieta/hooks/useRefeicoes';
import { useHidratacao } from '../../Dieta/hooks/useHidratacao';
import { obterDataDeHojeISO } from '../../Dieta/utils/calendario';
import { calcularPercentual, calcularMetaDoDiaPercentual } from '../../Dieta/utils/progresso';
import { obterProximaRefeicao } from '../../Dieta/utils/proximaRefeicao';

/**
 * Reaproveita os hooks já existentes da página Dieta — fonte única de
 * verdade dos dados nutricionais — para montar o resumo do dia na Home, sem
 * duplicar a lógica de persistência/cálculo de macros que já vive lá.
 */
export function useResumoNutricionalHoje() {
  const hojeISO = obterDataDeHojeISO();

  const { metas } = useMetas();
  const { refeicoesDoDia, totaisDoDia, adicionarRefeicao, removerRefeicao } = useRefeicoes(hojeISO);
  const { copos, metaCopos, totalMl, metaMl } = useHidratacao(hojeISO);

  const percentuais = useMemo(
    () => ({
      calorias: calcularPercentual(totaisDoDia.calorias, metas.calorias),
      proteina: calcularPercentual(totaisDoDia.proteina, metas.proteinas),
      carboidratos: calcularPercentual(totaisDoDia.carboidratos, metas.carboidratos),
      gordura: calcularPercentual(totaisDoDia.gordura, metas.gorduras),
      agua: calcularPercentual(totalMl, metaMl),
    }),
    [totaisDoDia, metas, totalMl, metaMl]
  );

  // "Meta do dia": ver `calcularMetaDoDiaPercentual` (extraída para
  // utils/progresso.js como função pura testável).
  const metaDoDiaPercentual = useMemo(() => calcularMetaDoDiaPercentual(percentuais), [percentuais]);

  const proximaRefeicao = useMemo(() => obterProximaRefeicao(refeicoesDoDia), [refeicoesDoDia]);

  return {
    metas,
    totaisDoDia,
    percentuais,
    metaDoDiaPercentual,
    agua: { copos, metaCopos, totalMl, metaMl },
    proximaRefeicao,
    refeicoesDoDia,
    adicionarRefeicao,
    removerRefeicao,
  };
}
