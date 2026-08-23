import { useState } from 'react';
import { useFichasTreino } from './hooks/useFichasTreino';
import { useSessaoExecucao } from './hooks/useSessaoExecucao';
import { useCronometro } from './hooks/useCronometro';
import { useTemporizadorDescanso } from './hooks/useTemporizadorDescanso';
import { DIAS_SEMANA, obterIdDiaDaSemanaAtual } from './utils/diasSemana';
import { contarExerciciosConcluidos } from './utils/progressoTreino';
import { notificarErro, notificarSucesso } from '../../../utils/notificacoes';
import CardExercicioExecucao from './components/CardExercicioExecucao';
import CronometroSessao from './components/CronometroSessao';
import TemporizadorDescanso from './components/TemporizadorDescanso';
import ResumoTreinoModal from './components/ResumoTreinoModal';
import CatalogoExercicios from './components/CatalogoExercicios';
import ModalAdicionarExercicio from './components/ModalAdicionarExercicio';
import './treino.css';

const DURACAO_DESCANSO_PADRAO_SEGUNDOS = 60;

const ALVOS_API_NINJAS = [
  { id: 'pectorals', nome: 'Peitoral' },
  { id: 'biceps', nome: 'Bíceps' },
  { id: 'triceps', nome: 'Tríceps' },
  { id: 'quads', nome: 'Quadríceps' },
  { id: 'hamstrings', nome: 'Posteriores de coxa' },
  { id: 'glutes', nome: 'Glúteos' },
  { id: 'lats', nome: 'Dorsais' },
  { id: 'delts', nome: 'Deltoides' },
  { id: 'abs', nome: 'Abdominais' },
  { id: 'calves', nome: 'Panturrilhas' },
];

const ROTULO_STATUS = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  PAUSADO: 'Pausado',
  CONCLUIDO: 'Concluído',
};

