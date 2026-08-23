import { useCallback, useEffect, useState } from 'react';
import { fitnessApi } from '../../../../services/fitnessApi';
import { DIAS_SEMANA } from '../utils/diasSemana';

const FICHA_VAZIA = Object.fromEntries(DIAS_SEMANA.map((dia) => [dia.id, []]));

/**
 * CORREÇÃO (refatoração da execução de treino): esta ficha vivia inteira em
 * localStorage, sem nenhuma chamada à API — nada persistia de verdade entre
 * dispositivos, e "adicionar exercício" sempre gravava `carga: '0 kg'`
 * fixo. Agora busca as fichas reais do backend (uma por dia da semana) e,
 * para cada uma, espia a sessão de hoje (sem criar — ver
 * `fitnessApi.buscarSessaoDeHoje`) para saber quais exercícios já foram
 * concluídos hoje e com que carga, sem inventar zero para o que ainda não
 * foi registrado.
 *
 * Mantém a MESMA forma de retorno de antes (`fichasPorDia` com
 * `{id, nome, detalhes, carga, concluido}` por item) para não quebrar
 * `TreinoPage` nem o widget `CartaoProximoTreino` da Home — só a fonte dos
 * dados mudou, de localStorage para API real.
 */
export function useFichasTreino() {
  const [treinosPorDia, setTreinosPorDia] = useState({});
  const [fichasPorDia, setFichasPorDia] = useState(FICHA_VAZIA);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const treinos = await fitnessApi.listarTreinos();
      const treinosMap = {};
      (treinos || []).forEach((treino) => {
        if (treino.diaSemana) treinosMap[treino.diaSemana] = treino;
      });
      setTreinosPorDia(treinosMap);

      // Para cada ficha existente, espia a sessão de hoje em paralelo —
      // é o que diz quais exercícios já foram concluídos hoje e com que
      // carga (sem inventar "0 kg" para o que não tem registro).
      const sessoesPorTreino = await Promise.all(
        Object.values(treinosMap).map((treino) =>
          fitnessApi.buscarSessaoDeHoje(treino.id).catch(() => null)
        )
      );

      const novaFicha = { ...FICHA_VAZIA };
      Object.values(treinosMap).forEach((treino, indice) => {
        const sessaoHoje = sessoesPorTreino[indice];
        novaFicha[treino.diaSemana] = (treino.exercicios || []).map((exercicio) =>
          montarItemExibicao(exercicio, sessaoHoje)
        );
      });
      setFichasPorDia(novaFicha);
    } catch (err) {
      console.error('Erro ao carregar fichas de treino:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const garantirTreinoDoDia = async (dia) => {
    const existente = treinosPorDia[dia];
    if (existente) return existente;

    const infoDia = DIAS_SEMANA.find((item) => item.id === dia);
    const criado = await fitnessApi.criarTreino({
      nomeTreino: infoDia?.foco || 'Treino',
      diaSemana: dia,
    });
    setTreinosPorDia((prev) => ({ ...prev, [dia]: criado }));
    return criado;
  };

  const adicionarExercicio = async (dia, exercicioCatalogo) => {
    try {
      const treino = await garantirTreinoDoDia(dia);
      const { series, repeticoes } = interpretarSeriesPadrao(exercicioCatalogo.seriesPadrao);
      await fitnessApi.adicionarExercicioTreino(treino.id, {
        nome: exercicioCatalogo.nome,
        series,
        repeticoes,
        descricao: exercicioCatalogo.descricao || exercicioCatalogo.seriesPadrao,
      });
      await carregar();
      return true;
    } catch (err) {
      // Duplicidade (409) e outros erros já viram toast pelo interceptor
      // global do Axios — aqui só evitamos uma promise rejeitada sem dono.
      console.error('Erro ao adicionar exercício:', err);
      return false;
    }
  };

  const removerExercicio = async (dia, idExercicio) => {
    try {
      await fitnessApi.removerExercicioTreino(idExercicio);
      await carregar();
    } catch (err) {
      console.error('Erro ao remover exercício:', err);
    }
  };

  /**
   * Alterna "concluído" registrando (ou removendo) uma série de hoje para
   * o exercício. Sem campo de carga na UI ainda (isso é a próxima fase da
   * refatoração), então a série é criada só com as repetições planejadas
   * do exercício — a carga fica sem registro (não vira "0 kg" fantasioso).
   */
  const toggleConcluido = async (dia, idExercicio) => {
    const treino = treinosPorDia[dia];
    if (!treino) return;

    const itemAtual = (fichasPorDia[dia] || []).find((item) => item.id === idExercicio);
    if (!itemAtual) return;

    try {
      const sessao = await fitnessApi.obterOuCriarSessaoDoDia(treino.id);

      if (itemAtual.concluido) {
        const serieConcluida = (sessao.series || [])
          .filter((serie) => serie.exercicioId === idExercicio && serie.status === 'CONCLUIDA')
          .sort((a, b) => (b.id || 0) - (a.id || 0))[0];
        if (serieConcluida) {
          await fitnessApi.excluirSerie(serieConcluida.id, true);
        }
      } else {
        const exercicio = treino.exercicios.find((item) => item.id === idExercicio);
        const novaSerie = await fitnessApi.registrarSerie(sessao.id, {
          exercicioId: idExercicio,
          carga: null,
          repeticoes: exercicio?.repeticoes ?? 0,
          tipo: 'NORMAL',
        });
        await fitnessApi.concluirSerie(novaSerie.id);
      }

      await carregar();
    } catch (err) {
      console.error('Erro ao atualizar conclusão do exercício:', err);
    }
  };

  return {
    fichasPorDia,
    treinosPorDia,
    carregando,
    toggleConcluido,
    removerExercicio,
    adicionarExercicio,
    recarregar: carregar,
  };
}

