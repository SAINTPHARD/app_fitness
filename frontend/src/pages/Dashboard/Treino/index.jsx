import { useState } from 'react';
import { useFichasTreino } from './hooks/useFichasTreino';
import { DIAS_SEMANA, obterIdDiaDaSemanaAtual } from './utils/diasSemana';
import { gruposMusculares } from './utils/catalogoExercicios';
import './treino.css';

export default function TreinoPage() {
  const [diaSelecionado, setDiaSelecionado] = useState(obterIdDiaDaSemanaAtual);
  const { fichasPorDia, toggleConcluido, removerExercicio, adicionarExercicio } = useFichasTreino();

  const [modalAberto, setModalAberto] = useState(false);
  const [grupoCatalogoAtivo, setGrupoCatalogoAtivo] = useState(null);

  // Pega os exercícios do dia selecionado
  const exerciciosDoDia = fichasPorDia[diaSelecionado] || [];

  const adicionarAoTreinoDoDia = (exercicioCatalogo) => {
    adicionarExercicio(diaSelecionado, exercicioCatalogo);
    setModalAberto(false);
  };

  // CORREÇÃO (P3.15): remoção de exercício era imediata — um toque errado
  // no ícone de lixeira (comum em mobile, onde ele fica perto do botão de
  // concluir) apagava o exercício sem confirmação nem forma de desfazer.
  const confirmarRemocaoExercicio = (idExercicio, nomeExercicio) => {
    if (window.confirm(`Remover "${nomeExercicio}" da ficha de ${diaAtualInfo?.label}?`)) {
      removerExercicio(diaSelecionado, idExercicio);
    }
  };

  const diaAtualInfo = DIAS_SEMANA.find((d) => d.id === diaSelecionado);

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

      {/* Card Resumo do Dia Selecionado */}
      <div className="statsCard">
        <div>
          <p>Foco de Hoje ({diaAtualInfo?.label})</p>
          <strong>{diaAtualInfo?.foco}</strong>
        </div>
        <span className="badgeRestantes">{exerciciosDoDia.length} exercícios cadastrados</span>
      </div>

      {/* Lista de Exercícios da Ficha do Dia */}
      <div className="sessionContainer">
        <h3>Exercícios Programados</h3>
        {exerciciosDoDia.length === 0 ? (
          <div className="emptyStateCard">
            <p>Nenhum exercício cadastrado para {diaAtualInfo?.label}.</p>
            <button className="btnSecundario" onClick={() => setModalAberto(true)}>
              Adicionar primeiro exercício
            </button>
          </div>
        ) : (
          exerciciosDoDia.map((ex) => (
            <div key={ex.id} className={`sessionCard ${ex.concluido ? 'cardConcluido' : ''}`}>
              <div className="exerciseRow">
                <div>
                  <p className={ex.concluido ? 'textoRiscado' : ''}>{ex.nome}</p>
                  <span>{ex.detalhes}</span>
                </div>
                <div className="exerciseMeta">
                  <span className="cargaBadge">{ex.carga}</span>
                  <button
                    className={`btnCheck ${ex.concluido ? 'ativo' : ''}`}
                    onClick={() => toggleConcluido(diaSelecionado, ex.id)}
                  >
                    {ex.concluido ? '✓ Concluído' : 'Marcar'}
                  </button>
                  <button
                    className="btnRemover"
                    onClick={() => confirmarRemocaoExercicio(ex.id, ex.nome)}
                    title="Remover exercício"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
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
    </section>
  );
}
