package com.appfitness.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.Dieta;

/**
 * Interface para Repositorio de Dieta.
 * Responsável por definir os métodos de acesso aos  banco dados relacionados à entidade Dieta.
 */
public interface DietaRepository extends JpaRepository<Dieta, Long> {
	// Herdando o CRUD completo automaticamente do Spring Data JPA.
}
