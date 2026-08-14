package com.appfitness.exception;

/**
 * Lançada quando uma ação destrutiva precisa de confirmação explícita do
 * cliente (ex: excluir uma Série já concluída) — o cliente deve reenviar a
 * requisição com o parâmetro de confirmação antes de a ação ser executada.
 * Mapeada para 409 Conflict.
 */
public class ConfirmacaoNecessariaException extends RuntimeException {

	public ConfirmacaoNecessariaException(String mensagem) {
		super(mensagem);
	}
}
