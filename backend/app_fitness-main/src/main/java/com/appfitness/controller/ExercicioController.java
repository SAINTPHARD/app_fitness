package com.appfitness.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.ExercicioService;

import jakarta.validation.Valid;

/**
 * Controlador para gerenciar exercícios já existentes por ID. A criação
 * (POST) vive em `TreinoController` (`/treinos/{treinoId}/exercicios`),
 * aninhada sob a ficha — mesmo padrão de `/refeicoes/{id}/alimentos`.
 *
 * CORREÇÃO: nenhuma rota validava dono nem exigia autenticação — ver
 * `ExercicioService` para o diagnóstico completo.
 */
@RestController
@RequestMapping("/exercicios")
public class ExercicioController {

	private final ExercicioService exercicioService;

	public ExercicioController(ExercicioService exercicioService) {
		this.exercicioService = exercicioService;
	}

	/**
	 * READ: Buscar um exercício específico por ID (só se a ficha for do
	 * usuário autenticado).
	 * URL: GET http://localhost:8080/exercicios/{id}
	 */
	@GetMapping("/{id}")
	public ResponseEntity<Exercicio> buscarPorId(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(exercicioService.buscarPorIdEUsuario(id, usuarioLogado));
	}

	/**
	 * UPDATE: Atualiza um exercício existente. 409 se o novo nome colidir
	 * com outro já na mesma ficha.
	 * URL: PUT http://localhost:8080/exercicios/{id}
	 */
	@PutMapping("/{id}")
	public ResponseEntity<Exercicio> atualizar(
			@PathVariable Long id,
			@Valid @RequestBody Exercicio exercicioAtualizado,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(exercicioService.atualizar(id, exercicioAtualizado, usuarioLogado));
	}

	/**
	 * DELETE: Exclui um exercício da ficha (o histórico de séries já
	 * registradas é preservado — ver `ExercicioService.deletar`).
	 * URL: DELETE http://localhost:8080/exercicios/{id}
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		exercicioService.deletar(id, usuarioLogado);
		return ResponseEntity.noContent().build();
	}

	private Usuario extrairUsuarioAutenticado(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
			throw new RuntimeException("Usuário não autenticado ou token inválido.");
		}
		return (Usuario) authentication.getPrincipal();
	}
}
