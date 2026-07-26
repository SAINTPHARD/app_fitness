package com.appfitness.exception;

/**
 * Exceção lançada quando um recurso (Refeição, Alimento, etc.) buscado por ID
 * não existe no banco. Antes desse tipo dedicado, os services lançavam
 * `RuntimeException` genérica, que o Spring não sabia mapear para 404 —
 * qualquer "não encontrado" virava um 500 Internal Server Error para o
 * frontend, escondendo o erro real (ex: ID inválido) atrás de uma falha
 * de servidor.
 */
public class RecursoNaoEncontradoException extends RuntimeException {

	public RecursoNaoEncontradoException(String mensagem) {
		super(mensagem);
	}
}
