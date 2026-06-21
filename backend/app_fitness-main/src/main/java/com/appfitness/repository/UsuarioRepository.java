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
 *
 * Adicionamos um método para buscar usuário por e-mail, usado pela camada de segurança.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

	/**
	 * Buscar usuário por e-mail. Retornamos Usuario, que em seu modelo implementa UserDetails.
	 */
	Usuario findByEmail(String email);

}