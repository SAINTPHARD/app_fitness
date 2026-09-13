/**
 * Formatação numérica compartilhada pelos cartões da Home. Fica isolada aqui
 * (em vez de repetida em cada componente) para que "1 casa decimal" e
 * "inteiro arredondado" signifiquem exatamente a mesma coisa em todos os
 * lugares onde o mesmo número aparece — Plano de hoje, timeline e gráficos.
 */

/** `82.35` -> `"82.4"`. Usado em gramas de macro e litros de água. */
export const formatar1Casa = (valor) => (Number(valor) || 0).toFixed(1);

/** `1847.6` -> `"1848"`. Usado em kcal e metas inteiras. */
export const formatarInteiro = (valor) => String(Math.round(Number(valor) || 0));

/** Converte para número seguro e limita a 0–100 para barras e `aria-valuenow`. */
export const limitarPercentual = (valor) => Math.min(Math.max(Number(valor) || 0, 0), 100);
