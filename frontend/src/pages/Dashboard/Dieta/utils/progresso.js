/**
 * Calcula o percentual (0-100) de uma meta já atingida. Retorna 0 quando a
 * meta ainda não foi definida, para as barras de progresso não aparecerem
 * "cheias por engano" com uma meta de valor zero.
 */
export function calcularPercentual(consumido, meta) {
  if (!meta || Number(meta) <= 0) return 0;
  return Math.min((Number(consumido) / Number(meta)) * 100, 100);
}

export function calcularPercentualReal(consumido, meta) {
  if (!meta || Number(meta) <= 0) return 0;
  const percentual = (Number(consumido) / Number(meta)) * 100;
  return Number.isFinite(percentual) ? percentual : 0;
}

export function calcularProgressoVisual(percentualReal) {
  if (!Number.isFinite(Number(percentualReal)) || Number(percentualReal) <= 0) return 0;
  return Math.min(Number(percentualReal), 100);
}

/** Indica se o valor consumido ultrapassou a meta definida (meta > 0). */
export function metaExcedida(consumido, meta) {
  return Number(meta) > 0 && Number(consumido) > Number(meta);
}

export function formatarCalorias(valor) {
  return Number(valor) > 0 ? `${valor} kcal` : '—';
}

/**
 * "Meta do dia": média dos percentuais de indicadores que já têm alguma
 * meta definida (calorias, macros e água). Extraída de
 * `useResumoNutricionalHoje` para ser uma função pura testável — antes o
 * card "Meta do dia" simplesmente reaproveitava por engano o percentual de
 * água (P2.6), ignorando calorias/macros apesar do texto descritivo do
 * card prometer os três. Metas ainda não configuradas (percentual 0) ficam
 * de fora da média para não punir o usuário por algo que ele nem preencheu.
 */
export function calcularMetaDoDiaPercentual(percentuais) {
  const valores = Object.values(percentuais || {}).filter((valor) => valor > 0);
  if (valores.length === 0) return 0;
  const soma = valores.reduce((total, valor) => total + valor, 0);
  return Math.round(soma / valores.length);
}
