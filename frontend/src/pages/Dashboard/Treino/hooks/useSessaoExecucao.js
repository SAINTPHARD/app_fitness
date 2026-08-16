import { useCallback, useEffect, useRef, useState } from 'react';
import { fitnessApi } from '../../../../services/fitnessApi';
import { notificarErro } from '../../../../utils/notificacoes';
import { removerDaFila } from '../utils/filaOffline';
import { obterErroSerie } from '../utils/validarSerie';
import { useSincronizacaoOffline } from './useSincronizacaoOffline';

const PREFIXO_TEMP = 'temp-';
const ehTemp = (id) => typeof id === 'string' && id.startsWith(PREFIXO_TEMP);
const gerarChave = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

/**
 * Gerencia a sessão de execução de hoje para a ficha do dia selecionado:
 * abrir/retomar a sessão sob demanda, e criar/editar/concluir/excluir
 * séries por exercício — resiliente a queda de conexão (ver
 * `useSincronizacaoOffline`): uma série criada offline aparece na hora
 * como "pendente de sincronização" (id temporário `temp-...`) e vira a
 * série real assim que a fila sincroniza.
 *
 * LIMITAÇÃO CONHECIDA: editar/concluir/excluir uma série que ainda não
 * sincronizou (ainda com id temporário) fica bloqueado na UI até ela virar
 * real — encadear duas operações offline sobre a mesma série exigiria
 * resolver dependência de ordem na fila, o que não é o objetivo desta
 * fase. Cancelar (excluir) uma criação ainda pendente funciona sempre,
 * mesmo offline, porque nesse caso não existe nada no servidor para
 * reconciliar.
 */
