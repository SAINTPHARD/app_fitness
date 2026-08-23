package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CatalogoLocalServiceTest {

    private CatalogoLocalService service;

    @BeforeEach
    void setUp() {
        service = new CatalogoLocalService();
        service.carregarCatalogo();
    }

    @Test
    void deveEncontrarExercicioDeSupinoParaChest() {
        var resultado = service.buscarExerciciosPorMusculo("chest");

        assertThat(resultado).isNotEmpty();
        assertThat(resultado).anySatisfy(exercicio -> {
            assertThat(exercicio.name()).isEqualTo("Supino Reto com Barra");
            assertThat(exercicio.instructions()).isNotBlank();
        });
    }

    @Test
    void deveNormalizarMusculoComEspacosEMaiusculas() {
        var resultado = service.buscarExerciciosPorMusculo("  CHEST  ");

        assertThat(resultado).isNotEmpty();
    }

    @Test
    void deveTraduzirIdsLegadosDoDropdownParaOsValoresDoJson() {
        assertThat(service.buscarExerciciosPorMusculo("pectorals")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("quads")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("lats")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("delts")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("abs")).isNotEmpty();
    }

    @Test
    void deveTraduzirAliasesDeMembrosInferioresEmPortugues() {
        assertThat(service.buscarExerciciosPorMusculo("pernas")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("posterior de coxa")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("femoral")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("glúteos")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("GLUTEO")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("panturrilhas")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("panturrilha")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("posterior_de_coxa")).isNotEmpty();
    }

    @Test
    void deveRetornarListaVaziaParaMusculoForaDoCatalogo() {
        var resultado = service.buscarExerciciosPorMusculo("pescoco");

        assertThat(resultado).isEmpty();
    }

    @Test
    void deveRejeitarMusculoNuloOuEmBranco() {
        assertThatThrownBy(() -> service.buscarExerciciosPorMusculo(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.buscarExerciciosPorMusculo("  "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void catalogoDeveCobrirOsPrincipaisGruposMusculares() {
        assertThat(service.buscarExerciciosPorMusculo("chest")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("back")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("legs")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("biceps")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("triceps")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("shoulders")).isNotEmpty();
        assertThat(service.buscarExerciciosPorMusculo("core")).isNotEmpty();
    }
}
