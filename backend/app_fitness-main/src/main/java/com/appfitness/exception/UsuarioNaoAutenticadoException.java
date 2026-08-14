package com.appfitness.exception;

/**
 * Lançada quando o `Authentication` da requisição está ausente ou não traz
 * um `Usuario` como principal (token JWT ausente/inválido). Mapeada para 401
 * Unauthorized pelo `GlobalExceptionHandler` — antes disso, controllers
 * lançavam `RuntimeException` genérica, que virava 500.
 */
public class UsuarioNaoAutenticadoException extends RuntimeException {

	public UsuarioNaoAutenticadoException(String mensagem) {
		super(mensagem);
	}
}
