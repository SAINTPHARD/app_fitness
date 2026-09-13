export function mensagemErroAutenticacao(error) {
  const status = error?.status ?? error?.response?.status;
  const detalhe = error?.response?.data?.message
    || error?.response?.data?.mensagem
    || error?.message;

  if (status === 401) return 'E-mail ou senha inválidos.';
  if (status === 400 || status === 422) {
    return detalhe || 'Revise os dados informados e tente novamente.';
  }
  if (status === 0 || status >= 500) {
    return 'Serviço temporariamente indisponível. Tente novamente em instantes.';
  }
  return detalhe || 'Não foi possível concluir a solicitação.';
}
