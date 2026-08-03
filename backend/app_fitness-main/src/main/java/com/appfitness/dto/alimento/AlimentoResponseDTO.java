package com.appfitness.dto.alimento;

import com.appfitness.model.entity.Alimento;

/**
 * DTO de resposta para serializar os dados de um Alimento.
 * Responsável por representar os dados de um alimento, incluindo nome, quantidade e valores nutricionais.
 */
public record AlimentoResponseDTO(
    Long id,
    String nome,
    String quantidade,
    Double calorias,
    Double proteinas,
    Double carboidratos,
    Double gorduras
) {

    /**
     * Converte a Entidade JPA (Alimento) para DTO com conversão segura de tipos.
     */
    public static AlimentoResponseDTO fromEntity(Alimento alimento) {
        if (alimento == null) {
            return null;
        }

        // Converte com segurança (.doubleValue()) independente se no Alimento.java é Integer, Double ou BigDecimal
        Double cal = alimento.getCalorias() != null ? alimento.getCalorias().doubleValue() : 0.0;
        Double prot = alimento.getProteinas() != null ? alimento.getProteinas().doubleValue() : 0.0;
        Double carb = alimento.getCarboidratos() != null ? alimento.getCarboidratos().doubleValue() : 0.0;
        Double gord = alimento.getGorduras() != null ? alimento.getGorduras().doubleValue() : 0.0;

        return new AlimentoResponseDTO(
            alimento.getId(),
            alimento.getNome(),
            alimento.getQuantidade(),
            cal,
            prot,
            carb,
            gord
        );
    }
}