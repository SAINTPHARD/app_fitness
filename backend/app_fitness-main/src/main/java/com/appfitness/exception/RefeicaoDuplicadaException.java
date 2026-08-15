package com.appfitness.exception;

/**
 * Lançada ao tentar criar uma Refeição com o mesmo nome já existente para o
 * mesmo usuário na mesma data (ex: dois "Café da manhã" no mesmo dia) — a
 * causa raiz relatada na auditoria de QA: totais de calorias divergiam entre
 * telas porque duas refeições concorriam pelo mesmo "slot" do dia. Mapeada
 * para 409 Conflict pelo `GlobalExceptionHandler`.
 */
public class RefeicaoDuplicadaException extends RuntimeException {

	public RefeicaoDuplicadaException(String mensagem) {
		super(mensagem);
	}
}
