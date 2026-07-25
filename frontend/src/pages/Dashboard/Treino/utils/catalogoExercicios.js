// Catálogo completo de exercícios por grupo muscular, usado no modal de
// "Adicionar exercício" da ficha do dia.
export const gruposMusculares = [
  {
    id: 'peito',
    nome: 'Peito',
    icone: '💪',
    exercicios: [
      { id: 1, nome: 'Supino Reto com Barra', seriesPadrao: '4x8-10' },
      { id: 2, nome: 'Supino Inclinado com Barra', seriesPadrao: '4x8-10' },
      { id: 3, nome: 'Supino Declinado', seriesPadrao: '3x10-12' },
      { id: 4, nome: 'Crucifixo Reto', seriesPadrao: '3x12' },
      { id: 5, nome: 'Flexão de Braço', seriesPadrao: '3xFalha' },
    ],
  },
  {
    id: 'costas',
    nome: 'Costas',
    icone: '🦾',
    exercicios: [
      { id: 20, nome: 'Puxada Alta', seriesPadrao: '4x10' },
      { id: 21, nome: 'Remada Curvada', seriesPadrao: '4x8-10' },
      { id: 22, nome: 'Remada Baixa', seriesPadrao: '3x12' },
      { id: 23, nome: 'Barra Fixa', seriesPadrao: '3xFalha' },
    ],
  },
  {
    id: 'pernas',
    nome: 'Pernas',
    icone: '🦵',
    exercicios: [
      { id: 100, nome: 'Agachamento Livre', seriesPadrao: '4x8' },
      { id: 101, nome: 'Leg Press 45°', seriesPadrao: '4x10' },
      { id: 102, nome: 'Cadeira Extensora', seriesPadrao: '3x15' },
      { id: 103, nome: 'Cadeira Flexora', seriesPadrao: '3x15' },
      { id: 104, nome: 'Stiff', seriesPadrao: '4x10' },
    ],
  },
  {
    id: 'ombros',
    nome: 'Ombros',
    icone: '🏋️',
    exercicios: [
      { id: 40, nome: 'Desenvolvimento Militar', seriesPadrao: '4x8-10' },
      { id: 41, nome: 'Elevação Lateral', seriesPadrao: '3x15' },
      { id: 42, nome: 'Crucifixo Invertido', seriesPadrao: '3x15' },
    ],
  },
  {
    id: 'bracos',
    nome: 'Bíceps e Tríceps',
    icone: '💥',
    exercicios: [
      { id: 60, nome: 'Rosca Direta', seriesPadrao: '4x10' },
      { id: 61, nome: 'Rosca Martelo', seriesPadrao: '3x12' },
      { id: 80, nome: 'Tríceps Pulley', seriesPadrao: '4x10' },
      { id: 81, nome: 'Tríceps Corda', seriesPadrao: '3x12' },
    ],
  },
];
