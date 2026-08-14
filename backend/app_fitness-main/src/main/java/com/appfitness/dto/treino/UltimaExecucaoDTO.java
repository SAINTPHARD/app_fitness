package com.appfitness.dto.treino;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Base para o "preenchimento inteligente": o que o usuário fez da última
 * vez que executou este exercício, para sugerir (nunca sobrescrever sem
 * avisar) carga/reps na sessão nova. `null` em todos os campos quando não
 * há histórico — o frontend deve mostrar campo vazio, nunca `0`.
 */
public record UltimaExecucaoDTO(
		LocalDate data,
		BigDecimal ultimaCarga,
		Integer ultimasRepeticoes,
		Integer quantidadeSeries,
		BigDecimal melhorCarga
) {
}
