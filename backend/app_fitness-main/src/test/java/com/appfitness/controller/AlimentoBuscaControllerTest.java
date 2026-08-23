package com.appfitness.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.appfitness.dto.alimento.AlimentoBuscaResponseDTO;
import com.appfitness.service.AlimentoLocalService;
import com.appfitness.service.GeminiVisionService;

@ExtendWith(MockitoExtension.class)
class AlimentoBuscaControllerTest {

    @Mock
    private AlimentoLocalService alimentoLocalService;

    @Mock
    private GeminiVisionService geminiVisionService;

    private AlimentoBuscaController controller;

    @BeforeEach
    void setUp() {
        controller = new AlimentoBuscaController(alimentoLocalService, geminiVisionService);
    }

    @Test
    void deveRetornar200ComResultadoDoCatalogoLocalSemChamarAIa() {
        var frango = new AlimentoBuscaResponseDTO("Peito de frango grelhado sem pele", "100g", 159.0, 32.0, 0.0, 2.5);
        when(alimentoLocalService.buscarAlimentosOffline("frango")).thenReturn(List.of(frango));

        var response = controller.buscar("frango");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(frango);
        verify(geminiVisionService, never()).buscarMacrosPorTexto(any());
    }

    @Test
    void deveCairParaAIaQuandoCatalogoLocalNaoEncontraNada() {
        var prato = new AlimentoBuscaResponseDTO("Prato exótico inventado", "1 porção", 300.0, 20.0, 30.0, 10.0);
        when(alimentoLocalService.buscarAlimentosOffline("prato exótico inventado")).thenReturn(List.of());
        when(geminiVisionService.buscarMacrosPorTexto("prato exótico inventado")).thenReturn(List.of(prato));

        var response = controller.buscar("prato exótico inventado");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(prato);
    }

    @Test
    void devePropagar400QuandoQueryVaziaOuAusente() {
        assertThatThrownBy(() -> controller.buscar(""))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> controller.buscar("   "))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void deveRetornar200ComListaVaziaQuandoIaFalhaAposCatalogoLocalVazio() {
        when(alimentoLocalService.buscarAlimentosOffline("texto qualquer")).thenReturn(List.of());
        when(geminiVisionService.buscarMacrosPorTexto("texto qualquer"))
                .thenThrow(new RuntimeException("Erro ao buscar macronutrientes com a IA do Gemini: timeout."));

        var response = controller.buscar("texto qualquer");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
    }
}
