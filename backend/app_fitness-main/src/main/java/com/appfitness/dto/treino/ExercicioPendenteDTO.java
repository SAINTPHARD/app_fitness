package com.appfitness.dto.treino;

/** Um exercício da ficha que não teve todas as séries planejadas concluídas na sessão. */
public record ExercicioPendenteDTO(
		Long exercicioId,
		String nome,
		int seriesConcluidas,
		int seriesTotal
) {
}
