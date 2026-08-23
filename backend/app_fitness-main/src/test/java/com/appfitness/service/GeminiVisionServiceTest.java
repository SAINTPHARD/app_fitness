package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Cobre validação de entrada e sanitização da resposta do provider.
 * O contrato HTTP de fallback é coberto em {@code AlimentoBuscaControllerTest}.
 */
class GeminiVisionServiceTest {

    private final GeminiVisionService service = new GeminiVisionService();

    @Test
    void deveRejeitarBuscaNula() {
        assertThatThrownBy(() -> service.buscarMacrosPorTexto(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("obrigatório");
    }

    @Test
    void deveRejeitarBuscaEmBranco() {
        assertThatThrownBy(() -> service.buscarMacrosPorTexto("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deveRemoverBlocoMarkdownDaRespostaJson() {
        String resposta = "```json\n[{\"nome\":\"Frango\"}]\n```";

        assertThat(GeminiVisionService.limparRespostaJson(resposta))
                .isEqualTo("[{\"nome\":\"Frango\"}]");
    }

    @Test
    void deveExtrairArrayMesmoComTextoAoRedor() {
        assertThat(GeminiVisionService.limparRespostaJson("Resultado: [] fim"))
                .isEqualTo("[]");
    }

    @Test
    void deveRejeitarRespostaSemArrayJson() {
        assertThatThrownBy(() -> GeminiVisionService.limparRespostaJson("```json\n{}\n```"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("array JSON");
    }
}
