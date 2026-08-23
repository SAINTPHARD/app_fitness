/**
 * Barramento de notificações (pub/sub) minimalista, sem dependências.
 *
 * Existe para permitir que código fora da árvore React — em particular o
 * interceptor de resposta do Axios em `services/api.js` — dispare toasts de
 * erro/sucesso/informação sem precisar de acesso a contexto React.
 * `ToastHost` (components/ui/Toast) é o único assinante em produção;
 * qualquer outro lugar pode chamar as funções abaixo diretamente.
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

/**
 * Aviso neutro (nem erro, nem confirmação). Usado, por exemplo, para
 * avisar que o backend está "acordando" no primeiro acesso — pintar isso
 * de verde (sucesso) ou vermelho (erro) passaria a mensagem errada.
 */
export function notificarInfo(mensagem) {
  emitir({ id: ++idSequencial, tipo: 'info', mensagem });
}
