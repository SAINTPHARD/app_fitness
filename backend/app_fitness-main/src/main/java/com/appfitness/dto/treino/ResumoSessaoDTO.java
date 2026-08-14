package com.appfitness.dto.treino;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resumo final de uma sessão de treino — calculado sob demanda a partir das
 * séries reais (nunca persistido em coluna própria, mesmo raciocínio de
 * `Refeicao.getTotalCalorias`: evita ficar "dessincronizado" do que
 * realmente está salvo).
 */
public record ResumoSessaoDTO(
		Long sessaoId,
		long tempoTotalSegundos,
		int exerciciosConcluidos,
		int exerciciosTotal,
		int seriesRealizadas,
		int seriesTotal,
		BigDecimal volumeTotal,
		BigDecimal maiorCarga,
		BigDecimal volumeSessaoAnterior,
		List<RecordePessoalDTO> novosRecordes,
		List<ExercicioPendenteDTO> exerciciosNaoConcluidos
) {
}