export default function TreinoPage() {
  const [diaSelecionado, setDiaSelecionado] = useState(obterIdDiaDaSemanaAtual);
  const { treinosPorDia, carregando, removerExercicio, adicionarExercicio } = useFichasTreino();

  const [modalAberto, setModalAberto] = useState(false);
  const [musculoCatalogoExterno, setMusculoCatalogoExterno] = useState(ALVOS_API_NINJAS[0].id);

  const treinoDoDia = treinosPorDia[diaSelecionado] || null;
  const exerciciosDoDia = treinoDoDia?.exercicios || [];
  const diaAtualInfo = DIAS_SEMANA.find((d) => d.id === diaSelecionado);

  const {
    sessao,
    processando,
    online,
    filaPendente,
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
  } = useSessaoExecucao(treinoDoDia);

  const cronometro = useCronometro();
  const temporizadorDescanso = useTemporizadorDescanso();
  const [resumo, setResumo] = useState(null);
  const [encerrando, setEncerrando] = useState(false);

  const handleIniciarSessao = async () => {
    await iniciarSessao();
    cronometro.iniciar();
  };

  const handlePausarSessao = async () => {
    await pausarSessao();
    cronometro.pausar();
  };

  const handleRetomarSessao = async () => {
    await retomarSessao();
    cronometro.retomar();
  };

  const handleConcluirSerie = async (idSerie) => {
    const resultado = await concluirSerie(idSerie);
    if (resultado) {
      temporizadorDescanso.iniciar(DURACAO_DESCANSO_PADRAO_SEGUNDOS);
    }
  };

  const adicionarAoTreinoDoDia = (exercicioCatalogo) => {
    const jaExiste = exerciciosDoDia.some(
      (ex) => ex.nome.trim().toLowerCase() === exercicioCatalogo.nome.trim().toLowerCase()
    );
    if (jaExiste) {
      notificarErro('Este exercício já faz parte do treino atual.');
      return;
    }

    adicionarExercicio(diaSelecionado, exercicioCatalogo);
    setModalAberto(false);
  };

  const adicionarExercicioExternoAoTreino = async (exercicioExterno) => {
    const exercicioCatalogo = {
      nome: exercicioExterno.name,
      seriesPadrao: '3x10',
      descricao: exercicioExterno.instructions,
    };

    const jaExiste = exerciciosDoDia.some(
      (exercicio) => exercicio.nome.trim().toLowerCase() === exercicioCatalogo.nome.trim().toLowerCase()
    );
    if (jaExiste) {
      notificarErro('Este exercício já faz parte do treino atual.');
      return;
    }

    const adicionado = await adicionarExercicio(diaSelecionado, exercicioCatalogo);
    if (adicionado) {
      notificarSucesso(`"${exercicioCatalogo.nome}" foi adicionado ao treino.`);
    }
  };

  const handleRemoverExercicio = async (idExercicio) => {
    await removerExercicio(diaSelecionado, idExercicio);
  };

  const exerciciosComProgresso = contarExerciciosConcluidos(exerciciosDoDia, seriesDoExercicio);
  const totalExercicios = exerciciosDoDia.length;
  const percentualProgresso = totalExercicios > 0 ? Math.round((exerciciosComProgresso / totalExercicios) * 100) : 0;
  const statusSessao = sessao?.status || 'PENDENTE';

  const haPendencias =
    exerciciosComProgresso < totalExercicios ||
    (sessao?.series || []).some((serie) => serie.status === 'EM_ANDAMENTO');

  const handleEncerrarTreino = async () => {
    if (!sessao) return;

    if (haPendencias) {
      const confirmar = window.confirm(
        `${totalExercicios - exerciciosComProgresso} exercício(s) ainda não concluído(s). Encerrar o treino mesmo assim?`
      );
      if (!confirmar) return;
    }

    setEncerrando(true);
    try {
      cronometro.pausar();
      await concluirSessao();
      const resumoFinal = await buscarResumo();
      setResumo(resumoFinal);
    } catch (err) {
      console.error('Erro ao encerrar treino:', err);
    } finally {
      setEncerrando(false);
    }
  };

  return (
    <section className="treinoPage">
      <div className="heading">
        <div>
          <p className="label">Gestão de Hipertrofia</p>
          <h2 className="title">Ficha de Treino Semanal</h2>
        </div>
        <button className="btnPrincipal" onClick={() => setModalAberto(true)}>
          + Adicionar Exercício ao Dia
        </button>
      </div>

      {/* Seletor de Dias da Semana */}
      <div className="diasSemanaScroll">
        {DIAS_SEMANA.map((dia) => (
          <button
            key={dia.id}
            type="button"
            className={`diaTab ${diaSelecionado === dia.id ? 'ativo' : ''}`}
            onClick={() => setDiaSelecionado(dia.id)}
          >
            <span className="diaLabel">{dia.label}</span>
            <span className="diaFoco">{dia.foco}</span>
          </button>
        ))}
      </div>

      {/* Cabeçalho da sessão */}
      <div className="statsCard cabecalhoSessao">
        <div className="cabecalhoSessaoTopo">
          <div>
            <p>
              {treinoDoDia?.nomeTreino || diaAtualInfo?.foco} — {diaAtualInfo?.label}
            </p>
            <strong>
              {exerciciosComProgresso} de {totalExercicios} exercícios concluídos
            </strong>
          </div>
          <div className="cabecalhoSessaoAcoes">
            {!online ? (
              <span className="indicadorConexao indicadorConexaoOffline">Offline</span>
            ) : filaPendente.length > 0 ? (
              <span className="indicadorConexao indicadorConexaoSincronizando">Sincronizando…</span>
            ) : null}
            <span className={`statusSessaoBadge statusSessao-${statusSessao}`}>{ROTULO_STATUS[statusSessao]}</span>
            {treinoDoDia && (
              <CronometroSessao
                segundos={cronometro.segundos}
                rodando={cronometro.rodando}
                jaComecou={statusSessao !== 'PENDENTE'}
                aoIniciar={handleIniciarSessao}
                aoPausar={handlePausarSessao}
                aoRetomar={handleRetomarSessao}
              />
            )}
            {sessao && statusSessao !== 'CONCLUIDO' && (
              <button type="button" className="btnEncerrarTreino" onClick={handleEncerrarTreino} disabled={encerrando}>
                {encerrando ? 'Encerrando…' : 'Encerrar treino'}
              </button>
            )}
          </div>
        </div>
        <div className="barraProgresso">
          <div className="barraProgressoPreenchida" style={{ width: `${percentualProgresso}%` }} />
        </div>
      </div>

      {/* Temporizador */}
      {treinoDoDia && <TemporizadorDescanso temporizador={temporizadorDescanso} />}

      {/* Lista de Exercícios */}
      <div className="sessionContainer">
        <h3>Exercícios Programados</h3>
        {carregando ? (
          <div className="emptyStateCard"><p>Carregando ficha…</p></div>
        ) : exerciciosDoDia.length === 0 ? (
          <div className="emptyStateCard">
            <p>Nenhum exercício cadastrado para {diaAtualInfo?.label}.</p>
            <button className="btnSecundario" onClick={() => setModalAberto(true)}>
              Adicionar primeiro exercício
            </button>
          </div>
        ) : (
          exerciciosDoDia.map((exercicio) => (
            <CardExercicioExecucao
              key={exercicio.id}
              exercicio={exercicio}
              seriesHoje={seriesDoExercicio(exercicio.id)}
              processando={processando}
              aoAdicionarSerie={adicionarSerie}
              aoAtualizarSerie={atualizarSerie}
              aoConcluirSerie={handleConcluirSerie}
              aoExcluirSerie={excluirSerie}
              aoRemover={handleRemoverExercicio}
            />
          ))
        )}
      </div>

      {/* Catálogo externo da API Ninjas */}
      <div className="catalogoExternoContainer">
        <label className="catalogoExternoSeletor">
          <span>Grupo muscular do catálogo</span>
          <select value={musculoCatalogoExterno} onChange={(event) => setMusculoCatalogoExterno(event.target.value)}>
            {ALVOS_API_NINJAS.map((alvo) => (
              <option key={alvo.id} value={alvo.id}>{alvo.nome}</option>
            ))}
          </select>
        </label>
        <CatalogoExercicios
          musculoAlvo={musculoCatalogoExterno}
          onAdicionarExercicio={adicionarExercicioExternoAoTreino}
        />
      </div>

      {/* Gaveta de seleção manual de exercícios */}
      {modalAberto && (
        <ModalAdicionarExercicio
          diaLabel={diaAtualInfo?.label}
          aoFechar={() => setModalAberto(false)}
          aoSelecionar={adicionarAoTreinoDoDia}
        />
      )}

      {resumo && <ResumoTreinoModal resumo={resumo} aoFechar={() => setResumo(null)} />}
    </section>
  );
}
