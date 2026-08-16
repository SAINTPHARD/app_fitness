export function exercicioEstaConcluido(series = []) {
  return series.length > 0 && series.every((serie) => serie.status === 'CONCLUIDA');
}

export function contarExerciciosConcluidos(exercicios = [], obterSeries) {
  return exercicios.filter((exercicio) => exercicioEstaConcluido(obterSeries(exercicio.id))).length;
}
