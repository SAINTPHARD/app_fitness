package com.appfitness.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.appfitness.model.entity.Usuario;

/**
 * Interface de acesso ao banco de dados
 * 
 * JpaRepository já fornece:
 * - save()
 * - findById()
 * - findAll()
 * - delete()
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

}