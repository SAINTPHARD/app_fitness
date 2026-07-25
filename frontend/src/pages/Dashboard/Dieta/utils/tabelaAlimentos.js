// Base de alimentos de referência. Os macros são sempre expressos POR
// GRAMA (protPorGrama/carboPorGrama/gordPorGrama) — nunca por porção/unidade.
//
// Por que por grama e não por "porção base" (100g) ou "por unidade": a
// versão anterior guardava `porcaoBase` (100 para a maioria, 1 para itens
// como Ovo/Pão Francês/Banana) e dividia a quantidade digitada por esse
// valor. Como o campo de quantidade sempre pede gramas ao usuário, um item
// com `porcaoBase: 1` virava um multiplicador absurdo (180g digitado ÷ 1 =
// fator 180x os macros da "unidade inteira"), gerando calorias na casa dos
// milhares. Guardando tudo já por grama, a quantidade digitada (em gramas)
// multiplica diretamente o valor por grama — sem essa segunda divisão.
//
// `pesoReferenciaG` é só informativo (ajuda visual: "≈50g por unidade"),
// nunca entra no cálculo.
export const TABELA_ALIMENTOS = [
  { id: 1, nome: 'Frango Grelhado (peito)', protPorGrama: 0.31, carboPorGrama: 0, gordPorGrama: 0.036 },
  { id: 2, nome: 'Arroz Branco Cozido', protPorGrama: 0.025, carboPorGrama: 0.28, gordPorGrama: 0.002 },
  { id: 3, nome: 'Arroz Integral Cozido', protPorGrama: 0.026, carboPorGrama: 0.258, gordPorGrama: 0.01 },
  { id: 4, nome: 'Ovo Cozido', protPorGrama: 0.13, carboPorGrama: 0.011, gordPorGrama: 0.11, pesoReferenciaG: 50 },
  { id: 5, nome: 'Batata Doce Cozida', protPorGrama: 0.016, carboPorGrama: 0.2, gordPorGrama: 0.001 },
  { id: 6, nome: 'Aveia em Flocos', protPorGrama: 0.139, carboPorGrama: 0.67, gordPorGrama: 0.085 },
  { id: 7, nome: 'Pão Francês', protPorGrama: 0.08, carboPorGrama: 0.58, gordPorGrama: 0.013, pesoReferenciaG: 50 },
  { id: 8, nome: 'Banana', protPorGrama: 0.011, carboPorGrama: 0.228, gordPorGrama: 0.003, pesoReferenciaG: 100 },
  { id: 9, nome: 'Whey Protein', protPorGrama: 0.8, carboPorGrama: 0.1, gordPorGrama: 0.05, pesoReferenciaG: 30 },
  { id: 10, nome: 'Feijão Carioca Cozido', protPorGrama: 0.048, carboPorGrama: 0.136, gordPorGrama: 0.005 },
  { id: 11, nome: 'Azeite de Oliva', protPorGrama: 0, carboPorGrama: 0, gordPorGrama: 1 },
  { id: 12, nome: 'Atum em Lata (água)', protPorGrama: 0.26, carboPorGrama: 0, gordPorGrama: 0.01 },
  { id: 13, nome: 'Iogurte Natural Integral', protPorGrama: 0.035, carboPorGrama: 0.047, gordPorGrama: 0.03 },
  { id: 14, nome: 'Pão de Forma Integral', protPorGrama: 0.144, carboPorGrama: 0.5, gordPorGrama: 0.048, pesoReferenciaG: 25 },
  { id: 15, nome: 'Carne Bovina Moída (patinho)', protPorGrama: 0.26, carboPorGrama: 0, gordPorGrama: 0.08 },
  { id: 16, nome: 'Batata Inglesa Cozida', protPorGrama: 0.02, carboPorGrama: 0.17, gordPorGrama: 0.001 },
  { id: 17, nome: 'Queijo Minas Frescal', protPorGrama: 0.174, carboPorGrama: 0.032, gordPorGrama: 0.2 },
  { id: 18, nome: 'Tapioca', protPorGrama: 0.002, carboPorGrama: 0.26, gordPorGrama: 0 },
  { id: 19, nome: 'Amendoim Torrado', protPorGrama: 0.272, carboPorGrama: 0.2, gordPorGrama: 0.439 },
  { id: 20, nome: 'Salmão Grelhado', protPorGrama: 0.25, carboPorGrama: 0, gordPorGrama: 0.13 },
];

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Busca alimentos por nome, ignorando acentos e caixa. Retorna no máximo 8
 * resultados para manter o dropdown de sugestões enxuto.
 */
export function buscarAlimentos(termo) {
  const termoNormalizado = normalizarTexto(termo || '').trim();
  if (!termoNormalizado) return [];

  return TABELA_ALIMENTOS.filter((alimento) => normalizarTexto(alimento.nome).includes(termoNormalizado)).slice(0, 8);
}

/**
 * Sanitiza um valor de input para um número >= 0, sem NaN. Usado tanto para
 * a quantidade digitada quanto para qualquer macro que o próprio cálculo
 * produzir, garantindo que a pré-visualização nunca exiba NaN/negativo.
 */
function paraNumeroSeguro(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return 0;
  return numero;
}

/**
 * Calcula proteína/carboidratos/gordura multiplicando diretamente os
 * valores por grama do alimento de referência pela quantidade (em gramas)
 * digitada — sem nenhuma divisão por porção/unidade envolvida, o que
 * eliminava a fonte do bug de calorias absurdas.
 */
export function calcularMacrosProporcionais(alimentoRef, quantidade) {
  const gramas = paraNumeroSeguro(quantidade);

  return {
    proteina: Number((alimentoRef.protPorGrama * gramas).toFixed(1)),
    carboidratos: Number((alimentoRef.carboPorGrama * gramas).toFixed(1)),
    gordura: Number((alimentoRef.gordPorGrama * gramas).toFixed(1)),
  };
}
