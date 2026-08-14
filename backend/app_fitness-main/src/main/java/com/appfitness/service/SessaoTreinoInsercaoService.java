package com.appfitness.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.repository.SessaoTreinoRepository;

/**
 * Isola o INSERT de uma SessaoTreino numa transação física própria
 * (`REQUIRES_NEW`), pelo mesmo motivo documentado em
 * `SerieInsercaoService`: a constraint única `uk_sessao_treino_data` pode
 * só ser violada no `flush()`, e fazer isso dentro da transação de
 * `SessaoTreinoService.obterOuCriarSessaoDoDia` deixaria aquela transação
 * marcada como rollback-only antes da tentativa de recuperação.
 */
@Service
public class SessaoTreinoInsercaoService {

	private final SessaoTreinoRepository sessaoTreinoRepository;

	public SessaoTreinoInsercaoService(SessaoTreinoRepository sessaoTreinoRepository) {
		this.sessaoTreinoRepository = sessaoTreinoRepository;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public SessaoTreino inserir(SessaoTreino sessao) {
		return sessaoTreinoRepository.saveAndFlush(sessao);
	}
}
