package com.appfitness.model.enums;

/**
 * Status de conclusão de uma Refeição no dia. Guardado como STRING no banco
 * (ver `@Enumerated(EnumType.STRING)` em `Refeicao.status`) para o valor ficar
 * legível direto na tabela e não quebrar se a ordem dos valores mudar.
 */
public enum RefeicaoStatus {
	PENDENTE,
	CONCLUIDO
}
