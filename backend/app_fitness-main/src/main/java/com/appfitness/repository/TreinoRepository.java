package com.appfitness.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;

/**
 * Classe de repositório para a entidade Treino,
 * Responsável por realizar operações de acesso a dados relacionadas aos treinos.
 */
public interface TreinoRepository extends JpaRepository<Treino, Long> {

	// LEFT JOIN FETCH traz os exercícios junto, evitando LazyInitialization
	// ao serializar o Treino para JSON fora da sessão do Hibernate (mesmo
	// motivo documentado em RefeicaoRepository.findByIdComAlimentos).
	@Query("SELECT t FROM Treino t LEFT JOIN FETCH t.exercicios WHERE t.id = :id")
	Optional<Treino> findByIdComExercicios(@Param("id") Long id);

	@Query("SELECT DISTINCT t FROM Treino t LEFT JOIN FETCH t.exercicios WHERE t.usuario = :usuario")
	List<Treino> findByUsuarioComExercicios(@Param("usuario") Usuario usuario);

	@Query("SELECT t FROM Treino t LEFT JOIN FETCH t.exercicios WHERE t.usuario = :usuario AND t.diaSemana = :diaSemana")
	Optional<Treino> findByUsuarioAndDiaSemana(@Param("usuario") Usuario usuario, @Param("diaSemana") String diaSemana);
}
