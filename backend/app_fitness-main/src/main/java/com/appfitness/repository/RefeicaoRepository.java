package com.appfitness.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.Refeicao;

/**
 * Interface de repositório para a entidade Refeição.
 * Responsável por :
 * - Fornecer métodos de acesso a dados para operações relacionadas às refeições.
 * - Facilitar a interação com o banco de dados, permitindo a persistência e recuperação de informações sobre refeições.
 */
public interface RefeicaoRepository extends JpaRepository<Refeicao, Long> {

	List<Refeicao> findByDataRefeicao(LocalDate dataRefeicao);
}
