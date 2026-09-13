import { useCallback, useMemo, useState } from 'react';
import { useMetas } from '../../Dieta/hooks/useMetas';
import { useRefeicoes } from '../../Dieta/hooks/useRefeicoes';
import { useHidratacao } from '../../Dieta/hooks/useHidratacao';
import { obterDataDeHojeISO } from '../../Dieta/utils/calendario';
import { calcularResumoDiario } from '../../../../services/dominio/resumoDiarioService';

/**
 * Reaproveita os hooks já existentes da página Dieta — fonte única de
 * verdade dos dados nutricionais — para montar o resumo do dia na Home, sem
 * duplicar a lógica de persistência/cálculo de macros que já vive lá.
 *
 * Também expõe `recarregar`: as buscas do NutritionContext são cacheadas por
 * data, então um erro de rede deixaria a Home presa na mensagem de falha até
 * o usuário recarregar a página inteira. `recarregar` refaz as duas buscas
 * do dia forçando o cache, que é o que o botão "Tentar novamente" precisa.
 */
export function useResumoNutricionalHoje() {
  const hojeISO = obterDataDeHojeISO();
  const [recarregando, setRecarregando] = useState(false);

  const { metas } = useMetas();
  const refeicoes = useRefeicoes(hojeISO);
  const hidratacao = useHidratacao(hojeISO);
  const { refeicoesDoDia, totaisDoDia, adicionarRefeicao, removerRefeicao } = refeicoes;
  const { registros, totalMl, metaMl, adicionarAgua, removerRegistro } = hidratacao;

  const { recarregar: recarregarRefeicoes } = refeicoes;
  const { recarregar: recarregarHidratacao } = hidratacao;

  const recarregar = useCallback(async () => {
    setRecarregando(true);
    try {
      // As duas buscas são independentes e ambas registram o próprio erro no
      // contexto; `allSettled` garante que a falha de uma não impeça a outra
      // de se recuperar.
      await Promise.allSettled([recarregarRefeicoes(), recarregarHidratacao()]);
    } finally {
      setRecarregando(false);
    }
  }, [recarregarRefeicoes, recarregarHidratacao]);

  const { percentuais, metaDoDiaPercentual, proximaRefeicao, resumoRefeicoes } = useMemo(
    () => calcularResumoDiario({ refeicoes: refeicoesDoDia, totais: totaisDoDia, metas, totalAguaMl: totalMl, metaAguaMl: metaMl }),
    [refeicoesDoDia, totaisDoDia, metas, totalMl, metaMl]
  );

  const agua = useMemo(() => ({ registros, totalMl, metaMl }), [registros, totalMl, metaMl]);

  return {
    metas,
    totaisDoDia,
    percentuais,
    metaDoDiaPercentual,
    agua,
    adicionarAgua,
    removerAgua: removerRegistro,
    proximaRefeicao,
    resumoRefeicoes,
    carregando: refeicoes.loading || hidratacao.loading,
    erro: refeicoes.erro || hidratacao.erro,
    recarregar,
    recarregando,
    refeicoesDoDia,
    adicionarRefeicao,
    removerRefeicao,
  };
}
