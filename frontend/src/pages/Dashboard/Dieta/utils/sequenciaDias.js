import { formatarDataISO } from './calendario';
import { somarMacrosDeAlimentos } from './macros';

/**
 * Sequência de dias consecutivos (streak) com pelo menos uma refeição
 * registrada, contando a partir de hoje para trás. Recebe os dados reais já
 * buscados do backend (`refeicoesPorDia`, de `useHistoricoRefeicoes`) — ver
 * o comentário nesse hook sobre a correção da causa raiz: esta função lia
 * mais, então o streak nunca refletia refeições registradas de verdade.
 */
export function obterSequenciaDeDias(refeicoesPorDia) {
  let sequencia = 0;
  const cursor = new Date();

  while (true) {
    const iso = formatarDataISO(cursor);
    const refeicoesDoDia = refeicoesPorDia?.get(iso);
    if (refeicoesDoDia === undefined) break; // fora do período buscado

    const temRegistro = refeicoesDoDia.some(
      (refeicao) => somarMacrosDeAlimentos(refeicao.alimentos).calorias > 0
    );
    if (!temRegistro) break;

    sequencia += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return sequencia;
}
