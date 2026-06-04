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

import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Treino;
import com.appfitness.service.ExercicioService;

/**
 * Controlador para gerenciar as operações relacionadas aos exercícios.
 * Responsável por:
 * - Receber as requisições HTTP relacionadas aos exercícios
 * - Delegar as operações para a camada de serviço (ExercicioService)
 * - Retornar as respostas HTTP adequadas para o cliente
 * Endpoints típicos que este controlador pode expor: 
 * - POST /exercicios: Criar um novo exercício
 * - GET /exercicios/{id}: Obter um exercício por ID
 * - PUT /exercicios/{id}: Atualizar um exercício existente
 * - DELETE /exercicios/{id}: Excluir um exercício por ID
 * - GET /exercicios: Listar todos os exercícios
 */

@RestController 				// Indica que é um controlador REST, e que os métodos retornarão respostas HTTP.
@RequestMapping("/exercicios") 	// Define a rota base para este controlador (ex: /exercicios)
public class ExercicioController {

	// 1. Injeção de dependência via Construtor
	private final ExercicioService exercicioService;
	
	public ExercicioController(ExercicioService exercicioService) {
		this.exercicioService = exercicioService;
	}
	
	// --- MÉTODOS PARA GERENCIAR EXERCÍCIOS (CRUD) ---
	/**
	 * 1. CREATE: Cria um novo exercício no sistema.
	 * Rota URL: POST http://localhost:8080/exercicios
	 */
	@PostMapping
	public Exercicio Create(@RequestBody Exercicio exercicio) {
		return exercicioService.salvar(exercicio);
	}
	
	/**
	 * 2. READ: Buscar um exercício específico por ID.
	 * Rota URL: GET http://localhost:8080/exercicios/{id}
	 */
	@GetMapping("/{id}")
	public Exercicio buscarPorId(@PathVariable Long id) {
		return exercicioService.buscarPorId(id);
	}
	
	/**
	 * 3. UPDATE: Atualiza um exercício existente.
	 * Rota URL: PUT http://localhost:8080/exercicios/{id}
	 */
	@PutMapping("/{id}")
	public Exercicio atualizar(@PathVariable Long id, 
			@RequestBody Exercicio exercicioAtualizado) {
		return exercicioService.atualizar(id, exercicioAtualizado);
	}
	
	// 4. DELETE: Excluir um exercício por ID
	/**
	 * 4. DELETE: Exclui um exercício do sistema por ID.
	 * Rota URL: DELETE http://localhost:8080/exercicios/{id}
	 */
	@DeleteMapping("/{id}")
	public void deletar(@PathVariable Long id) {
		exercicioService.deletar(id);
	}
	
	// 5. LIST: Listar todos os exercícos
	/**
	 * 5. READ ALL: Lista todos os exercícios cadastrados no sistema.
	 * Rota URL: GET http://localhost:8080/exercicios
	 */
	@GetMapping
	public List<Exercicio> listarTodos() {
		return exercicioService.listarTodos();
	}
}
