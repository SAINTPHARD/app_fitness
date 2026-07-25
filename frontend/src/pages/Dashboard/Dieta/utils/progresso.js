/**
 * Calcula o percentual (0-100) de uma meta já atingida. Retorna 0 quando a
 * meta ainda não foi definida, para as barras de progresso não aparecerem
 * "cheias por engano" com uma meta de valor zero.
 */
export function calcularPercentual(consumido, meta) {
  if (!meta || Number(meta) <= 0) return 0;
  return Math.min((Number(consumido) / Number(meta)) * 100, 100);
}

/** Indica se o valor consumido ultrapassou a meta definida (meta > 0). */
export function metaExcedida(consumido, meta) {
  return Number(meta) > 0 && Number(consumido) > Number(meta);
}

export function formatarCalorias(valor) {
  return Number(valor) > 0 ? `${valor} kcal` : '—';
}
