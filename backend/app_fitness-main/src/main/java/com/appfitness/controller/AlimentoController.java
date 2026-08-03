package com.appfitness.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.appfitness.model.entity.Alimento;
import com.appfitness.service.AlimentoService;

import jakarta.validation.Valid;

/**
 * Classe de controle para gerenciar as operações relacionadas a Alimentos
 * como um recurso próprio (independente da Refeição). Responsável por:
 * - Receber requisições HTTP relacionadas a alimentos.
 * - Interagir com o `AlimentoService` para processar as regras de negócio.
 * - Retornar respostas apropriadas (ResponseEntity) para o cliente.
 *
 * CORS já é centralizado em `SecurityConfig.corsConfigurationSource()` — não
 * repetimos `@CrossOrigin` aqui pelo mesmo motivo já documentado em
 * `RefeicaoController`: o filtro de segurança roda antes e vale a política
 * mais restritiva de qualquer forma.
 *
 * Nota de arquitetura: o fluxo hoje usado pelo React (adicionar/editar/
 * remover alimento a partir de uma refeição específica) continua batendo em
 * `RefeicaoController` (`/refeicoes/{idRefeicao}/alimentos/**`), que já
 * cuida da associação bidirecional e do cascade. Este controller expõe o
 * Alimento como recurso independente (`/alimentos/**`), útil para buscas ou
 * telas administrativas que não partem do contexto de uma refeição.
 */
@RestController
@RequestMapping("/alimentos")
public class AlimentoController {

	private final AlimentoService alimentoService;

	// Injeção de dependência via construtor (Melhor prática)
	public AlimentoController(AlimentoService alimentoService) {
		this.alimentoService = alimentoService;
	}

	// ==========================================
	// --- CRUD BÁSICO ---
	// ==========================================

	/**
	 * 1. CREATE: Cria um novo alimento vinculado a uma refeição existente.
	 * URL: POST http://localhost:8080/alimentos/refeicao/{idRefeicao}
	 *
	 * A refeição "pai" vem na URL (não no corpo) porque o Alimento sozinho
	 * não tem como se auto-associar sem que o service busque e valide essa
	 * Refeição antes do save — ver `AlimentoService.salvar` para o porquê
	 * disso evitar `TransientPropertyValueException`.
	 */
	@PostMapping("/refeicao/{idRefeicao}")
	public ResponseEntity<Alimento> criar(
			@PathVariable Long idRefeicao,
			@Valid @RequestBody Alimento novoAlimento) {
		Alimento alimentoSalvo = alimentoService.salvar(idRefeicao, novoAlimento);
		// Retorna status 201 (Created) quando algo é salvo com sucesso
		return ResponseEntity.status(HttpStatus.CREATED).body(alimentoSalvo);
	}

	/**
	 * 2. READ: Obtém um alimento específico por ID.
	 * URL: GET http://localhost:8080/alimentos/{id}
	 */
	@GetMapping("/{id}")
	public ResponseEntity<Alimento> buscarPorId(@PathVariable Long id) {
		return ResponseEntity.ok(alimentoService.buscarPorId(id));
	}

	/**
	 * 3. UPDATE: Atualiza os dados de um alimento existente.
	 * URL: PUT http://localhost:8080/alimentos/{id}
	 */
	@PutMapping("/{id}")
	public ResponseEntity<Alimento> atualizar(
			@PathVariable Long id,
			@Valid @RequestBody Alimento dadosAtualizados) {
		return ResponseEntity.ok(alimentoService.atualizar(id, dadosAtualizados));
	}

	/**
	 * 4. DELETE: Exclui um alimento existente.
	 * URL: DELETE http://localhost:8080/alimentos/{id}
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id) {
		alimentoService.deletar(id);
		// Retorna 204 (No Content) após exclusão com sucesso
		return ResponseEntity.noContent().build();
	}

	/**
	 * 5. READ ALL: Lista todos os alimentos cadastrados.
	 * URL: GET http://localhost:8080/alimentos
	 */
	@GetMapping
	public ResponseEntity<List<Alimento>> listarTodos() {
		return ResponseEntity.ok(alimentoService.listarTodos());
	}
}
