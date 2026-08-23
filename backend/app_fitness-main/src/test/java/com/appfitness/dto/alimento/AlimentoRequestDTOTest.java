package com.appfitness.dto.alimento;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

class AlimentoRequestDTOTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void deveRejeitarQuantidadeZero() {
        var dto = new AlimentoRequestDTO("Arroz", "0g", 100.0, 2.0, 20.0, 1.0);

        assertThat(validator.validate(dto))
                .anyMatch(violacao -> violacao.getPropertyPath().toString().equals("quantidade"));
    }

    @Test
    void deveRejeitarMacrosNegativos() {
        var dto = new AlimentoRequestDTO("Arroz", "100g", 100.0, -1.0, -1.0, -1.0);

        assertThat(validator.validate(dto))
                .extracting(violacao -> violacao.getPropertyPath().toString())
                .contains("proteina", "carboidratos", "gordura");
    }

    @Test
    void deveAceitarQuantidadeEmMililitros() {
        var dto = new AlimentoRequestDTO("Leite", "200ml", 126.0, 6.6, 9.9, 6.8);

        assertThat(validator.validate(dto)).isEmpty();
    }
}
