/** Calcula o IMC (kg / m²) a partir do peso em kg e da altura em cm. */
export function calcularImc(pesoKg, alturaCm) {
  const alturaMetros = Number(alturaCm) / 100;
  if (!pesoKg || !alturaMetros) return null;

  return Number((Number(pesoKg) / (alturaMetros * alturaMetros)).toFixed(1));
}

/** Classificação padrão da OMS para a faixa de IMC. */
export function classificarImc(imc) {
  if (imc === null || imc === undefined) return null;
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidade';
}

// Faixa usada pelo indicador visual de IMC (barra gradiente): valores fora
// desse intervalo são "grampeados" nas pontas ao posicionar o marcador.
export const IMC_FAIXA_MINIMA = 15;
export const IMC_FAIXA_MAXIMA = 35;

/** Posição (0-100%) do IMC dentro da faixa visual da barra gradiente. */
export function calcularPosicaoNaFaixa(imc) {
  if (imc === null || imc === undefined) return 50;
  const imcLimitado = Math.min(Math.max(imc, IMC_FAIXA_MINIMA), IMC_FAIXA_MAXIMA);
  return ((imcLimitado - IMC_FAIXA_MINIMA) / (IMC_FAIXA_MAXIMA - IMC_FAIXA_MINIMA)) * 100;
}
