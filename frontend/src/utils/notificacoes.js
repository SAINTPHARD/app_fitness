/**
 * Barramento de notificações (pub/sub) minimalista, sem dependências.
 *
 * Existe para permitir que código fora da árvore React — em particular o
 * interceptor de resposta do Axios em `services/api.js` — dispare toasts de
 * erro/sucesso sem precisar de acesso a contexto React. `ToastProvider`
 * (components/ui/Toast) é o único assinante em produção; qualquer outro
 * lugar pode chamar `notificarErro`/`notificarSucesso` diretamente.
 */
let idSequencial = 0;
const ouvintes = new Set();

function emitir(notificacao) {
  ouvintes.forEach((ouvinte) => ouvinte(notificacao));
}

export function assinarNotificacoes(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

export function notificarErro(mensagem) {
  emitir({ id: ++idSequencial, tipo: 'erro', mensagem });
}

export function notificarSucesso(mensagem) {
  emitir({ id: ++idSequencial, tipo: 'sucesso', mensagem });
}
