export function obterErroSerie(carga, repeticoes) {
  const cargaNumero = Number(carga);
  if (carga === '' || carga === null || carga === undefined || !Number.isFinite(cargaNumero) || cargaNumero <= 0) {
    return 'Informe a carga';
  }

  const repeticoesNumero = Number(repeticoes);
  if (
    repeticoes === '' ||
    repeticoes === null ||
    repeticoes === undefined ||
    !Number.isInteger(repeticoesNumero) ||
    repeticoesNumero <= 0
  ) {
    return 'Informe as repetições';
  }

  return null;
}
