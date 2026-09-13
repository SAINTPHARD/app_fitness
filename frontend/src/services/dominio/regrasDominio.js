import { exigirDataCivil } from '../../utils/dataCivil.js';

export const LIMITES_HIDRATACAO = { minimoMl: 1, maximoMl: 5000 };
export const LIMITES_PESO_KG = { minimo: 20, maximo: 300 };
export const LIMITES_METAS = {
  calorias: [500, 10000], proteinas: [0, 1000], carboidratos: [0, 1500], gorduras: [0, 500], aguaMl: [250, 10000],
};

export function validarQuantidadeAgua(quantidadeMl) {
  const quantidade = Number(quantidadeMl);
  if (!Number.isFinite(quantidade) || quantidade < 1 || quantidade > 5000) throw new Error('A quantidade deve estar entre 1 e 5000 ml.');
  return Math.round(quantidade);
}

export function normalizarRegistroPeso(registro) {
  const peso = Number(registro?.peso);
  if (!Number.isFinite(peso) || peso < 20 || peso > 300) throw new Error('Informe um peso entre 20 e 300 kg.');
  return { ...registro, peso, data: exigirDataCivil(registro.data) };
}

export function validarMetas(metas) {
  const normalizadas = {};
  for (const [campo, [minimo, maximo]] of Object.entries(LIMITES_METAS)) {
    const valor = Number(metas?.[campo]);
    if (!Number.isFinite(valor) || valor < minimo || valor > maximo) throw new Error(`${campo} deve estar entre ${minimo} e ${maximo}.`);
    normalizadas[campo] = valor;
  }
  return normalizadas;
}
