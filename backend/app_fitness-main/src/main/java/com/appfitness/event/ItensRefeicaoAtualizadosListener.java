package com.appfitness.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Reage a `ItensRefeicaoAtualizadosEvent` só depois que a transação que
 * salvou o Alimento realmente comitou (`AFTER_COMMIT`) — se a transação for
 * revertida (ex: erro depois do save), este listener nunca roda, evitando
 * side effects (auditoria, cache, notificação) para uma mudança que não
 * chegou a existir no banco.
 *
 * Hoje só registra uma auditoria simples via log. Sirva de ponto único para
 * plugar cache (`@CacheEvict`), push via WebSocket, ou qualquer outro efeito
 * colateral no futuro, sem acoplar essa lógica ao fluxo transacional do
 * `RefeicaoService`.
 */
@Component
public class ItensRefeicaoAtualizadosListener {

	private static final Logger log = LoggerFactory.getLogger(ItensRefeicaoAtualizadosListener.class);

	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void aoAtualizarItens(ItensRefeicaoAtualizadosEvent evento) {
		log.info("Itens da Refeição {} atualizados (commit confirmado).", evento.refeicaoId());
	}
}
