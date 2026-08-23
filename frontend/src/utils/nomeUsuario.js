/**
 * Exibição do nome do usuário.
 *
 * Regra do produto: a interface mostra o NOME cadastrado, nunca o e-mail.
 * Por isso o fallback aqui é um rótulo neutro ("Atleta") em vez do trecho
 * antes do "@" — mostrar "robedsonsaintphard10" na saudação era justamente
 * o problema que essas funções existem para eliminar.
 */
const ROTULO_PADRAO = 'Atleta';

function limpar(valor) {
  return String(valor ?? '').replace(/\s+/g, ' ').trim();
}

/** Nome completo cadastrado, ou o rótulo neutro. */
export function obterNomeExibicao(usuario) {
  return limpar(usuario?.nome) || ROTULO_PADRAO;
}

/** Só o primeiro nome — usado na saudação do Header. */
export function obterPrimeiroNome(usuario) {
  const nome = limpar(usuario?.nome);
  if (!nome) return ROTULO_PADRAO;
  return nome.split(' ')[0];
}

/** Iniciais para o avatar: "Robedson Saintphard" → "RS". */
export function obterIniciaisUsuario(usuario) {
  const nome = limpar(usuario?.nome);
  if (!nome) return 'A';

  const partes = nome.split(' ').filter(Boolean);
  const primeira = partes[0]?.charAt(0) ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';

  return `${primeira}${ultima}`.toUpperCase() || 'A';
}
