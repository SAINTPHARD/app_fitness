import { useMemo } from 'react';
import { useMetas } from '../../Dieta/hooks/useMetas';
import { useRefeicoes } from '../../Dieta/hooks/useRefeicoes';
import { useHidratacao } from '../../Dieta/hooks/useHidratacao';
import { obterDataDeHojeISO } from '../../Dieta/utils/calendario';
import { calcularPercentual } from '../../Dieta/utils/progresso';
import { obterProximaRefeicao } from '../../Dieta/utils/proximaRefeicao';

/**
 * Reaproveita os hooks já existentes da página Dieta — fonte única de
 * verdade dos dados nutricionais — para montar o resumo do dia na Home, sem
 * duplicar a lógica de persistência/cálculo de macros que já vive lá.
 */
export function useResumoNutricionalHoje() {
  const hojeISO = obterDataDeHojeISO();

  const { metas } = useMetas();
  const { refeicoesDoDia, totaisDoDia } = useRefeicoes(hojeISO);
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

  // "Meta do dia": média dos percentuais que já têm alguma meta definida —
  // metas ainda não configuradas (0) ficam de fora da média para não punir
  // o usuário por algo que ele nem preencheu ainda.
  const metaDoDiaPercentual = useMemo(() => {
    const percentuaisValidos = Object.values(percentuais).filter((valor) => valor > 0);
    if (percentuaisValidos.length === 0) return 0;

    const soma = percentuaisValidos.reduce((total, valor) => total + valor, 0);
    return Math.round(soma / percentuaisValidos.length);
  }, [percentuais]);

  const proximaRefeicao = useMemo(() => obterProximaRefeicao(refeicoesDoDia), [refeicoesDoDia]);

  return {
    metas,
    totaisDoDia,
    percentuais,
    metaDoDiaPercentual,
    agua: { copos, metaCopos, totalMl, metaMl },
    proximaRefeicao,
    refeicoesDoDia,
  };
}
