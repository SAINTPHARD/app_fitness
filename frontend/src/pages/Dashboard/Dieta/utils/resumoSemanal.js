import { formatarDataISO } from './calendario';
import { somarMacrosDeAlimentos } from './macros';

const ROTULOS_DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Monta a série dos últimos `quantidadeDias` (hoje incluso) com o total de
 * calorias consumidas em cada um, a partir dos dados reais vindos do
 * backend (`refeicoesPorDia`, obtido via `useHistoricoRefeicoes` — ver
 * comentário lá sobre a correção da causa raiz). Dias sem nenhuma refeição
 * registrada aparecem com o total zerado — nenhum valor é inventado. Usado
 * tanto pelo gráfico semanal da Home quanto pelo da própria Dieta.
 *
 * CORREÇÃO: esta função lia diretamente de uma chave de localStorage
 * ('dieta-refeicoes') que ninguém mais escreve desde que `useRefeicoes`
 * passou a usar a API real — por isso virou um parâmetro puro em vez de
 * fazer I/O escondido, ficando testável e sempre em sincronia com o que a
 * Dieta realmente mostra.
 */
export function obterResumoSemanalDeCalorias(refeicoesPorDia, quantidadeDias = 7) {
  const hoje = new Date();

  return Array.from({ length: quantidadeDias }, (_, indice) => {
    const dataDoDia = new Date(hoje);
    dataDoDia.setDate(hoje.getDate() - (quantidadeDias - 1 - indice));
    const iso = formatarDataISO(dataDoDia);

    const refeicoesDesseDia = refeicoesPorDia?.get(iso) || [];
    const totalCalorias = refeicoesDesseDia.reduce(
      (total, refeicao) => total + somarMacrosDeAlimentos(refeicao.alimentos).calorias,
      0
    );

    return { dia: ROTULOS_DIAS_CURTOS[dataDoDia.getDay()], iso, calorias: Math.round(totalCalorias) };
  });
}
