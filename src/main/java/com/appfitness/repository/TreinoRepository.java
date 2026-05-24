package com.appfitness.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.Treino;

/**
 * Classe de repositório para a entidade Treino, 
 * Responsável por realizar operações de acesso a dados relacionadas aos treinos.
 */
public interface TreinoRepository extends JpaRepository<Treino, Long> {

}
