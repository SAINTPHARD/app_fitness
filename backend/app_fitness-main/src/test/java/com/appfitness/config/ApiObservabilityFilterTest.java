package com.appfitness.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class ApiObservabilityFilterTest {
    @Test
    void normalizaIdsSemExporIdentificadoresNasMetricas() {
        assertEquals("/usuarios/:id/refeicoes/:id", ApiObservabilityFilter.normalizarRota("/usuarios/42/refeicoes/987"));
        assertEquals("/fotos/:id", ApiObservabilityFilter.normalizarRota("/fotos/550e8400-e29b-41d4-a716-446655440000"));
    }
}
