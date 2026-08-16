export function ordenarPesosPorData(registros = []) {
  return [...registros].sort((a, b) => String(a?.data || '').localeCompare(String(b?.data || '')));
}

export function obterUltimoRegistroPeso(registros = []) {
  const ordenados = ordenarPesosPorData(registros);
  return ordenados.length > 0 ? ordenados[ordenados.length - 1] : null;
}
