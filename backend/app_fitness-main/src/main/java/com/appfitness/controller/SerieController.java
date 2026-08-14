package com.appfitness.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.dto.treino.SerieRequestDTO;
import com.appfitness.dto.treino.SerieResponseDTO;
import com.appfitness.dto.treino.UltimaExecucaoDTO;
import com.appfitness.exception.UsuarioNaoAutenticadoException;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.SerieService;

import jakarta.validation.Valid;

/**
 * Séries (carga/repetições registradas por execução de exercício). Retorna
 * sempre DTOs — nunca a entidade `Serie` crua.
 *
 * Erros: 400 (carga/reps inválidos, ou concluir sem repetições — `@Valid` /
 * `DadosInvalidosException`), 401 (sem token), 403 (série de outro usuário),
 * 404 (sessão/exercício/série inexistente), 409 (excluir série concluída
 * sem `confirmar=true`).
 */
@RestController
public class SerieController {

	private final SerieService serieService;

	public SerieController(SerieService serieService) {
		this.serieService = serieService;
	}

	@PostMapping("/sessoes/{sessaoId}/series")
	public ResponseEntity<SerieResponseDTO> registrar(
			@PathVariable Long sessaoId,
			@Valid @RequestBody SerieRequestDTO dto,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		var serie = serieService.registrarSerie(sessaoId, dto, usuarioLogado);
		return ResponseEntity.status(HttpStatus.CREATED).body(SerieResponseDTO.fromEntity(serie));
	}

	@PutMapping("/series/{id}")
	public ResponseEntity<SerieResponseDTO> atualizar(
			@PathVariable Long id,
			@Valid @RequestBody SerieRequestDTO dto,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		var serie = serieService.atualizar(id, dto, usuarioLogado);
		return ResponseEntity.ok(SerieResponseDTO.fromEntity(serie));
	}

	@PatchMapping("/series/{id}/concluir")
	public ResponseEntity<SerieResponseDTO> concluir(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		var serie = serieService.concluir(id, usuarioLogado);
		return ResponseEntity.ok(SerieResponseDTO.fromEntity(serie));
	}

	/**
	 * Exclui uma série. Se já concluída, exige `?confirmar=true` — sem
	 * isso, 409 (ver `SerieService.excluir`).
	 */
	@DeleteMapping("/series/{id}")
	public ResponseEntity<Void> excluir(
			@PathVariable Long id,
			@RequestParam(value = "confirmar", defaultValue = "false") boolean confirmar,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		serieService.excluir(id, usuarioLogado, confirmar);
		return ResponseEntity.noContent().build();
	}

	/**
	 * Base do preenchimento inteligente: última execução concluída deste
	 * exercício pelo usuário autenticado, e a melhor carga já registrada.
	 * URL: GET /exercicios/{exercicioId}/ultima-execucao
	 */
	@GetMapping("/exercicios/{exercicioId}/ultima-execucao")
	public ResponseEntity<UltimaExecucaoDTO> buscarUltimaExecucao(
			@PathVariable Long exercicioId, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(serieService.buscarUltimaExecucao(exercicioId, usuarioLogado));
	}

	private Usuario extrairUsuarioAutenticado(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
			throw new UsuarioNaoAutenticadoException("Usuário não autenticado ou token inválido.");
		}
		return (Usuario) authentication.getPrincipal();
	}
}