export function useSessaoExecucao(treino) {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [processando, setProcessando] = useState({});
  const sessaoRef = useRef(null);
  const treinoRef = useRef(treino);

  useEffect(() => {
    sessaoRef.current = sessao;
  }, [sessao]);

  useEffect(() => {
    treinoRef.current = treino;
  }, [treino]);

  const recarregarSessaoDoServidor = useCallback(async () => {
    if (!treinoRef.current) return;
    try {
      const resultado = await fitnessApi.buscarSessaoDeHoje(treinoRef.current.id);
      setSessao(resultado);
    } catch (err) {
      console.error('Erro ao recarregar sessão após sincronização:', err);
    }
  }, []);

  const { online, filaPendente, estadoPorChave, executar } = useSincronizacaoOffline({
    aoSincronizarComSucesso: recarregarSessaoDoServidor,
  });

  useEffect(() => {
    let cancelado = false;
    if (!treino) {
      setSessao(null);
      return undefined;
    }

    setCarregando(true);
    fitnessApi
      .buscarSessaoDeHoje(treino.id)
      .then((resultado) => {
        if (!cancelado) setSessao(resultado);
      })
      .catch((err) => {
        console.error('Erro ao buscar sessão de hoje:', err);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [treino]);

  const marcarProcessando = (chave, valor) => {
    setProcessando((prev) => ({ ...prev, [chave]: valor }));
  };

  const garantirSessao = useCallback(async () => {
    if (sessaoRef.current) return sessaoRef.current;
    const nova = await fitnessApi.obterOuCriarSessaoDoDia(treino.id);
    setSessao(nova);
    return nova;
  }, [treino]);

  const upsertSerie = (base, serieAtualizada) => {
    const seriesAtuais = base?.series || [];
    const existe = seriesAtuais.some((serie) => serie.id === serieAtualizada.id);
    const novasSeries = existe
      ? seriesAtuais.map((serie) => (serie.id === serieAtualizada.id ? serieAtualizada : serie))
      : [...seriesAtuais, serieAtualizada];
    return { ...base, series: novasSeries };
  };

  const seriesDoExercicio = (exercicioId) =>
    (sessao?.series || [])
      .filter((serie) => serie.exercicioId === exercicioId)
      .sort((a, b) => a.numeroSerie - b.numeroSerie);

  const adicionarSerie = async (exercicioId, dadosIniciais = {}) => {
    const chave = gerarChave();
    marcarProcessando(`add-${exercicioId}`, true);
    try {
      const sessaoAtual = await garantirSessao();
      const payload = {
        exercicioId,
        carga: dadosIniciais.carga ?? null,
        repeticoes: dadosIniciais.repeticoes ?? null,
        tipo: dadosIniciais.tipo || 'NORMAL',
        idempotencyKey: chave,
      };

      const novaSerie = await executar(chave, 'registrarSerie', [sessaoAtual.id, payload]);

      if (novaSerie) {
        setSessao((prev) => upsertSerie(prev || sessaoAtual, novaSerie));
        return novaSerie;
      }

      // Offline: mostra a série imediatamente com id temporário — vira a
      // série real quando a fila sincronizar (`recarregarSessaoDoServidor`).
      const seriesExistentes = seriesDoExercicio(exercicioId).length;
      const serieOtimista = {
        id: `${PREFIXO_TEMP}${chave}`,
        exercicioId,
        nomeExercicio: null,
        ordemExercicio: 0,
        numeroSerie: seriesExistentes + 1,
        carga: payload.carga,
        repeticoes: payload.repeticoes,
        tipo: payload.tipo,
        status: 'EM_ANDAMENTO',
        pendenteSincronizacao: true,
      };
      setSessao((prev) => upsertSerie(prev || sessaoAtual, serieOtimista));
      return serieOtimista;
    } catch (err) {
      console.error('Erro ao adicionar série:', err);
      return null;
    } finally {
      marcarProcessando(`add-${exercicioId}`, false);
    }
  };

  const atualizarSerie = async (serieId, dados) => {
    if (ehTemp(serieId)) {
      // Ainda não existe no servidor — só atualiza o rascunho local (ver
      // limitação documentada no topo do arquivo).
      setSessao((prev) => ({
        ...prev,
        series: (prev?.series || []).map((serie) =>
          serie.id === serieId ? { ...serie, carga: dados.carga ?? null, repeticoes: dados.repeticoes ?? null } : serie
        ),
      }));
      return null;
    }

    const chave = `serie-${serieId}`;
    marcarProcessando(chave, true);
    try {
      const payload = {
        exercicioId: dados.exercicioId,
        carga: dados.carga ?? null,
        repeticoes: dados.repeticoes ?? null,
        tipo: dados.tipo || 'NORMAL',
      };
      const atualizada = await executar(chave, 'atualizarSerie', [serieId, payload]);

      if (atualizada) {
        setSessao((prev) => upsertSerie(prev, atualizada));
        return atualizada;
      }

      // Offline: aplica a edição otimisticamente — a fila reenvia o mesmo
      // PUT (idempotente por natureza: mesmo id, mesmo resultado final).
      setSessao((prev) => ({
        ...prev,
        series: (prev?.series || []).map((serie) =>
          serie.id === serieId ? { ...serie, ...payload, pendenteSincronizacao: true } : serie
        ),
      }));
      return null;
    } catch (err) {
      console.error('Erro ao atualizar série:', err);
      return null;
    } finally {
      marcarProcessando(chave, false);
    }
  };

  const concluirSerie = async (serieId) => {
    if (ehTemp(serieId)) {
      // Bloqueado na UI (ver CardExercicioExecucao) — chegando aqui mesmo
      // assim, não faz nada em vez de arriscar um estado inconsistente.
      console.warn('Não é possível concluir uma série que ainda não sincronizou.');
      return null;
    }

    const serieAtual = (sessaoRef.current?.series || []).find((serie) => serie.id === serieId);
    const erroPreenchimento = obterErroSerie(serieAtual?.carga, serieAtual?.repeticoes);
    if (erroPreenchimento) {
      notificarErro(erroPreenchimento);
      return null;
    }

    const chave = `serie-${serieId}`;
    marcarProcessando(chave, true);
    try {
      const concluida = await executar(chave, 'concluirSerie', [serieId]);

      if (concluida) {
        setSessao((prev) => upsertSerie(prev, concluida));
        return concluida;
      }

      // Offline: conclusão otimista local. Repetições precisam já estar
      // preenchidas (mesma regra do backend) — sem isso, nem tenta.
      const serieOtimista = {
        ...serieAtual,
        status: 'CONCLUIDA',
        horarioConclusao: new Date().toISOString(),
        pendenteSincronizacao: true,
      };
      setSessao((prev) => ({
        ...prev,
        series: (prev?.series || []).map((serie) => (serie.id === serieId ? serieOtimista : serie)),
      }));
      // Truthy de propósito: o descanso deve começar mesmo com a
      // confirmação do servidor ainda pendente — é uma ajuda de UX local,
      // não depende de round-trip de rede (ver `TreinoPage.handleConcluirSerie`).
      return serieOtimista;
    } catch (err) {
      console.error('Erro ao concluir série:', err);
      return null;
    } finally {
      marcarProcessando(chave, false);
    }
  };

  const iniciarSessao = async () => {
    const sessaoAtual = await garantirSessao();
    const atualizada = await fitnessApi.iniciarSessao(sessaoAtual.id);
    setSessao((prev) => ({ ...(prev || sessaoAtual), ...atualizada }));
    return atualizada;
  };

  const pausarSessao = async () => {
    if (!sessaoRef.current) return null;
    const atualizada = await fitnessApi.pausarSessao(sessaoRef.current.id);
    setSessao((prev) => ({ ...prev, ...atualizada }));
    return atualizada;
  };

  const retomarSessao = async () => {
    if (!sessaoRef.current) return null;
    const atualizada = await fitnessApi.retomarSessao(sessaoRef.current.id);
    setSessao((prev) => ({ ...prev, ...atualizada }));
    return atualizada;
  };

  const concluirSessao = async () => {
    if (!sessaoRef.current) return null;
    const atualizada = await fitnessApi.concluirSessao(sessaoRef.current.id);
    setSessao((prev) => ({ ...prev, ...atualizada }));
    return atualizada;
  };

  const buscarResumo = async () => {
    if (!sessaoRef.current) return null;
    return fitnessApi.buscarResumoSessao(sessaoRef.current.id);
  };

  const excluirSerie = async (serie) => {
    if (ehTemp(serie.id)) {
      // Cancela uma criação ainda não sincronizada: remove da fila (se
      // ainda estiver lá) e do estado local — nada chegou a existir no
      // servidor, então não há risco de duplicidade nem de "excluir
      // silenciosamente algo já salvo".
      removerDaFila(serie.id.replace(PREFIXO_TEMP, ''));
      setSessao((prev) => ({ ...prev, series: (prev?.series || []).filter((item) => item.id !== serie.id) }));
      return;
    }

    const jaConcluida = serie.status === 'CONCLUIDA';
    if (jaConcluida && !window.confirm('Esta série já foi concluída. Excluir mesmo assim?')) {
      return;
    }

    const chave = `serie-${serie.id}`;
    marcarProcessando(chave, true);
    try {
      const resultado = await executar(chave, 'excluirSerie', [serie.id, jaConcluida]);
      // `excluirSerie` na API não retorna corpo — chegando aqui sem lançar
      // (online) ou tendo enfileirado (offline), removemos do estado local
      // nos dois casos: online já foi excluída de verdade; offline, a
      // exclusão otimista evita a série "concluída" continuar aparecendo
      // como se nada tivesse acontecido enquanto aguarda conexão.
      void resultado;
      setSessao((prev) => ({ ...prev, series: (prev?.series || []).filter((item) => item.id !== serie.id) }));
    } catch (err) {
      console.error('Erro ao excluir série:', err);
      notificarErro('Não foi possível excluir a série.');
    } finally {
      marcarProcessando(chave, false);
    }
  };

  return {
    sessao,
    carregando,
    processando,
    online,
    filaPendente,
    estadoPorChave,
    seriesDoExercicio,
    adicionarSerie,
    atualizarSerie,
    concluirSerie,
    excluirSerie,
    iniciarSessao,
    pausarSessao,
    retomarSessao,
    concluirSessao,
    buscarResumo,
  };
}
