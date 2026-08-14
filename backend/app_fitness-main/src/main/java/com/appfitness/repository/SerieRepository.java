package com.appfitness.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.appfitness.model.entity.Serie;
import com.appfitness.model.entity.Usuario;

public interface SerieRepository extends JpaRepository<Serie, Long> {

	/**
	 * Séries concluídas do exercício, do mais recente para o mais antigo —
	 * base do "preenchimento inteligente" (última execução) e do histórico
	 * de evolução de carga. `Pageable` limita a 1 linha para "última",
	 * ou N para "evolução recente", sem precisar de duas queries.
	 */
	@Query("""
			SELECT serie FROM Serie serie
			WHERE serie.exercicio.id = :exercicioId
			AND serie.sessao.usuario = :usuario
			AND serie.status = com.appfitness.model.enums.SerieStatus.CONCLUIDA
			ORDER BY serie.sessao.data DESC, serie.horarioConclusao DESC
			""")
	List<Serie> buscarHistoricoDoExercicio(
			@Param("exercicioId") Long exercicioId,
			@Param("usuario") Usuario usuario,
			Pageable pageable);

	default Optional<Serie> buscarUltimaExecucao(Long exercicioId, Usuario usuario) {
		List<Serie> resultado = buscarHistoricoDoExercicio(exercicioId, usuario, Pageable.ofSize(1));
		return resultado.isEmpty() ? Optional.empty() : Optional.of(resultado.get(0));
	}

	@Query("""
			SELECT MAX(serie.carga) FROM Serie serie
			WHERE serie.exercicio.id = :exercicioId
			AND serie.sessao.usuario = :usuario
			AND serie.status = com.appfitness.model.enums.SerieStatus.CONCLUIDA
			""")
	BigDecimal buscarMelhorCarga(@Param("exercicioId") Long exercicioId, @Param("usuario") Usuario usuario);

	long countBySessao_IdAndExercicio_Id(Long sessaoId, Long exercicioId);

	// "Recorde pessoal" no resumo final = carga desta sessão supera a melhor
	// carga de QUALQUER sessão anterior a ela (exclui a própria sessão sendo
	// resumida, senão toda carga registrada hoje pareceria sempre um recorde).
	@Query("""
			SELECT MAX(serie.carga) FROM Serie serie
			WHERE serie.exercicio.id = :exercicioId
			AND serie.sessao.usuario = :usuario
			AND serie.sessao.data < :data
			AND serie.status = com.appfitness.model.enums.SerieStatus.CONCLUIDA
			""")
	java.math.BigDecimal buscarMelhorCargaAntesDe(
			@Param("exercicioId") Long exercicioId,
			@Param("usuario") Usuario usuario,
			@Param("data") java.time.LocalDate data);

	// Base da idempotência de sincronização offline — ver SerieService.registrarSerie.
	Optional<Serie> findByIdempotencyKey(String idempotencyKey);
}
