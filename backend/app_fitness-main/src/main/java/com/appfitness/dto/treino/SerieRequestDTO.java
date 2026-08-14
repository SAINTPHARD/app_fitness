package com.appfitness.dto.treino;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Payload para criar/atualizar uma Série. `carga`/`repeticoes` nuláveis de
 * propósito — distingue "ainda não registrado" de "zero" (ver `Serie`).
 */
public record SerieRequestDTO(
		@NotNull(message = "O exercício da série é obrigatório")
		Long exercicioId,

		@PositiveOrZero(message = "A carga não pode ser negativa")
		BigDecimal carga,

		@PositiveOrZero(message = "As repetições não podem ser negativas")
		Integer repeticoes,

		String tipo,

		/**
		 * Chave de idempotência gerada no CLIENTE (ex: `crypto.randomUUID()`) —
		 * suporte à sincronização offline: se a mesma requisição de criação
		 * for reenviada (rede caiu depois do servidor já ter salvo, mas antes
		 * do cliente confirmar a resposta), o backend devolve a Série já
		 * existente em vez de criar uma segunda. Opcional — só usada por
		 * `registrarSerie`; ignorada em atualizações (PUT/PATCH/DELETE já são
		 * naturalmente idempotentes por semântica HTTP).
		 */
		String idempotencyKey
) {
}
