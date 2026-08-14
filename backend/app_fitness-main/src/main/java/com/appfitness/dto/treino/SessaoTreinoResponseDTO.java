package com.appfitness.dto.treino;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.enums.SerieStatus;

public record SessaoTreinoResponseDTO(
		Long id,
		Long treinoId,
		LocalDate data,
		String status,
		LocalDateTime horarioInicio,
		LocalDateTime horarioFim,
		int totalSeries,
		int seriesConcluidas,
		List<SerieResponseDTO> series
) {

	public static SessaoTreinoResponseDTO fromEntity(SessaoTreino sessao) {
		if (sessao == null) {
			return null;
		}
		List<SerieResponseDTO> series = sessao.getSeries().stream()
				.map(SerieResponseDTO::fromEntity)
				.toList();

		long concluidas = sessao.getSeries().stream()
				.filter(serie -> serie.getStatus() == SerieStatus.CONCLUIDA)
				.count();

		return new SessaoTreinoResponseDTO(
				sessao.getId(),
				sessao.getTreino() != null ? sessao.getTreino().getId() : null,
				sessao.getData(),
				sessao.getStatus() != null ? sessao.getStatus().name() : null,
				sessao.getHorarioInicio(),
				sessao.getHorarioFim(),
				series.size(),
				(int) concluidas,
				series
		);
	}
}
