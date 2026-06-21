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

import com.appfitness.model.entity.Treino;
import com.appfitness.service.TreinoService;

/**
 * Classe de controlador para a entidade Treino.
 * Responsável por lidar com as requisições HTTP relacionadas aos treinos, e retornar respostas em formato JSON
 * como quando o usuario quer: criar, ler, atualizar e excluir treinos.
 */
@RestController // Diz que é um controlador REST
@RequestMapping("/treinos") 
public class TreinoController {

	// 1. Injeção de dependência do serviço de treino via Construtor
	private final TreinoService treinoService;
	
	public TreinoController(TreinoService treinoService) {
		this.treinoService = treinoService;
	}
	
	// --- CRUD (Create, Read, Update, Delete) ---
	
	/**
	 * 1. CREATE: Cria um novo treino no sistema.
	 * URL: POST http://localhost:8080/treinos
	 */
	@PostMapping
	public Treino criarTreino(@RequestBody Treino treino) {
		// Ajustado de .save(treino) para .salvar(treino) para casar com o TreinoService
		return treinoService.salvar(treino);
	}
	
	/**
	 * 2. READ: Obtém um treino específico por ID.
	 * URL: GET http://localhost:8080/treinos/{id}
	 */
	@GetMapping("/{id}")
	public Treino buscarPorId(@PathVariable Long id) {
		return treinoService.buscarPorId(id);
	}
	
	/**
	 * 3. UPDATE: Atualiza as informações de um treino existente.
	 * URL: PUT http://localhost:8080/treinos/{id}
	 */
	@PutMapping("/{id}")
	public Treino atualizar(@PathVariable Long id, @RequestBody Treino treinoAtualizado) {
		return treinoService.atualizar(id, treinoAtualizado);
	}
	
	/**
	 * 4. DELETE: Exclui um treino do sistema por ID.
	 * URL: DELETE http://localhost:8080/treinos/{id}
	 */
	@DeleteMapping("/{id}")
	public void deletar(@PathVariable Long id) {
		treinoService.deletar(id);
	}
	
	/**
	 * 5. READ ALL: Lista todos os treinos cadastrados no sistema.
	 * URL: GET http://localhost:8080/treinos
	 */
	@GetMapping
	public List<Treino> listarTodos() {
		return treinoService.listarTodos();
	}
}