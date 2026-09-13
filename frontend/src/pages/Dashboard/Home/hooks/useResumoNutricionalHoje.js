import { useMemo } from 'react';
import { useMetas } from '../../Dieta/hooks/useMetas';
import { useRefeicoes } from '../../Dieta/hooks/useRefeicoes';
import { useHidratacao } from '../../Dieta/hooks/useHidratacao';
import { obterDataDeHojeISO } from '../../Dieta/utils/calendario';
import { calcularResumoDiario } from '../../../../services/dominio/resumoDiarioService';

/**
 * Reaproveita os hooks já existentes da página Dieta — fonte única de
 * verdade dos dados nutricionais — para montar o resumo do dia na Home, sem
 * duplicar a lógica de persistência/cálculo de macros que já vive lá.
 */
export function useResumoNutricionalHoje() {
  const hojeISO = obterDataDeHojeISO();

  const { metas } = useMetas();
  const refeicoes = useRefeicoes(hojeISO);
  const hidratacao = useHidratacao(hojeISO);
  const { refeicoesDoDia, totaisDoDia, adicionarRefeicao, removerRefeicao } = refeicoes;
  const { registros, totalMl, metaMl, adicionarAgua, removerRegistro } = hidratacao;

  const { percentuais, metaDoDiaPercentual, proximaRefeicao, resumoRefeicoes } = useMemo(
    () => calcularResumoDiario({ refeicoes: refeicoesDoDia, totais: totaisDoDia, metas, totalAguaMl: totalMl, metaAguaMl: metaMl }),
    [refeicoesDoDia, totaisDoDia, metas, totalMl, metaMl]
  );

  return {
    metas,
    totaisDoDia,
    percentuais,
    metaDoDiaPercentual,
    agua: { registros, totalMl, metaMl },
    adicionarAgua,
    removerAgua: removerRegistro,
    proximaRefeicao,
    resumoRefeicoes,
    carregando: refeicoes.loading || hidratacao.loading,
    erro: refeicoes.erro || hidratacao.erro,
    refeicoesDoDia,
    adicionarRefeicao,
    removerRefeicao,
  };
}
