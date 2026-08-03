package com.appfitness.dto;

/**
 * DTO para mapear o JSON retornado pela API do Gemini Vision.
 * Responsável por representar os dados de análise de alimentos, 
 * incluindo nome, quantidade e valores nutricionais.
 */
public record AlimentoAnaliseDTO(
    String nome,
    String quantidade,
    Double calorias,
    Double proteina,
    Double carboidratos,
    Double gordura
) {}