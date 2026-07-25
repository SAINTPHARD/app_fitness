import { formatarDataISO } from './calendario';
import { somarMacrosDeAlimentos } from './macros';

// Mesma chave usada por `useRefeicoes` — lida aqui em modo LEITURA para
// derivar uma métrica de engajamento (streak) que nenhum hook existente
// calculava.
const CHAVE_REFEICOES = 'dieta-refeicoes';

function lerTodasAsRefeicoesSalvas() {
  if (typeof window === 'undefined') return [];

  try {
    const salvas = window.localStorage.getItem(CHAVE_REFEICOES);
    return salvas ? JSON.parse(salvas) : [];
  } catch {
    return [];
  }
}

/**
 * Sequência de dias consecutivos (streak) com pelo menos uma refeição
 * registrada, contando a partir de hoje para trás. Puramente derivado de
 * dados reais já salvos — nenhum contador fictício ou incrementado à parte.
 */
export function obterSequenciaDeDias() {
  const todasRefeicoes = lerTodasAsRefeicoesSalvas();

  const diasComRegistro = new Set(
    todasRefeicoes
      .filter((refeicao) => somarMacrosDeAlimentos(refeicao.alimentos).calorias > 0)
      .map((refeicao) => refeicao.data)
  );

  let sequencia = 0;
  const cursor = new Date();

  // Anda de trás para frente a partir de hoje enquanto houver registro no dia.
  while (diasComRegistro.has(formatarDataISO(cursor))) {
    sequencia += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return sequencia;
}
