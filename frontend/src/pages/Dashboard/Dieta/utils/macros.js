/**
 * Soma os macronutrientes de uma lista de alimentos.
 *
 * Extraída como função pura e reutilizada tanto pelo total do dia inteiro
 * quanto pelo total de cada refeição individual — nenhum dos dois lugares
 * guarda um valor "calorias" pré-calculado; ambos recalculam a partir dos
 * alimentos reais sempre que renderizam (ver `useRefeicoes` e `CartaoRefeicao`).
 */
export function somarMacrosDeAlimentos(alimentos = []) {
  return alimentos.reduce(
    (acumulado, alimento) => ({
      calorias: acumulado.calorias + Number(alimento.calorias || 0),
      proteina: acumulado.proteina + Number(alimento.proteina || 0),
      carboidratos: acumulado.carboidratos + Number(alimento.carboidratos || 0),
      gordura: acumulado.gordura + Number(alimento.gordura || 0),
    }),
    { calorias: 0, proteina: 0, carboidratos: 0, gordura: 0 }
  );
}

function paraNumeroNaoNegativo(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

export function calcularCaloriasPelosMacros(proteina, carboidratos, gordura) {
  // Fórmula nutricional padrão: proteína e carboidrato têm 4 kcal/g, gordura 9 kcal/g.
  // Valores NaN, negativos ou vazios caem para 0 em vez de contaminar o resultado.
  return (
    paraNumeroNaoNegativo(proteina) * 4 + paraNumeroNaoNegativo(carboidratos) * 4 + paraNumeroNaoNegativo(gordura) * 9
  );
}

export const LIMITES_ALIMENTO = Object.freeze({
  quantidade: 5000,
  proteina: 1000,
  carboidratos: 1500,
  gordura: 500,
});

/** Valida os valores nutricionais antes de qualquer persistência. */
export function validarValoresAlimento(alimento = {}) {
  const textoQuantidade = String(alimento.quantidade ?? '').trim().toLowerCase();
  const correspondencia = textoQuantidade.match(/^([0-9]+(?:[.,][0-9]+)?)\s*(g|kg|ml\.?|l|litros?|mililitros?|unidades?|un|copos?)?$/i);
  const quantidade = correspondencia ? Number(correspondencia[1].replace(',', '.')) : Number.NaN;
  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    return 'Informe uma quantidade válida (ex: 150g, 200ml, 1l ou 2 unidades)';
  }
  const unidade = correspondencia?.[2]?.replace('.', '') || 'g';
  const quantidadeBase = unidade === 'kg' || unidade === 'l' || unidade.startsWith('litro')
    ? quantidade * 1000
    : unidade.startsWith('copo') ? quantidade * 250 : quantidade;
  if (quantidadeBase > LIMITES_ALIMENTO.quantidade) {
    return `A quantidade deve ser menor ou igual ao equivalente a ${LIMITES_ALIMENTO.quantidade} g/ml`;
  }

  for (const campo of ['proteina', 'carboidratos', 'gordura']) {
    const valor = Number(alimento[campo] || 0);
    if (!Number.isFinite(valor) || valor < 0) {
      return 'Os macronutrientes não podem ser negativos';
    }
    if (valor > LIMITES_ALIMENTO[campo]) {
      return `O valor de ${campo} excede o limite permitido`;
    }
  }

  return null;
}
