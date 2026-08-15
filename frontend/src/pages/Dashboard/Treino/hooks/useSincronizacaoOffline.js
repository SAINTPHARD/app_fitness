import { useCallback, useEffect, useRef, useState } from 'react';
import { fitnessApi } from '../../../../services/fitnessApi';
import { enfileirar, lerFila, removerDaFila } from '../utils/filaOffline';

/**
 * Executa operações de treino com resiliência a queda de conexão: se a
 * chamada falhar por erro de REDE (sem resposta do servidor — diferente de
 * um 400/409 real, que é a API respondendo "não" de propósito), a operação
 * vai para uma fila local em vez de se perder, e todo item da fila é
 * reenviado automaticamente assim que a conexão volta (`window` 'online')
 * ou quando o hook monta com a conexão já disponível.
 *
 * Cada operação tem uma `chave` estável (ver `useSessaoExecucao`) — reenviar
 * a mesma chave nunca cria duplicata porque o backend também é idempotente
 * por essa chave (criação de série) ou porque a operação já é naturalmente
 * idempotente por semântica HTTP (atualizar/concluir/excluir agindo sobre
 * um ID que já existe).
 */
export function useSincronizacaoOffline({ aoSincronizarComSucesso } = {}) {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [filaPendente, setFilaPendente] = useState(lerFila);
  const [estadoPorChave, setEstadoPorChave] = useState({});
  const sincronizandoRef = useRef(false);

  const marcarEstado = (chave, estado) => {
    setEstadoPorChave((prev) => ({ ...prev, [chave]: estado }));
  };

  const sincronizar = useCallback(async () => {
    if (sincronizandoRef.current) return;
    sincronizandoRef.current = true;

    try {
      let fila = lerFila();
      let sincronizouAlgo = false;

      for (const item of fila) {
        marcarEstado(item.chave, 'salvando');
        try {
          // eslint-disable-next-line no-await-in-loop
          await fitnessApi[item.tipo](...item.args);
          fila = removerDaFila(item.chave);
          marcarEstado(item.chave, 'salvo');
          sincronizouAlgo = true;
        } catch (err) {
          if (!err?.response) {
            // Ainda sem rede — para por aqui, tenta o resto na próxima vez
            // que "online" disparar (reenviar em ordem evita, por exemplo,
            // concluir uma série antes de o registro dela ter sido criado).
            marcarEstado(item.chave, 'offline');
            break;
          }
          // Erro real do servidor (ex: 404 porque o exercício foi removido
          // enquanto offline) — não adianta tentar de novo, descarta e
          // sinaliza erro em vez de tentar para sempre.
          fila = removerDaFila(item.chave);
          marcarEstado(item.chave, 'erro');
        }
      }

      setFilaPendente(fila);
      if (sincronizouAlgo) {
        aoSincronizarComSucesso?.();
      }
    } finally {
      sincronizandoRef.current = false;
    }
  }, [aoSincronizarComSucesso]);

  useEffect(() => {
    const aoFicarOnline = () => {
      setOnline(true);
      sincronizar();
    };
    const aoFicarOffline = () => setOnline(false);

    window.addEventListener('online', aoFicarOnline);
    window.addEventListener('offline', aoFicarOffline);

    if (navigator.onLine && lerFila().length > 0) {
      sincronizar();
    }

    return () => {
      window.removeEventListener('online', aoFicarOnline);
      window.removeEventListener('offline', aoFicarOffline);
    };
  }, [sincronizar]);

  /**
   * Executa `fitnessApi[tipo](...args)`. Se der erro de rede, enfileira
   * para retry automático e devolve `null` (a UI trata como "salvo
   * localmente, sincroniza assim que possível" — nunca como falha dura).
   * Se for erro de servidor de verdade, relança para quem chamou tratar
   * (o toast global do Axios já cobre a mensagem).
   */
  const executar = useCallback(async (chave, tipo, args) => {
    marcarEstado(chave, 'salvando');
    try {
      const resultado = await fitnessApi[tipo](...args);
      marcarEstado(chave, 'salvo');
      return resultado;
    } catch (err) {
      if (!err?.response) {
        setFilaPendente(enfileirar({ chave, tipo, args }));
        marcarEstado(chave, 'offline');
        return null;
      }
      marcarEstado(chave, 'erro');
      throw err;
    }
  }, []);

  return { online, filaPendente, estadoPorChave, executar, sincronizar };
}
