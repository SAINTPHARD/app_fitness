// Dias da semana com um foco muscular sugerido — usados tanto pelas abas da
// página Treino quanto pelo widget "Próximo Treino" da Home (fonte única).
export const DIAS_SEMANA = [
  { id: 'segunda', label: 'Segunda-feira', foco: 'Peito e Tríceps' },
  { id: 'terca', label: 'Terça-feira', foco: 'Costas e Bíceps' },
  { id: 'quarta', label: 'Quarta-feira', foco: 'Pernas Completas' },
  { id: 'quinta', label: 'Quinta-feira', foco: 'Ombros e Abdômen' },
  { id: 'sexta', label: 'Sexta-feira', foco: 'Upper Body (Superior)' },
  { id: 'sabado', label: 'Sábado', foco: 'Cardio e Descanso Ativo' },
  { id: 'domingo', label: 'Domingo', foco: 'Descanso Total' },
];

// `Date.getDay()` retorna 0 (domingo) a 6 (sábado) — traduzimos para os
// mesmos ids usados em `DIAS_SEMANA` (semana começando na segunda).
const MAPA_INDICE_JS_PARA_DIA = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

export function obterIdDiaDaSemanaAtual() {
  return MAPA_INDICE_JS_PARA_DIA[new Date().getDay()];
}

export function obterInfoDoDia(id) {
  return DIAS_SEMANA.find((dia) => dia.id === id);
}
