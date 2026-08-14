package com.appfitness.dto.treino;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.appfitness.model.entity.Serie;

public record SerieResponseDTO(
		Long id,
		Long exercicioId,
		String nomeExercicio,
		Integer ordemExercicio,
		Integer numeroSerie,
		BigDecimal carga,
		Integer repeticoes,
		String tipo,
		String status,
		LocalDateTime horarioInicio,
		LocalDateTime horarioConclusao,
		Integer duracaoDescansoSegundos
) {

	public static SerieResponseDTO fromEntity(Serie serie) {
		if (serie == null) {
			return null;
		}
		return new SerieResponseDTO(
				serie.getId(),
				serie.getExercicio() != null ? serie.getExercicio().getId() : null,
				serie.getExercicio() != null ? serie.getExercicio().getNome() : null,
				serie.getOrdemExercicio(),
				serie.getNumeroSerie(),
				serie.getCarga(),
				serie.getRepeticoes(),
				serie.getTipo() != null ? serie.getTipo().name() : null,
				serie.getStatus() != null ? serie.getStatus().name() : null,
				serie.getHorarioInicio(),
				serie.getHorarioConclusao(),
				serie.getDuracaoDescansoSegundos()
		);
	}
}
