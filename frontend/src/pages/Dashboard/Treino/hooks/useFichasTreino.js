import { useEffect, useState } from 'react';

const CHAVE_ARMAZENAMENTO = 'treino-fichas-por-dia';

const FICHAS_INICIAIS = {
  segunda: [
    { id: 1, nome: 'Supino Reto com Barra', detalhes: '4 séries x 8-10 rep', carga: '60 kg', concluido: false },
    { id: 2, nome: 'Tríceps Pulley', detalhes: '4 séries x 10 rep', carga: '35 kg', concluido: false },
  ],
  terca: [],
  quarta: [],
  quinta: [],
  sexta: [],
  sabado: [],
  domingo: [],
};

function lerFichasSalvas() {
  if (typeof window === 'undefined') return FICHAS_INICIAIS;

  try {
    const salvo = window.localStorage.getItem(CHAVE_ARMAZENAMENTO);
    return salvo ? { ...FICHAS_INICIAIS, ...JSON.parse(salvo) } : FICHAS_INICIAIS;
  } catch {
    return FICHAS_INICIAIS;
  }
}

/**
 * Custom hook que concentra a lógica de negócio da ficha de treino: guarda
 * os exercícios de cada dia da semana em localStorage (persistente entre
 * sessões e entre navegações — antes o estado vivia só em `useState` dentro
 * da página e se perdia toda vez que o usuário saía da tela de Treino), e
 * expõe as ações de marcar concluído/remover/adicionar.
 *
 * Também usado pela Home (somente leitura) para o widget "Próximo Treino"
 * mostrar o foco e os exercícios reais do dia — nada de dado mocado.
 */
export function useFichasTreino() {
  const [fichasPorDia, setFichasPorDia] = useState(lerFichasSalvas);

  useEffect(() => {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(fichasPorDia));
  }, [fichasPorDia]);

  const toggleConcluido = (dia, idExercicio) => {
    setFichasPorDia((prev) => ({
      ...prev,
      [dia]: (prev[dia] || []).map((exercicio) =>
        exercicio.id === idExercicio ? { ...exercicio, concluido: !exercicio.concluido } : exercicio
      ),
    }));
  };

  const removerExercicio = (dia, idExercicio) => {
    setFichasPorDia((prev) => ({
      ...prev,
      [dia]: (prev[dia] || []).filter((exercicio) => exercicio.id !== idExercicio),
    }));
  };

  const adicionarExercicio = (dia, exercicioCatalogo) => {
    const novoExercicio = {
      id: Date.now(),
      nome: exercicioCatalogo.nome,
      detalhes: exercicioCatalogo.seriesPadrao,
      carga: '0 kg',
      concluido: false,
    };

    setFichasPorDia((prev) => ({
      ...prev,
      [dia]: [...(prev[dia] || []), novoExercicio],
    }));
  };

  return { fichasPorDia, toggleConcluido, removerExercicio, adicionarExercicio };
}
