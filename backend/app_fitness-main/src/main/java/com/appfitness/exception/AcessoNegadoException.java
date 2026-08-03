package com.appfitness.exception;

/**
 * Exceção lançada quando o usuário autenticado tenta acessar ou modificar um
 * recurso (Refeição, Alimento, etc.) que pertence a outro usuário. Mapeada
 * para 403 Forbidden pelo `GlobalExceptionHandler` — nunca deve vazar
 * detalhes de quem é o dono real do recurso na mensagem de erro.
 */
public class AcessoNegadoException extends RuntimeException {

	public AcessoNegadoException(String mensagem) {
		super(mensagem);
	}
}
