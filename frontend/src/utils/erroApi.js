/**
 * Extrai uma mensagem de erro amigável de qualquer erro do Axios — usada
 * tanto pelo interceptor global (`services/api.js`) quanto por qualquer
 * `catch` local que precise de um texto para mostrar ao usuário, em vez de
 * cada tela reinventar a mesma leitura de `error.response.data.message`.
 */
export function extrairMensagemErro(erro, mensagemPadrao = 'Algo deu errado. Tente novamente.') {
  if (!erro) return mensagemPadrao;

  // Sem resposta do servidor: ou a API caiu, ou é problema de rede/timeout.
  if (!erro.response) {
    if (erro.code === 'ECONNABORTED') return 'A requisição demorou demais e foi cancelada. Tente novamente.';
    if (erro.message === 'Network Error') return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    return mensagemPadrao;
  }

  const { status, data } = erro.response;

  if (data?.message) return data.message;
  if (typeof data === 'string' && data.trim()) return data;

  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para essa ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';

  return mensagemPadrao;
}
