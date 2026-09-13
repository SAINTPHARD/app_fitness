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
  const detalhes = data?.mensagens || data?.details || data?.errors;
  if (Array.isArray(detalhes) && detalhes.length) {
    const primeiro = detalhes[0];
    return typeof primeiro === 'string' ? primeiro : primeiro?.message || primeiro?.mensagem || mensagemPadrao;
  }
  if (detalhes && typeof detalhes === 'object') {
    const primeiro = Object.values(detalhes)[0];
    if (primeiro) return Array.isArray(primeiro) ? primeiro[0] : String(primeiro);
  }
  if (typeof data === 'string' && data.trim()) return data;

  if (status === 401) return 'Sessão expirada. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para essa ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente novamente em instantes.';

  return mensagemPadrao;
}

export function mapearErroApi(erro, contexto = 'salvar os dados') {
  const status = erro?.response?.status;
  const codigo = erro?.response?.data?.code || erro?.response?.data?.codigo;
  const mensagem = extrairMensagemErro(erro, `Não foi possível ${contexto}. Tente novamente.`);

  if (!erro?.response) return { tipo: 'offline', codigo, mensagem, recuperacao: 'Verifique sua conexão e tente novamente.' };
  if (status === 409) return { tipo: 'conflito', codigo, mensagem, recuperacao: 'Atualize os dados antes de tentar novamente.' };
  if (status === 400 || status === 422) return { tipo: 'validacao', codigo, mensagem, recuperacao: 'Revise os campos informados.' };
  if (status === 401) return { tipo: 'autenticacao', codigo, mensagem, recuperacao: 'Entre novamente para continuar.' };
  return { tipo: status >= 500 ? 'servidor' : 'inesperado', codigo, mensagem, recuperacao: 'Tente novamente em instantes.' };
}
