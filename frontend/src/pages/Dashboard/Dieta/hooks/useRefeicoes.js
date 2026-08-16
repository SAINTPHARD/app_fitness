import { useCallback, useEffect } from 'react';
import { useNutrition } from '../../../../context/NutritionContext';

/**
 * Wrapper de compatibilidade para os componentes de Dieta/Home. A fonte real
 * agora é o NutritionContext, então qualquer alteração feita numa página
 * atualiza imediatamente os totais, cards e gráficos que usam a mesma data.
 */
export function useRefeicoes(dataSelecionadaISO) {
  const nutrition = useNutrition();
  const { carregarRefeicoes } = nutrition;

  useEffect(() => {
    carregarRefeicoes(dataSelecionadaISO);
  }, [carregarRefeicoes, dataSelecionadaISO]);

  const adicionarAlimento = useCallback(
    (idRefeicao, novoAlimento) => nutrition.adicionarAlimento(dataSelecionadaISO, idRefeicao, novoAlimento),
    [nutrition, dataSelecionadaISO]
  );

  const removerAlimento = useCallback(
    (idRefeicao, idAlimento) => nutrition.removerAlimento(dataSelecionadaISO, idRefeicao, idAlimento),
    [nutrition, dataSelecionadaISO]
  );

  const editarAlimento = useCallback(
    (idRefeicao, idAlimento, alimentoEditado) =>
      nutrition.editarAlimento(dataSelecionadaISO, idRefeicao, idAlimento, alimentoEditado),
    [nutrition, dataSelecionadaISO]
  );

  const adicionarRefeicao = useCallback(
    (novaRefeicao) => nutrition.adicionarRefeicao(dataSelecionadaISO, novaRefeicao),
    [nutrition, dataSelecionadaISO]
  );

  const editarRefeicao = useCallback(
    (idRefeicao, refeicaoEditada) => nutrition.editarRefeicao(dataSelecionadaISO, idRefeicao, refeicaoEditada),
    [nutrition, dataSelecionadaISO]
  );

  const removerRefeicao = useCallback(
    (idRefeicao) => nutrition.removerRefeicao(dataSelecionadaISO, idRefeicao),
    [nutrition, dataSelecionadaISO]
  );

  const concluirRefeicao = useCallback(
    (idRefeicao) => nutrition.concluirRefeicao(dataSelecionadaISO, idRefeicao),
    [nutrition, dataSelecionadaISO]
  );

  return {
    refeicoesDoDia: nutrition.obterRefeicoesDaData(dataSelecionadaISO),
    totaisDoDia: nutrition.obterTotaisDaData(dataSelecionadaISO),
    ...nutrition.obterStatusDaData(dataSelecionadaISO),
    adicionarAlimento,
    removerAlimento,
    editarAlimento,
    adicionarRefeicao,
    editarRefeicao,
    removerRefeicao,
    concluirRefeicao,
    recarregar: () => carregarRefeicoes(dataSelecionadaISO, { forcar: true }),
  };
}
