package com.appfitness.dto.alimento;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Resultado de uma busca de alimentos por texto livre via IA
 * ({@code GeminiVisionService.buscarMacrosPorTexto}) — ex: "100g de frango
 * e 2 ovos" vira uma lista com um {@code AlimentoBuscaResponseDTO} por
 * alimento identificado.
 *
 * Deliberadamente um record separado de {@link AlimentoResponseDTO}: aquele
 * é a resposta do CRUD de Alimento vinculado a uma Refeição (tem
 * {@code id}, vem de {@code Alimento.fromEntity(...)}, campo
 * {@code quantidade}); este é um resultado efêmero da IA, sem persistência
 * e sem vínculo com entidade — nada aqui tem {@code id}, e o campo de
 * quantidade chama {@code porcao} porque é isso que a IA devolve (ex:
 * "100g"), não o que o usuário editou manualmente num formulário.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AlimentoBuscaResponseDTO(
    String nome,
    String porcao,
    Double calorias,
    Double proteinas,
    Double carboidratos,
    Double gorduras
) {}
