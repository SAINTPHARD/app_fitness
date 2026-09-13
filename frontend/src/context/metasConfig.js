export const METAS_PADRAO = {
  calorias: 2000,
  proteinas: 150,
  carboidratos: 250,
  gorduras: 65,
  aguaMl: 2000,
};

export function normalizarMetas(metas) {
  return {
    calorias: Number(metas?.calorias ?? metas?.metaCalorias ?? METAS_PADRAO.calorias),
    proteinas: Number(metas?.proteinas ?? metas?.metaProteinas ?? METAS_PADRAO.proteinas),
    carboidratos: Number(metas?.carboidratos ?? metas?.metaCarboidratos ?? METAS_PADRAO.carboidratos),
    gorduras: Number(metas?.gorduras ?? metas?.metaGorduras ?? METAS_PADRAO.gorduras),
    aguaMl: Number(metas?.aguaMl ?? metas?.metaAguaMl ?? METAS_PADRAO.aguaMl),
  };
}
