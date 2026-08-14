package com.appfitness.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.ExercicioService;
import com.appfitness.service.TreinoService;

import jakarta.validation.Valid;

/**
 * Classe de controlador para a entidade Treino.
 * Responsável por lidar com as requisições HTTP relacionadas aos treinos.
 *
 * CORREÇÃO: nenhum endpoint verificava dono nem exigia autenticação — ver
 * `TreinoService` para o diagnóstico completo. Agora segue o mesmo padrão
 * de `RefeicaoController` (Authentication + escopo por usuário em toda rota).
 */
@RestController
@RequestMapping("/treinos")
public class TreinoController {

	private final TreinoService treinoService;
	private final ExercicioService exercicioService;

	public TreinoController(TreinoService treinoService, ExercicioService exercicioService) {
		this.treinoService = treinoService;
		this.exercicioService = exercicioService;
	}

	/**
	 * 1. CREATE: Cria um novo treino para o usuário autenticado.
	 * URL: POST http://localhost:8080/treinos
	 */
	@PostMapping
	public ResponseEntity<Treino> criarTreino(@Valid @RequestBody Treino treino, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		Treino novoTreino = treinoService.salvar(treino, usuarioLogado);
		return ResponseEntity.status(HttpStatus.CREATED).body(novoTreino);
	}

	/**
	 * 2. READ: Obtém um treino específico por ID (só se pertencer ao usuário).
	 * URL: GET http://localhost:8080/treinos/{id}
	 */
	@GetMapping("/{id}")
	public ResponseEntity<Treino> buscarPorId(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(treinoService.buscarPorIdEUsuario(id, usuarioLogado));
	}

	/**
	 * 2b. Busca a ficha do usuário autenticado para um dia da semana (ex:
	 * "segunda"). Devolve 204 (sem corpo) se ainda não existir ficha para
	 * aquele dia — o frontend cria a ficha sob demanda ao adicionar o
	 * primeiro exercício.
	 * URL: GET http://localhost:8080/treinos/dia?diaSemana=segunda
	 */
	@GetMapping("/dia")
	public ResponseEntity<Treino> buscarPorDia(@RequestParam("diaSemana") String diaSemana, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		Treino treino = treinoService.buscarPorDia(usuarioLogado, diaSemana);
		return treino != null ? ResponseEntity.ok(treino) : ResponseEntity.noContent().build();
	}

	/**
	 * 3. UPDATE: Atualiza as informações de um treino existente.
	 * URL: PUT http://localhost:8080/treinos/{id}
	 */
	@PutMapping("/{id}")
	public ResponseEntity<Treino> atualizar(
			@PathVariable Long id,
			@Valid @RequestBody Treino treinoAtualizado,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(treinoService.atualizar(id, treinoAtualizado, usuarioLogado));
	}

	/**
	 * 4. DELETE: Exclui um treino do sistema por ID.
	 * URL: DELETE http://localhost:8080/treinos/{id}
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletar(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		treinoService.deletar(id, usuarioLogado);
		return ResponseEntity.noContent().build();
	}

	/**
	 * 5. READ ALL: Lista as fichas de treino DO USUÁRIO LOGADO.
	 * URL: GET http://localhost:8080/treinos
	 */
	@GetMapping
	public ResponseEntity<List<Treino>> listarTodos(Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(treinoService.listarPorUsuario(usuarioLogado));
	}

	// ==========================================
	// --- EXERCÍCIOS DA FICHA ---
	// ==========================================

	/**
	 * Adiciona um exercício a uma ficha existente. 409 se o mesmo nome já
	 * estiver na ficha (ver `ExercicioService.salvar`).
	 * URL: POST http://localhost:8080/treinos/{treinoId}/exercicios
	 */
	@PostMapping("/{treinoId}/exercicios")
	public ResponseEntity<Exercicio> adicionarExercicio(
			@PathVariable Long treinoId,
			@Valid @RequestBody Exercicio exercicio,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		Exercicio salvo = exercicioService.salvar(treinoId, exercicio, usuarioLogado);
		return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
	}

	private Usuario extrairUsuarioAutenticado(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
			throw new RuntimeException("Usuário não autenticado ou token inválido.");
		}
		return (Usuario) authentication.getPrincipal();
	}
}
