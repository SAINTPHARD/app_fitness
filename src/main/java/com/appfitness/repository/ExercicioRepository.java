package com.appfitness.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.appfitness.model.entity.Exercicio;

/**
 * Interface de acesso ao banco de dados para a entidade Exercicio.
 * Esta interface deve estender(@extends) JpaRepository para herdar os métodos de CRUD básicos.
 */
public interface ExercicioRepository extends JpaRepository<Exercicio, Long> {

}
 