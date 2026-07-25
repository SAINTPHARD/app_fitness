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
