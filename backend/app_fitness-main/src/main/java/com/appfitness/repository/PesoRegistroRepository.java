package com.appfitness.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.PesoRegistro;

public interface PesoRegistroRepository extends JpaRepository<PesoRegistro, Long> {

	/**
	 * Retorna todos os registros de peso de um usuário específico, ordenados por data e ID em ordem ascendente.
	 * OrderByDataAscIdAsc: Essencial para plotar o gráfico de linha de evolução de peso no frontend.
	 * O 'IdAsc' atua como desempate perfeito caso o usuário registre vários pesos no mesmo dia.
	 */
    List<PesoRegistro> findByUsuarioIdOrderByDataAscIdAsc(Long usuarioId);

    // Proteção contra IDOR: Garante que o usuário só consiga visualizar/editar os seus próprios registros de peso.
    Optional<PesoRegistro> findByIdAndUsuarioId(Long id, Long usuarioId);

    // Garante que exista apenas um registro de peso por usuário por dia.
    Optional<PesoRegistro> findByUsuarioIdAndData(Long usuarioId, LocalDate data);
}
