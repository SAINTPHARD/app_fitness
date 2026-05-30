package com.appfitness.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
 *	 Responsável por expor endpoints REST para o frontend ou clientes externos :
 * - Receber requisições HTTP
 * - Validar dados de entrada
 * - Chamar o serviço para processar a lógica de negócio
 * - Retornar respostas HTTP adequadas
 * 
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

	// 1. Injeção de dependência do serviço de usuário
	//@Autowired
	
	private final UsuarioService usuarioService;
	
	// 2. Construtor para injeção de dependência (opcional, mas recomendado para testes)
	public UsuarioController(UsuarioService usuarioService) {
		this.usuarioService = usuarioService;
	}
	
	
	/**
	 * 1. Criar usuário
	 * Metodo POST para criar um novo usuário no sistema.
	 * http://localhost:8080/usuarios
	 */
	@PostMapping
	public Usuario criarUsuario(@RequestBody Usuario usuario) {
		return usuarioService.salvar(usuario);
	}
	
	/**
	 * Listar todos os usuários
	 * Metodo GET para listar todos os usuários cadastrados no sistema.
	 * http://localhost:8080/usuarios
	 */
	@GetMapping
	public List<Usuario> listarUsuarios() {
		return usuarioService.listarTodos();
	}
	
	/**
	 * 3.Listar usuário por ID
	 * Metodo GET para buscar um usuário específico pelo seu ID.
	 * http://localhost:8080/usuarios/{id}
	 */
	@GetMapping("/{id}")
	public Usuario ListarUsuarioPorId(@PathVariable Long id) {
		return usuarioService.listarPorId(id);
	}
		
	/**
	 * 4. Atualizar usuário
	 * Metodo PUT para atualizar as informações de um usuário existente.
	 * http://localhost:8080/usuarios/{id}
	 */
	@PutMapping("/{id}")
	public Usuario atualizarUsuario(@PathVariable Long id, 
									@RequestBody Usuario usuario) {
		return usuarioService.atualizar(id, usuario);
	}
	
	/**
	 * 5. Deletar usuário
	 * Metodo DELETE para remover um usuário do sistema.
	 * http://localhost:8080/usuarios/{id}
	 */
	@DeleteMapping("/{id}")
	public void deletarUsuario(@PathVariable Long id) {
		usuarioService.deletar(id);
	}
}
