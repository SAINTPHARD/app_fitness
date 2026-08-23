package com.appfitness.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.appfitness.dto.alimento.AlimentoBuscaResponseDTO;
import com.appfitness.service.AlimentoLocalService;
import com.appfitness.service.GeminiVisionService;

/**
 * Motor híbrido de busca de alimentos por texto livre:
 * 1) tenta primeiro o catálogo local ({@link AlimentoLocalService}) —
 *    instantâneo, sem custo e sem dependência externa;
 * 2) só cai para a IA ({@link GeminiVisionService#buscarMacrosPorTexto})
 *    quando o catálogo local não tem nada para a busca.
 *
 * Endpoint próprio (não reaproveita {@link AlimentoController}, que expõe o
 * CRUD do Alimento persistido/vinculado a uma Refeição): o resultado aqui é
 * um DTO efêmero ({@link AlimentoBuscaResponseDTO}), sem id e sem
 * persistência — o React decide se/como transforma isso num Alimento real.
 *
 * CORS já é centralizado em `SecurityConfig.corsConfigurationSource()`.
 */
@RestController
@RequestMapping("/api/alimentos")
public class AlimentoBuscaController {
	private static final Logger LOGGER = LoggerFactory.getLogger(AlimentoBuscaController.class);

	private final AlimentoLocalService alimentoLocalService;
	private final GeminiVisionService geminiVisionService;

	public AlimentoBuscaController(AlimentoLocalService alimentoLocalService, GeminiVisionService geminiVisionService) {
		this.alimentoLocalService = alimentoLocalService;
		this.geminiVisionService = geminiVisionService;
	}

	/**
	 * Busca alimentos e macronutrientes a partir de um texto livre.
	 * ex: GET http://localhost:8080/api/alimentos/buscar?query=100g de frango e 2 ovos
	 */
	@GetMapping("/buscar")
	public ResponseEntity<List<AlimentoBuscaResponseDTO>> buscar(@RequestParam String query) {
		if (query == null || query.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O parâmetro 'query' é obrigatório.");
		}

		// 1. Catálogo local primeiro: instantâneo, sem custo de API.
		List<AlimentoBuscaResponseDTO> resultadosOffline = alimentoLocalService.buscarAlimentosOffline(query);
		if (!resultadosOffline.isEmpty()) {
			return ResponseEntity.ok(resultadosOffline);
		}

		// 2. Fallback de IA: só chamado quando o catálogo local não encontrou nada.
		try {
			List<AlimentoBuscaResponseDTO> resultadosIa = geminiVisionService.buscarMacrosPorTexto(query);
			return ResponseEntity.ok(resultadosIa);
		} catch (RuntimeException exception) {
			// Defesa adicional: mesmo uma implementação futura do provider que
			// volte a lançar erro mantém o contrato estável de HTTP 200 + [].
			LOGGER.warn("Fallback vazio no endpoint de busca alimentar: {}", exception.getMessage());
			return ResponseEntity.ok(List.of());
		}
	}
}
