import { calcularImc } from '../../../../utils/imc';

// Multiplicadores de atividade física (fator de Harris/Mifflin clássico),
// usando as mesmas chaves já definidas no Onboarding (`NIVEIS_ATIVIDADE`) —
// não inventamos uma segunda nomenclatura para o mesmo conceito.
export const MULTIPLICADORES_ATIVIDADE = {
  SEDENTARIO: 1.2,
  LEVE: 1.375,
  ATIVO: 1.55,
  MUITO_ATIVO: 1.725,
};

// Ajuste calórico por objetivo — mesmas chaves do enum `Objetivo` do backend
// (EMAGRECER/MANTER/HIPERTROFIA), reaproveitadas do Onboarding.
const AJUSTE_CALORICO_POR_OBJETIVO = {
  EMAGRECER: -0.2,
  MANTER: 0,
  HIPERTROFIA: 0.15,
};

// Gramas de proteína por kg de peso corporal — dentro da faixa 2.0-2.2g/kg,
// com um pouco mais no déficit (preserva massa magra) e um pouco menos na
// manutenção.
const PROTEINA_G_POR_KG_POR_OBJETIVO = {
  EMAGRECER: 2.2,
  MANTER: 2.0,
  HIPERTROFIA: 2.1,
};

// Gramas de gordura por kg de peso corporal — ponto médio da faixa 0.8-1.0g/kg.
const GORDURA_G_POR_KG = 0.9;

/**
 * Taxa Metabólica Basal pela equação de Mifflin-St Jeor — hoje considerada
 * mais precisa que Harris-Benedict para a população em geral.
 *   Homens: TMB = 10*peso + 6.25*altura - 5*idade + 5
 *   Mulheres: TMB = 10*peso + 6.25*altura - 5*idade - 161
 */
function calcularTMB(pesoKg, alturaCm, idade, sexo) {
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  return sexo === 'M' ? base + 5 : base - 161;
}

/**
 * Motor de cálculo metabólico: a partir dos dados corporais, nível de
 * atividade e objetivo, deriva IMC, TMB, gasto energético total (TDEE) e as
 * metas diárias de calorias/proteína/carboidratos/gordura. Função pura —
 * não lê nem grava nada, só recebe e devolve números.
 */
export function calcularMetasNutricionais({ peso, altura, idade, sexo, nivelAtividade, objetivo }) {
  const pesoKg = Number(peso) || 0;
  const alturaCm = Number(altura) || 0;
  const idadeAnos = Number(idade) || 0;

  if (pesoKg <= 0 || alturaCm <= 0 || idadeAnos <= 0) return null;

  const imc = calcularImc(pesoKg, alturaCm);
  const tmb = calcularTMB(pesoKg, alturaCm, idadeAnos, sexo);

  const multiplicadorAtividade = MULTIPLICADORES_ATIVIDADE[nivelAtividade] || MULTIPLICADORES_ATIVIDADE.SEDENTARIO;
  const gastoEnergeticoTotal = tmb * multiplicadorAtividade;

  const ajusteCalorico = AJUSTE_CALORICO_POR_OBJETIVO[objetivo] ?? 0;
  const caloriasAlvo = gastoEnergeticoTotal * (1 + ajusteCalorico);

  const proteinaGramas = pesoKg * (PROTEINA_G_POR_KG_POR_OBJETIVO[objetivo] ?? PROTEINA_G_POR_KG_POR_OBJETIVO.MANTER);
  const gorduraGramas = pesoKg * GORDURA_G_POR_KG;

  // Carboidratos ficam com as calorias restantes depois de proteína (4
  // kcal/g) e gordura (9 kcal/g) — nunca negativo, mesmo em cenários de
  // déficit agressivo com peso baixo.
  const caloriasDeProteinaEGordura = proteinaGramas * 4 + gorduraGramas * 9;
  const carboidratosGramas = Math.max(0, (caloriasAlvo - caloriasDeProteinaEGordura) / 4);

  return {
    imc,
    tmb: Math.round(tmb),
    gastoEnergeticoTotal: Math.round(gastoEnergeticoTotal),
    metas: {
      calorias: Math.round(caloriasAlvo),
      proteinas: Math.round(proteinaGramas),
      carboidratos: Math.round(carboidratosGramas),
      gorduras: Math.round(gorduraGramas),
    },
  };
}
