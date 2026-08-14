package com.appfitness.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Treino;

/**
 * Interface de acesso ao banco de dados para a entidade Exercicio.
 * Esta interface deve estender(@extends) JpaRepository para herdar os métodos de CRUD básicos.
 */
public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {

	// Pré-check de duplicidade: mesmo nome (sem distinguir maiúsculas/
	// espaços nas pontas) já presente na mesma ficha de treino.
	@Query("""
			SELECT COUNT(e) > 0 FROM Exercicio e
			WHERE e.treino.id = :treinoId
			AND LOWER(TRIM(e.nome)) = LOWER(TRIM(:nome))
			""")
	boolean existeComMesmoNome(@Param("treinoId") Long treinoId, @Param("nome") String nome);

	default boolean existeComMesmoNome(Treino treino, String nome) {
		return existeComMesmoNome(treino.getId(), nome);
	}
}
