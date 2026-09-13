export const META_AGUA_ML_POR_KG = 35;

export function calcularMetaHidratacao(pesoKg) {
  const peso = Number(pesoKg);
  if (!Number.isFinite(peso) || peso <= 0) return 0;
  return Math.round((peso * META_AGUA_ML_POR_KG) / 50) * 50;
}

export function validarMetasOnboarding(metas) {
  const limites = {
    calorias: [1, 10000, 'Calorias devem estar entre 1 e 10.000 kcal.'],
    proteinas: [0, 1000, 'Proteínas devem estar entre 0 e 1.000 g.'],
    carboidratos: [0, 2000, 'Carboidratos devem estar entre 0 e 2.000 g.'],
    gorduras: [0, 1000, 'Gorduras devem estar entre 0 e 1.000 g.'],
    aguaMl: [250, 10000, 'Hidratação deve estar entre 250 e 10.000 ml.'],
  };

  for (const [campo, [min, max, mensagem]] of Object.entries(limites)) {
    const valor = Number(metas[campo]);
    if (!Number.isFinite(valor) || valor < min || valor > max) return mensagem;
  }
  return null;
}
