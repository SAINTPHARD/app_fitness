package com.appfitness.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.dto.externo.ExercicioExternoDTO;
import com.appfitness.service.CatalogoLocalService;

/**
 * Classe de controlador para gerenciar o catálogo de exercícios.
 * Responsabilidade: fornecer endpoints para operações relacionadas ao catálogo de exercícios.
 * Objetivo : Expor uma rota (ex: /api/catalogo-exercicios/...) para o nosso próprio Frontend (React) chamar.
 *
 * Fonte dos dados: catálogo local estático ({@link CatalogoLocalService}),
 * já em português e com GIF de demonstração — sem chamada a serviço
 * externo, portanto sem risco de indisponibilidade/rate-limit em produção
 * ou durante uma demonstração ao vivo.
 */
@RestController
@RequestMapping("/api/catalogo-exercicios")
public class CatalogoExercicioController {

	private final CatalogoLocalService catalogoLocalService;

	public CatalogoExercicioController(CatalogoLocalService catalogoLocalService) {
		this.catalogoLocalService = catalogoLocalService;
	}

	/**
	 * Endpoint para buscar exercícios por músculo.
	 * ex:
	 * GET http://localhost:8080/api/catalogo-exercicios/musculo/biceps
	 */
	@GetMapping("/musculo/{musculo}")
	public ResponseEntity<List<ExercicioExternoDTO>> buscarExerciciosPorMusculo(@PathVariable String musculo) {
		List<ExercicioExternoDTO> exercicios = catalogoLocalService.buscarExerciciosPorMusculo(musculo);
		return ResponseEntity.ok(exercicios);
	}

}
