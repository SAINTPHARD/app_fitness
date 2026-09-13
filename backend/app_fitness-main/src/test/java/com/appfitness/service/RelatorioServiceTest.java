package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.AguaRegistroRepository;
import com.appfitness.repository.PesoRegistroRepository;
import com.appfitness.repository.RefeicaoRepository;
import com.appfitness.repository.SerieRepository;
import com.appfitness.repository.SessaoTreinoRepository;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {
    @Mock RefeicaoRepository refeicoes;
    @Mock AguaRegistroRepository agua;
    @Mock PesoRegistroRepository pesos;
    @Mock SessaoTreinoRepository sessoes;
    @Mock SerieRepository series;
    private RelatorioService service;
    private Usuario usuario;

    @BeforeEach void preparar() {
        service = new RelatorioService(refeicoes, agua, pesos, sessoes, series);
        usuario = new Usuario(); usuario.setId(42L);
        when(refeicoes.somarCaloriasPorDia(eq(42L), any(), any())).thenReturn(List.of());
        when(agua.somarPorDia(eq(42L), any(), any())).thenReturn(List.of());
        when(pesos.findByUsuarioIdAndDataBetweenOrderByDataAsc(eq(42L), any(), any())).thenReturn(List.of());
        when(sessoes.resumirSessoesPorDia(eq(42L), any(), any())).thenReturn(List.of());
        when(series.resumirAderencia(eq(42L), any(), any())).thenReturn(List.of());
        when(series.somarVolumePorGrupo(eq(42L), any(), any())).thenReturn(List.of());
    }

    @Test void deveAgregarPeriodoAtualEAnteriorComNumeroConstanteDeConsultas() {
        var relatorio = service.gerar(usuario, 7);
        assertThat(relatorio.serie()).hasSize(7);
        assertThat(relatorio.atual().sessoesConcluidas()).isZero();
        verify(refeicoes, times(1)).somarCaloriasPorDia(eq(42L), any(), any());
        verify(agua, times(1)).somarPorDia(eq(42L), any(), any());
        verify(pesos, times(1)).findByUsuarioIdAndDataBetweenOrderByDataAsc(eq(42L), any(), any());
        verify(sessoes, times(1)).resumirSessoesPorDia(eq(42L), any(), any());
        verify(series, times(1)).resumirAderencia(eq(42L), any(), any());
        verify(series, times(1)).somarVolumePorGrupo(eq(42L), any(), any());
    }
}
