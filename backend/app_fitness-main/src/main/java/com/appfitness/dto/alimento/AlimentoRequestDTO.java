package com.appfitness.dto.alimento;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AlimentoRequestDTO(
    @NotBlank(message = "O nome do alimento é obrigatório")
    String nome,

    @NotBlank(message = "A quantidade é obrigatória")
    @Pattern(regexp = "(?i)^\\s*(?:[1-9][0-9]*(?:[.,][0-9]+)?|0*[.,][0-9]*[1-9][0-9]*)\\s*(?:g|kg|ml\\.?|l|litros?|mililitros?|unidades?|un|copos?)?\\s*$", message = "A quantidade deve conter um número positivo e uma unidade válida")
    String quantidade,

    @NotNull(message = "As calorias são obrigatórias")
    @Min(value = 0, message = "Calorias não podem ser negativas")
    Double calorias,

    @NotNull(message = "A proteína é obrigatória")
    @Min(value = 0, message = "Proteína não pode ser negativa")
    @Max(value = 1000, message = "Proteína deve ser menor ou igual a 1000 g")
    Double proteina,

    @NotNull(message = "O carboidrato é obrigatório")
    @Min(value = 0, message = "Carboidrato não pode ser negativo")
    @Max(value = 1500, message = "Carboidrato deve ser menor ou igual a 1500 g")
    Double carboidratos,

    @NotNull(message = "A gordura é obrigatória")
    @Min(value = 0, message = "Gordura não pode ser negativa")
    @Max(value = 500, message = "Gordura deve ser menor ou igual a 500 g")
    Double gordura
) {}
