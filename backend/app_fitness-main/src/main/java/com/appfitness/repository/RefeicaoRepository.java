package com.appfitness.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.appfitness.model.entity.Refeicao;
import com.appfitness.model.entity.Usuario;

/**
 * Interface de repositório para a entidade Refeição.
 * Responsável por :
 * - Fornecer métodos de acesso a dados para operações relacionadas às refeições.
 * - Facilitar a interação com o banco de dados, permitindo a persistência e recuperação de informações sobre refeições.
 */
public interface RefeicaoRepository extends JpaRepository<Refeicao, Long> {

	List<Refeicao> findByDataRefeicao(LocalDate dataRefeicao);

	// O JOIN FETCH obriga o Hibernate a carregar a lista de alimentos junto com a refeição,
	// evitando o erro 500 "Cannot lazily initialize collection" na hora de converter para JSON.
	@Query("SELECT DISTINCT r FROM Refeicao r LEFT JOIN FETCH r.alimentos WHERE r.dataRefeicao = :dataRefeicao AND r.usuario.id = :usuarioId ORDER BY r.horario ASC")
	List<Refeicao> findByDataRefeicaoAndUsuario_IdOrderByHorarioAsc(
			@Param("dataRefeicao") LocalDate dataRefeicao, 
			@Param("usuarioId") Long usuarioId);

	// Usado por `RefeicaoService.listarPorUsuario` (GET /refeicoes escopado ao
	// usuário autenticado) — sem essa query o método derivado não existia e
	// quebrava a compilação do service.
	List<Refeicao> findByUsuario(Usuario usuario);

	// Busca por ID já trazendo os alimentos (LEFT JOIN FETCH) na mesma query,
	// evitando o LazyInitializationException/500 ao serializar a Refeicao
	// para JSON fora da transação (spring.jpa.open-in-view=false).
	@Query("SELECT r FROM Refeicao r LEFT JOIN FETCH r.alimentos WHERE r.id = :id")
	Optional<Refeicao> findByIdComAlimentos(@Param("id") Long id);

	// Mesma lógica de fetch antecipado, mas para a listagem completa por
	// usuário (GET /refeicoes) — sem isso, cada Refeicao da lista dispararia
	// uma tentativa de lazy-load de `alimentos` já fora da sessão do Hibernate.
	@Query("SELECT DISTINCT r FROM Refeicao r LEFT JOIN FETCH r.alimentos WHERE r.usuario = :usuario")
	List<Refeicao> findByUsuarioComAlimentos(@Param("usuario") Usuario usuario);
}