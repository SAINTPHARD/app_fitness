package com.appfitness.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.dto.treino.ResumoSessaoDTO;
import com.appfitness.dto.treino.SessaoTreinoResponseDTO;
import com.appfitness.exception.UsuarioNaoAutenticadoException;
import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.SessaoTreinoService;
import com.appfitness.service.TreinoService;

/**
 * Sessões de execução de treino: a "instância real" de uma ficha num dia
 * específico. Retorna sempre `SessaoTreinoResponseDTO` — nunca a entidade
 * crua — conforme a regra de não expor persistência diretamente pela API.
 */
@RestController
public class SessaoTreinoController {

	private final SessaoTreinoService sessaoTreinoService;
	private final TreinoService treinoService;

	public SessaoTreinoController(SessaoTreinoService sessaoTreinoService, TreinoService treinoService) {
		this.sessaoTreinoService = sessaoTreinoService;
		this.treinoService = treinoService;
	}

	/**
	 * Inicia (ou retoma, se já existir) a sessão de hoje — ou de uma data
	 * específica — para uma ficha. Idempotente: chamar de novo no mesmo dia
	 * devolve a mesma sessão em vez de criar outra.
	 * URL: POST /treinos/{treinoId}/sessoes?data=2026-08-10 (data opcional, default hoje)
	 */
	@PostMapping("/treinos/{treinoId}/sessoes")
	public ResponseEntity<SessaoTreinoResponseDTO> obterOuCriarSessaoDoDia(
			@PathVariable Long treinoId,
			@RequestParam(value = "data", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
			Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		Treino treino = treinoService.buscarPorIdEUsuario(treinoId, usuarioLogado);
		SessaoTreino sessao = sessaoTreinoService.obterOuCriarSessaoDoDia(
				treino, usuarioLogado, data != null ? data : LocalDate.now());
		return ResponseEntity.status(HttpStatus.CREATED).body(SessaoTreinoResponseDTO.fromEntity(sessao));
	}

	/**
	 * Espia a sessão de hoje de uma ficha SEM criar uma nova — 204 se ainda
	 * não existir. Usado por telas de leitura (ex: widget "Próximo treino"
	 * da Home) que não devem abrir uma sessão só por serem exibidas.
	 * URL: GET /treinos/{treinoId}/sessoes/hoje
	 */
	@GetMapping("/treinos/{treinoId}/sessoes/hoje")
	public ResponseEntity<SessaoTreinoResponseDTO> buscarSessaoDeHoje(
			@PathVariable Long treinoId, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		Treino treino = treinoService.buscarPorIdEUsuario(treinoId, usuarioLogado);
		return sessaoTreinoService.buscarSessaoDeHojeSemCriar(treino)
				.map(sessao -> ResponseEntity.ok(SessaoTreinoResponseDTO.fromEntity(sessao)))
				.orElseGet(() -> ResponseEntity.noContent().build());
	}

	@GetMapping("/sessoes/{id}")
	public ResponseEntity<SessaoTreinoResponseDTO> buscarPorId(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(SessaoTreinoResponseDTO.fromEntity(
				sessaoTreinoService.buscarPorIdEUsuario(id, usuarioLogado)));
	}

	@PatchMapping("/sessoes/{id}/iniciar")
	public ResponseEntity<SessaoTreinoResponseDTO> iniciar(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(SessaoTreinoResponseDTO.fromEntity(sessaoTreinoService.iniciar(id, usuarioLogado)));
	}

	@PatchMapping("/sessoes/{id}/pausar")
	public ResponseEntity<SessaoTreinoResponseDTO> pausar(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(SessaoTreinoResponseDTO.fromEntity(sessaoTreinoService.pausar(id, usuarioLogado)));
	}

	@PatchMapping("/sessoes/{id}/retomar")
	public ResponseEntity<SessaoTreinoResponseDTO> retomar(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(SessaoTreinoResponseDTO.fromEntity(sessaoTreinoService.retomar(id, usuarioLogado)));
	}

	@PatchMapping("/sessoes/{id}/concluir")
	public ResponseEntity<SessaoTreinoResponseDTO> concluir(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(SessaoTreinoResponseDTO.fromEntity(sessaoTreinoService.concluir(id, usuarioLogado)));
	}

	/**
	 * Resumo final da sessão — tempo total, volume, recordes pessoais e
	 * pendências. Pode ser consultado mesmo com a sessão ainda em andamento
	 * (útil para o cliente confirmar "tem certeza que quer encerrar?" antes
	 * de fato chamar `/concluir`).
	 * URL: GET /sessoes/{id}/resumo
	 */
	@GetMapping("/sessoes/{id}/resumo")
	public ResponseEntity<ResumoSessaoDTO> resumo(@PathVariable Long id, Authentication authentication) {
		Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
		return ResponseEntity.ok(sessaoTreinoService.gerarResumo(id, usuarioLogado));
	}

	private Usuario extrairUsuarioAutenticado(Authentication authentication) {
		if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
			throw new UsuarioNaoAutenticadoException("Usuário não autenticado ou token inválido.");
		}
		return (Usuario) authentication.getPrincipal();
	}
}
