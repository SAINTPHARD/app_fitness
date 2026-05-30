package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;

/**
 * Classe de serviço para operações relacionadas a usuários.
 * 
 * Responsável por:
 * - CRUD de usuários
 * - Regras básicas de negócio relacionadas ao usuário
 */
@Service
public class UsuarioService {
	
	private final UsuarioRepository repository;
	
	/**
	 * Injeção de dependência via construtor
	 */
	public UsuarioService(UsuarioRepository repository) {
		this.repository = repository;
	}
	
	/**
	 * Salvar um novo usuário
	 */
	public Usuario salvar(Usuario usuario) {
        return repository.save(usuario);
    }
	
	/**
	 * Listar todos os usuários
	 */
	public List<Usuario> listarTodos() {
		return repository.findAll();
	}
	
	/**
	 * Buscar usuário por ID
	 */
	public Usuario listarPorId(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> 
					new RuntimeException("Usuário não encontrado com ID: " + id));
	}
	
	/**
	 * Atualizar usuário
	 */
	public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
		
		Usuario usuarioExistente = listarPorId(id);
		
		// Atualizando campos
		usuarioExistente.setNome(usuarioAtualizado.getNome());
		usuarioExistente.setEmail(usuarioAtualizado.getEmail());
		usuarioExistente.setPeso(usuarioAtualizado.getPeso());
		usuarioExistente.setAltura(usuarioAtualizado.getAltura());
		usuarioExistente.setIdade(usuarioAtualizado.getIdade());
		usuarioExistente.setObjetivo(usuarioAtualizado.getObjetivo());
		
		return repository.save(usuarioExistente);
	}
	
	/**
	 * Deletar usuário
	 */
	public void deletar(Long id) {
		Usuario usuario = listarPorId(id);
		repository.delete(usuario);
	}
}