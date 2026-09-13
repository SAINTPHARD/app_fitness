package com.appfitness.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;

public interface SessaoTreinoRepository extends JpaRepository<SessaoTreino, Long> {

	@Query("""
			SELECT s FROM SessaoTreino s LEFT JOIN FETCH s.series serie LEFT JOIN FETCH serie.exercicio
			WHERE s.treino = :treino AND s.data = :data
			""")
	Optional<SessaoTreino> findByTreinoAndData(@Param("treino") Treino treino, @Param("data") LocalDate data);

	@Query("SELECT s FROM SessaoTreino s LEFT JOIN FETCH s.series serie LEFT JOIN FETCH serie.exercicio WHERE s.id = :id")
	Optional<SessaoTreino> findByIdComSeries(@Param("id") Long id);

	default Optional<SessaoTreino> buscarSessaoDeHoje(Treino treino) {
		return findByTreinoAndData(treino, LocalDate.now());
	}

	// Base da "comparação com o treino anterior" no resumo final.
	@Query("""
			SELECT s FROM SessaoTreino s LEFT JOIN FETCH s.series serie LEFT JOIN FETCH serie.exercicio
			WHERE s.treino = :treino AND s.data < :data
			ORDER BY s.data DESC
			""")
	List<SessaoTreino> buscarAnterioresATreino(@Param("treino") Treino treino, @Param("data") LocalDate data, Pageable pageable);

	default Optional<SessaoTreino> buscarSessaoAnterior(Treino treino, LocalDate data) {
		List<SessaoTreino> anteriores = buscarAnterioresATreino(treino, data, Pageable.ofSize(1));
		return anteriores.isEmpty() ? Optional.empty() : Optional.of(anteriores.get(0));
	}

	@Query("""
		SELECT s.data, COUNT(s),
		SUM(CASE WHEN s.status = com.appfitness.model.enums.SessaoStatus.CONCLUIDO THEN 1 ELSE 0 END)
		FROM SessaoTreino s WHERE s.usuario.id = :usuarioId AND s.data BETWEEN :inicio AND :fim
		GROUP BY s.data ORDER BY s.data
		""")
	List<Object[]> resumirSessoesPorDia(@Param("usuarioId") Long usuarioId, @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
