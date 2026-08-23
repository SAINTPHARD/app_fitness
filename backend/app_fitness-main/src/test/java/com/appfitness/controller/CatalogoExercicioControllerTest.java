package com.appfitness.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.appfitness.dto.externo.ExercicioExternoDTO;
import com.appfitness.exception.GlobalExceptionHandler;
import com.appfitness.service.CatalogoLocalService;

@ExtendWith(MockitoExtension.class)
class CatalogoExercicioControllerTest {

    @Mock
    private CatalogoLocalService service;

    private CatalogoExercicioController controller;
    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        controller = new CatalogoExercicioController(service);
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void deveRetornar200ComExercicios() {
        var exercicio = new ExercicioExternoDTO(
                "Supino Reto", "strength", "chest", "barbell", "intermediate",
                "Pressione a barra.", "https://i.imgur.com/8bx1p0P.gif");
        when(service.buscarExerciciosPorMusculo("chest")).thenReturn(List.of(exercicio));

        var response = controller.buscarExerciciosPorMusculo("chest");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsExactly(exercicio);
    }

    @Test
    void deveRetornar200ComListaVaziaQuandoMusculoNaoEstaNoCatalogo() {
        when(service.buscarExerciciosPorMusculo("pescoco")).thenReturn(List.of());
        assertThat(controller.buscarExerciciosPorMusculo("pescoco").getBody()).isEmpty();
    }

    @Test
    void devePadronizarEntradaInvalidaComo400() {
        var response = exceptionHandler.handleIllegalArgument(new IllegalArgumentException("Músculo inválido."));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMensagens()).containsExactly("Músculo inválido.");
    }
}
