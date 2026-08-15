package com.appfitness.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.MedidaCorporal;

public interface MedidaCorporalRepository extends JpaRepository<MedidaCorporal, Long> {

	/**
	 * Retorna todas as medidas corporais de um usuário específico, ordenadas por data e ID em ordem ascendente.
	 * @param usuarioId
	 * @return
	 * OrderByDataAscIdAsc: Garante que o frontend receba as medidas em ordem cronológica (linha do tempo)
	 * O 'IdAsc' atua como desempate perfeito caso o usuário registre várias medidas no mesmo dia.
	 */
    List<MedidaCorporal> findByUsuarioIdOrderByDataAscIdAsc(Long usuarioId);

    // Proteção contra IDOR: Garante que o usuário só consiga visualizar/editar as suas próprias medidas.
    Optional<MedidaCorporal> findByIdAndUsuarioId(Long id, Long usuarioId);

    // Garante que exista apenas um registro por usuário por dia.
    Optional<MedidaCorporal> findByUsuarioIdAndData(Long usuarioId, LocalDate data);
}
