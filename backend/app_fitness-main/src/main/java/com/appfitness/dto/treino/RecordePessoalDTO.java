package com.appfitness.dto.treino;

import java.math.BigDecimal;

/** Um exercício em que a carga máxima desta sessão superou o recorde anterior. */
public record RecordePessoalDTO(
		Long exercicioId,
		String nomeExercicio,
		BigDecimal cargaAnterior,
		BigDecimal cargaNova
) {
}
