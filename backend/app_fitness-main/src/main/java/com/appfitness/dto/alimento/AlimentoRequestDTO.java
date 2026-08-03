package com.appfitness.dto.alimento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record AlimentoRequestDTO(
    @NotBlank(message = "O nome do alimento é obrigatório")
    String nome,

    @NotBlank(message = "A quantidade é obrigatória")
    String quantidade,

    @PositiveOrZero(message = "Calorias não podem ser negativas")
    Double calorias,

    @PositiveOrZero(message = "Proteína não pode ser negativa")
    Double proteina,

    @PositiveOrZero(message = "Carboidrato não pode ser negativo")
    Double carboidratos,

    @PositiveOrZero(message = "Gordura não pode ser negativa")
    Double gordura
) {}