package com.appfitness.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.FotoProgresso;

public interface FotoProgressoRepository extends JpaRepository<FotoProgresso, Long> {

	/**
	 * Retorna todas as fotos de progresso de um usuário específico, ordenadas por data e ID em ordem ascendente.
	 * @param usuarioId
	 * @return
	 * OrderByDataAscIdAsc: Garante que o frontend receba as fotos em ordem cronológica (linha do tempo)
	 * O 'IdAsc' atua como desempate perfeito caso o usuário envie várias fotos no mesmo dia.
	 */
    List<FotoProgresso> findByUsuarioIdOrderByDataAscIdAsc(Long usuarioId);

    Optional<FotoProgresso> findByIdAndUsuarioId(Long id, Long usuarioId);
}
