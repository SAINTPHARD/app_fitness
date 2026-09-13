import { calcularMetaDoDiaPercentual, calcularPercentual, calcularPercentualReal } from '../../pages/Dashboard/Dieta/utils/progresso';
import { calcularResumoRefeicoes, obterProximaRefeicao } from '../../pages/Dashboard/Dieta/utils/proximaRefeicao';

/** Composição canônica, sem efeitos, consumida pela Home e demais resumos diários. */
export function calcularResumoDiario({ refeicoes, totais, metas, totalAguaMl, metaAguaMl }) {
  const percentuais = {
    calorias: calcularPercentual(totais.calorias, metas.calorias),
    proteina: calcularPercentual(totais.proteina, metas.proteinas),
    carboidratos: calcularPercentual(totais.carboidratos, metas.carboidratos),
    gordura: calcularPercentual(totais.gordura, metas.gorduras),
    agua: calcularPercentualReal(totalAguaMl, metaAguaMl),
  };

  return {
    percentuais,
    metaDoDiaPercentual: calcularMetaDoDiaPercentual(percentuais),
    proximaRefeicao: obterProximaRefeicao(refeicoes),
    resumoRefeicoes: calcularResumoRefeicoes(refeicoes),
  };
}
