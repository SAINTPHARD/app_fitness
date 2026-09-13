import { ordenarPorHorario, refeicaoConcluida } from '../../Dieta/utils/proximaRefeicao';
import { somarMacrosDeAlimentos } from '../../Dieta/utils/macros';

export function resumirMacrosDaRefeicao(refeicao) {
  if (!refeicao?.alimentos?.length) return 'Sem alimentos registrados';

  const totais = somarMacrosDeAlimentos(refeicao.alimentos);
  const arredondar = (valor) => Math.round(Number(valor) || 0);

  return `${arredondar(totais.calorias)} kcal · ${arredondar(totais.proteina)}g P · ${arredondar(totais.carboidratos)}g C · ${arredondar(totais.gordura)}g G`;
}

export function calcularEstatisticasTimeline(refeicoes = []) {
  const lista = ordenarPorHorario(refeicoes);

  return {
    lista,
    semRefeicoesHoje: lista.length === 0,
    concluidas: lista.filter(refeicaoConcluida).length,
    pendentes: lista.filter((refeicao) => !refeicaoConcluida(refeicao)).length,
  };
}
