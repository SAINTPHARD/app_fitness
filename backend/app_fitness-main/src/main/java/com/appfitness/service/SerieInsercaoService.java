package com.appfitness.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.model.entity.Serie;
import com.appfitness.repository.SerieRepository;

/**
 * Isola o INSERT de uma Série numa transação física própria
 * (`REQUIRES_NEW`), separada da transação de `SerieService.registrarSerie`.
 *
 * Motivo: com JPA/Hibernate a violação da constraint única
 * (`idempotency_key`) pode só ser detectada no `flush()`/commit, não no
 * `save()` em si — e se isso acontecer dentro da MESMA transação que fez
 * as leituras anteriores (sessão, exercício), o Hibernate marca essa
 * transação inteira como rollback-only, tornando inseguro tentar consultar
 * o registro concorrente logo em seguida nela. Por estar em outro bean
 * Spring com `REQUIRES_NEW`, esta transação é física e independente: o
 * `saveAndFlush` força o INSERT a ir ao banco AGORA (não no fim da
 * transação do chamador), e se falhar por concorrência, só esta transação
 * é desfeita — a transação de quem chamou continua saudável e pode
 * consultar o registro vencedor normalmente.
 */
@Service
public class SerieInsercaoService {

	private final SerieRepository serieRepository;

	public SerieInsercaoService(SerieRepository serieRepository) {
		this.serieRepository = serieRepository;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Serie inserir(Serie serie) {
		return serieRepository.saveAndFlush(serie);
	}
}
