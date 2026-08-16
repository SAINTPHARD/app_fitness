import { useState } from 'react';
import { useFichasTreino } from './hooks/useFichasTreino';
import { useSessaoExecucao } from './hooks/useSessaoExecucao';
import { useCronometro } from './hooks/useCronometro';
import { useTemporizadorDescanso } from './hooks/useTemporizadorDescanso';
import { DIAS_SEMANA, obterIdDiaDaSemanaAtual } from './utils/diasSemana';
import { gruposMusculares } from './utils/catalogoExercicios';
import { contarExerciciosConcluidos } from './utils/progressoTreino';
import { notificarErro } from '../../../utils/notificacoes';
import CardExercicioExecucao from './components/CardExercicioExecucao';
import CronometroSessao from './components/CronometroSessao';
import TemporizadorDescanso from './components/TemporizadorDescanso';
import ResumoTreinoModal from './components/ResumoTreinoModal';
import './treino.css';

const DURACAO_DESCANSO_PADRAO_SEGUNDOS = 60;

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
  const [grupoCatalogoAtivo, setGrupoCatalogoAtivo] = useState(null);

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

  // Item "quando o usuário concluir uma série: iniciar automaticamente o
  // temporizador de descanso" — a série já foi salva no backend por
  // `concluirSerie` antes deste callback rodar.
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

  const handleRemoverExercicio = async (idExercicio) => {
    await removerExercicio(diaSelecionado, idExercicio);
  };

  const exerciciosComProgresso = contarExerciciosConcluidos(exerciciosDoDia, seriesDoExercicio);
  const totalExercicios = exerciciosDoDia.length;
  const percentualProgresso = totalExercicios > 0 ? Math.round((exerciciosComProgresso / totalExercicios) * 100) : 0;
  const statusSessao = sessao?.status || 'PENDENTE';

  // "Verificar se existem exercícios ou séries pendentes" antes de encerrar
  // — pendente = algum exercício que ainda não teve TODAS as séries
  // concluídas, incluindo exercícios sem séries registradas.
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

      {/* Seletor de Dias da Semana (Abas Horizontais) */}
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

      {/* Cabeçalho da sessão de execução do dia */}
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
              <span className="indicadorConexao indicadorConexaoOffline" title="Sem conexão — as alterações ficam salvas localmente">
                Offline
              </span>
            ) : filaPendente.length > 0 ? (
              <span className="indicadorConexao indicadorConexaoSincronizando" title="Enviando alterações salvas localmente">
                Sincronizando…
              </span>
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
        <div className="barraProgresso" role="progressbar" aria-valuenow={percentualProgresso} aria-valuemin={0} aria-valuemax={100}>
          <div className="barraProgressoPreenchida" style={{ width: `${percentualProgresso}%` }} />
        </div>
      </div>

      {/* Temporizador de descanso: aparece inativo (presets) sempre que há
          uma ficha, e vira o painel ativo assim que uma série é concluída. */}
      {treinoDoDia && <TemporizadorDescanso temporizador={temporizadorDescanso} />}

      {/* Lista de Exercícios da Ficha do Dia, cada um expansível com séries */}
      <div className="sessionContainer">
        <h3>Exercícios Programados</h3>
        {carregando ? (
          <div className="emptyStateCard">
            <p>Carregando ficha…</p>
          </div>
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

      {/* Modal / Gaveta para Escolher Exercícios do Catálogo */}
      {modalAberto && (
        <div className="modalOverlay">
          <div className="modalCatalogo">
            <div className="modalHeader">
              <h3>Adicionar à Ficha: {diaAtualInfo?.label}</h3>
              <button className="btnClose" onClick={() => setModalAberto(false)}>
                ✕
              </button>
            </div>
            <p className="modalSub">Selecione um grupo muscular para escolher o exercício:</p>

            <div className="catalogoAcordeon">
              {gruposMusculares.map((grupo) => {
                const isOpen = grupoCatalogoAtivo === grupo.id;
                return (
                  <div key={grupo.id} className="grupoBox">
                    <div className="grupoBoxHeader" onClick={() => setGrupoCatalogoAtivo(isOpen ? null : grupo.id)}>
                      <span>
                        {grupo.icone} {grupo.nome} ({grupo.exercicios.length})
                      </span>
                      <span>{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {isOpen && (
                      <div className="grupoBoxItens">
                        {grupo.exercicios.map((ex) => (
                          <div key={ex.id} className="itemExercicioCatalogo">
                            <div>
                              <strong>{ex.nome}</strong>
                              <span className="subSugerido">Sugestão: {ex.seriesPadrao}</span>
                            </div>
                            <button className="btnAddItem" onClick={() => adicionarAoTreinoDoDia(ex)}>
                              + Escolher
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {resumo && <ResumoTreinoModal resumo={resumo} aoFechar={() => setResumo(null)} />}
    </section>
  );
}
