package com.appfitness.controller;

import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.model.entity.Usuario;
import com.appfitness.service.UsuarioService;

/** * Controlador REST para gerenciar usuários.
 * @RestController: Indica que esta classe é um controlador REST, capaz de receber e responder a requisições HTTP.
 * @RequestMapping("/usuarios"): Define a rota base para todos os endpoints deste controlador.
 * 
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

	
	private final UsuarioService usuarioService;
	
	// Injeção de dependência explícita via construtor (Padrão Sênior)
	public UsuarioController(UsuarioService usuarioService) {
		this.usuarioService = usuarioService;
	}
	
	/**
	 * 1. Criar usuário
	 * http://localhost:8080/usuarios
	 */
	@PostMapping
	public Usuario criarUsuario(@RequestBody Usuario usuario) {
		return usuarioService.salvar(usuario);
	}
	
	/**
	 * 2. Listar todos os usuários
	 * http://localhost:8080/usuarios
	 */
	@GetMapping
	public List<Usuario> listarUsuarios() {
		return usuarioService.listarTodos();
	}
	
	/**
	 * 3. Buscar usuário por ID
	 * http://localhost:8080/usuarios/{id}
	 */
	@GetMapping("/{id}")
	public Usuario buscarUsuarioPorId(@PathVariable Long id) {
		return usuarioService.buscarPorId(id);
	}
		
	/**
	 * 4. Atualizar usuário
	 * http://localhost:8080/usuarios/{id}
	 */
	@PutMapping("/{id}")
	public Usuario atualizarUsuario(@PathVariable Long id, 
			@RequestBody Usuario usuario) {
		return usuarioService.atualizar(id, usuario);
	}
	
	/**
	 * 5. Deletar usuário
	 * http://localhost:8080/usuarios/{id}
	 */
	@DeleteMapping("/{id}")
	public void deletarUsuario(@PathVariable Long id) {
		usuarioService.deletar(id);
	}
}