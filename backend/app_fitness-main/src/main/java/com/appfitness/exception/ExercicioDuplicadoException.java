package com.appfitness.exception;

/**
 * Lançada ao tentar adicionar um Exercício com o mesmo nome já existente na
 * mesma ficha de Treino (auditoria de refatoração da tela de execução —
 * item "Prevenção de exercícios duplicados"). Mapeada para 409 Conflict
 * pelo `GlobalExceptionHandler`.
 */
public class ExercicioDuplicadoException extends RuntimeException {

	public ExercicioDuplicadoException(String mensagem) {
		super(mensagem);
	}
}
