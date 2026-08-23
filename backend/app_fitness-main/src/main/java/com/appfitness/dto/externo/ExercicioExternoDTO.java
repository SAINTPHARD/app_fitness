package com.appfitness.dto.externo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Formato de exercício exposto pelo catálogo ({@code CatalogoLocalService}).
 * O nome do tipo e o pacote ({@code dto.externo}) ficaram do desenho anterior
 * (API Ninjas), mas hoje a única fonte é o arquivo local
 * {@code resources/data/exercicios.json} — já em português, sem tradução
 * automática. {@code gifUrl} é o campo novo: aponta para a animação exibida
 * no card do catálogo no frontend.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ExercicioExternoDTO(
		String name,
		String type,
		String muscle,
		String equipment,
		String difficulty,
		String instructions,
		String gifUrl
) {}
