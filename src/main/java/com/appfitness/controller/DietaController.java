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

import com.appfitness.model.entity.Dieta;
import com.appfitness.service.DietaService;

import jakarta.validation.Valid;

/**
 * Classe de controle para Dieta.
 * Responsável por receber as requisições HTTP relacionadas à entidade Dieta, 
 * - processar os dados e retornar as respostas adequadas em formato JSON.
 * Essa classe atua como intermediária entre a camada de serviço e a camada de apresentação.
 * 
 */
@RestController
@RequestMapping("/dietas")
public class DietaController {

	/**
	 * 1. Injeção de dependências do serviço de Dieta (DietaService) via Co6nstrutor.
	 * @DietaService é uma classe de serviço que contém a lógica de negócios relacionada à entidade Dieta,
	 * @dietaService é nome da variável que será usada para acessar os métodos do serviço de Dieta dentro do controlador.
	 */
	private final DietaService dietaService;
	
	public DietaController(DietaService dietaService) {
		this.dietaService = dietaService;
	}
	
	// --- CRUD (Create, Read, Update, Delete) ---
	/**
	 * Para cada método CRUD, criado aqui no controller, tem que implementar um no Dietaservice, 
	 * pois ele irá chamar o método correspondente no serviço de Dieta (dietaService) para realizar a operação desejada.
	 */
	
	/**
	 * 1. CREATE: Cria uma nova dieta no sistema.
	 * URL: POST http://localhost:8080/api/dietas
	 */
	@PostMapping
	public Dieta criar(@Valid @RequestBody Dieta dieta) {
		return dietaService.salvar(dieta);
	}
	
	/**
	 * 2. READ: Obtém uma dieta específica por ID.
	 * URL: GET http://localhost:8080/api/dietas/{id}
	 */
	@GetMapping("/{id}")
	public Dieta BuscarPorId(@PathVariable long id) {
		return dietaService.buscarPorId(id);
	}
	
	/**
	 * 3. UPDATE: Atualiza as informações de uma dieta existente.
	 * URL: PUT http://localhost:8080/api/dietas/{id}
	 */
	@PutMapping("/{id}")
	public Dieta atualizar(
			@PathVariable Long id, 
			@RequestBody Dieta dietaAtualizado) {
		return dietaService.atualizar(id, dietaAtualizado);
	}
	
	/**
	 * 4. DELETE: Exclui uma dieta existente.
	 * URL: DELETE http://localhost:8080/api/dietas/{id}
	 * @return 
	 */
	@DeleteMapping("/{id}")
	public void deletar(@PathVariable Long id) {
		dietaService.deletar(id);
	}
	
	/**
	 * 5. READ ALL: Lista todas as dietas cadastradas no sistema.
	 * URL: GET http://localhost:8080/api/dietas
	 */
	@GetMapping
	public List<Dieta> listarTodos() {
		return dietaService.listarTodos();
	}
}