function montarItemExibicao(exercicio, sessaoHoje) {
  const seriesDoExercicioHoje = (sessaoHoje?.series || []).filter(
    (serie) => serie.exercicioId === exercicio.id
  );
  const ultimaConcluidaHoje = [...seriesDoExercicioHoje]
    .filter((serie) => serie.status === 'CONCLUIDA')
    .sort((a, b) => (b.id || 0) - (a.id || 0))[0];

  return {
    id: exercicio.id,
    nome: exercicio.nome,
    detalhes: exercicio.descricao || formatarSeriesReps(exercicio.series, exercicio.repeticoes),
    // "—" (sem registro) é visualmente diferente de "0 kg" — nunca inventamos
    // carga zero como se fosse desempenho real.
    carga: ultimaConcluidaHoje?.carga != null ? `${ultimaConcluidaHoje.carga} kg` : '—',
    concluido: Boolean(ultimaConcluidaHoje),
  };
}

function formatarSeriesReps(series, repeticoes) {
  if (!series && !repeticoes) return '';
  return `${series ?? '?'} séries x ${repeticoes ?? '?'} rep`;
}

/**
 * Interpreta o formato do catálogo estático ("4x8-10", "3xFalha") em
 * `{ series, repeticoes }` numéricos para persistir no Exercicio. Quando a
 * parte de repetições não é numérica (ex: "Falha"), `repeticoes` fica nulo
 * — a UI deve tratar isso como "sem alvo numérico definido", nunca zero.
 */
function interpretarSeriesPadrao(seriesPadrao) {
  if (!seriesPadrao) return { series: null, repeticoes: null };

  const match = String(seriesPadrao).match(/^(\d+)x(.+)$/i);
  if (!match) return { series: null, repeticoes: null };

  const series = parseInt(match[1], 10);
  const repsMatch = match[2].match(/\d+/);
  const repeticoes = repsMatch ? parseInt(repsMatch[0], 10) : null;

  return { series: Number.isNaN(series) ? null : series, repeticoes };
}
