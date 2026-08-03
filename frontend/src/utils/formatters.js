/**
 * Arredonda qualquer número para N casas decimais e formata no padrão PT-BR
 */
export const formatarNumero = (valor, casas = 1) => {
  const num = Number(valor);
  if (isNaN(num) || valor === null || valor === undefined) return '0';
  
  // Evita -0.0
  const valorFixado = Math.abs(num) < 0.0001 ? 0 : num;
  
  return valorFixado.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: casas,
  });
};

/**
 * Arredonda valores inteiros (ex: Calorias)
 */
export const formatarInteiro = (valor) => {
  const num = Number(valor);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('pt-BR');
};