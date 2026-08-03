package com.appfitness.exception;

/**
 * Lançada ao tentar adicionar um Alimento com o mesmo nome e quantidade de um
 * já existente na mesma Refeição — evita duplo clique/duplo submit criando
 * duas linhas idênticas. Mapeada para 409 Conflict pelo `GlobalExceptionHandler`.
 * Não bloqueia o mesmo alimento com quantidade diferente (ex: duas porções de
 * arroz em horários diferentes é um caso de uso legítimo).
 */
public class AlimentoDuplicadoException extends RuntimeException {

	public AlimentoDuplicadoException(String mensagem) {
		super(mensagem);
	}
}
