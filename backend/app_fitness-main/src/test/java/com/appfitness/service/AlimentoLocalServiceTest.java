package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AlimentoLocalServiceTest {

    private AlimentoLocalService service;

    @BeforeEach
    void setUp() {
        service = new AlimentoLocalService();
        service.carregarCatalogo();
    }

    @Test
    void deveEncontrarAlimentoPeloNome() {
        var resultado = service.buscarAlimentosOffline("banana prata");

        assertThat(resultado).isNotEmpty();
        assertThat(resultado).anySatisfy(alimento -> {
            assertThat(alimento.nome()).isEqualTo("Banana prata");
            assertThat(alimento.porcao()).isEqualTo("100g");
            assertThat(alimento.calorias()).isEqualTo(98.0);
            assertThat(alimento.proteinas()).isEqualTo(1.3);
            assertThat(alimento.carboidratos()).isEqualTo(26.0);
            assertThat(alimento.gorduras()).isEqualTo(0.1);
        });
    }

    @Test
    void deveEncontrarAlimentoPeloAliasIgnorandoMaiusculasEMinusculas() {
        // "frango grelhado" é um alias de "Peito de frango grelhado sem pele".
        var resultado = service.buscarAlimentosOffline("FRANGO GRELHADO");

        assertThat(resultado).isNotEmpty();
        assertThat(resultado).anySatisfy(alimento ->
                assertThat(alimento.nome()).isEqualTo("Peito de frango grelhado sem pele"));
    }

    @Test
    void deveNormalizarEspacosNaBusca() {
        var resultado = service.buscarAlimentosOffline("  ovo  ");

        assertThat(resultado).isNotEmpty();
    }

    @Test
    void deveIgnorarQuantidadeEPreposicaoAntesDoNome() {
        var resultado = service.buscarAlimentosOffline("100g de frango");

        assertThat(resultado).isNotEmpty();
        assertThat(resultado).anyMatch(alimento -> alimento.nome().contains("frango"));
    }

    @Test
    void deveReconhecerMaisDeUmAlimentoNaFrase() {
        var resultado = service.buscarAlimentosOffline("100g de frango e 2 ovos");

        assertThat(resultado).anyMatch(alimento -> alimento.nome().contains("frango"));
        assertThat(resultado).anyMatch(alimento -> alimento.nome().contains("Ovo"));
    }

    @Test
    void devePreservarMlEEscalarNutrientesPelaDensidade() {
        var resultado = service.buscarAlimentosOffline("100ml de leite integral");

        assertThat(resultado).anySatisfy(alimento -> {
            assertThat(alimento.porcao()).isEqualTo("100ml");
            assertThat(alimento.calorias()).isEqualTo(62.83);
            assertThat(alimento.proteinas()).isEqualTo(3.3);
        });
    }

    @Test
    void deveConverterLitroParaMililitrosSemAlterarAUnidadeExibida() {
        var resultado = service.buscarAlimentosOffline("1l de leite desnatado");

        assertThat(resultado).anySatisfy(alimento -> {
            assertThat(alimento.porcao()).isEqualTo("1l");
            assertThat(alimento.calorias()).isEqualTo(360.5);
        });
    }

    @Test
    void deveRetornarListaVaziaParaAlimentoInexistente() {
        var resultado = service.buscarAlimentosOffline("prato alienígena inexistente xyz123");

        assertThat(resultado).isEmpty();
    }

    @Test
    void deveRetornarListaVaziaParaQueryNulaOuEmBranco() {
        assertThat(service.buscarAlimentosOffline(null)).isEmpty();
        assertThat(service.buscarAlimentosOffline("   ")).isEmpty();
    }
}
