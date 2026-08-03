import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { assinarNotificacoes } from '../../../utils/notificacoes';
import './toast.css';

const DURACAO_MS = 5000;

/**
 * Host único de toasts, montado uma vez em `App.jsx`. Assina o barramento
 * de notificações (`utils/notificacoes.js`) para poder reagir a erros
 * disparados de qualquer lugar — inclusive fora da árvore React, como o
 * interceptor de resposta do Axios em `services/api.js` — sem precisar que
 * cada tela implemente seu próprio tratamento de erro isolado (padrão
 * consistente de tratamento de erro de API, ponta a ponta).
 */
export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return assinarNotificacoes((notificacao) => {
      setToasts((atual) => [...atual, notificacao]);
      setTimeout(() => {
        setToasts((atual) => atual.filter((item) => item.id !== notificacao.id));
      }, DURACAO_MS);
    });
  }, []);

  const remover = (id) => setToasts((atual) => atual.filter((item) => item.id !== id));

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toastHost" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toastItem toast-${toast.tipo}`}>
          <span>{toast.mensagem}</span>
          <button type="button" onClick={() => remover(toast.id)} aria-label="Fechar notificação">
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
