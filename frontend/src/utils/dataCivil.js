const PADRAO_DATA_CIVIL = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Contrato canônico de datas de domínio.
 *
 * Hidratação, refeições, peso e sessões pertencem ao dia civil do usuário.
 * Por isso trafegam como `AAAA-MM-DD`, sem horário e sem conversão para UTC.
 * Instantes reais (ex.: conclusão de uma série) continuam como ISO/UTC.
 */
export function formatarDataCivil(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function hojeDataCivil() {
  return formatarDataCivil(new Date());
}

export function ehDataCivilValida(valor) {
  if (!PADRAO_DATA_CIVIL.test(String(valor || ''))) return false;
  const [ano, mes, dia] = valor.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia);
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;
}

export function exigirDataCivil(valor, campo = 'data') {
  if (!ehDataCivilValida(valor)) throw new Error(`${campo} deve estar no formato AAAA-MM-DD.`);
  return valor;
}

export function criarDataLocal(valor) {
  exigirDataCivil(valor);
  const [ano, mes, dia] = valor.split('-').map(Number);
  return new Date(ano, mes - 1, dia, 12);
}
