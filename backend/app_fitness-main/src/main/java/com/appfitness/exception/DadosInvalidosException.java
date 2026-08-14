package com.appfitness.exception;

/**
 * Lançada para violações de regra de negócio que não são cobertas pelas
 * anotações de `@Valid` do DTO (ex: concluir uma série sem repetições
 * informadas). Mapeada para 400 Bad Request.
 */
public class DadosInvalidosException extends RuntimeException {

	public DadosInvalidosException(String mensagem) {
		super(mensagem);
	}
}
