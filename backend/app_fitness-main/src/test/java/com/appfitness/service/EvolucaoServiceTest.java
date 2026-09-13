package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.appfitness.model.entity.FotoProgresso;
import com.appfitness.model.entity.PesoRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.FotoProgressoRepository;
import com.appfitness.repository.MedidaCorporalRepository;
import com.appfitness.repository.PesoRegistroRepository;

@ExtendWith(MockitoExtension.class)
class EvolucaoServiceTest {
    @Mock PesoRegistroRepository pesoRepository;
    @Mock MedidaCorporalRepository medidaRepository;
    @Mock FotoProgressoRepository fotoRepository;
    private EvolucaoService service;
    private Usuario usuario;

    @BeforeEach
    void preparar() {
        service = new EvolucaoService(pesoRepository, medidaRepository, fotoRepository);
        usuario = new Usuario();
        usuario.setId(7L);
    }

    @Test
    void deveAtualizarRegistroExistenteNoMesmoDiaSemDuplicar() {
        LocalDate data = LocalDate.of(2026, 8, 31);
        PesoRegistro existente = new PesoRegistro();
        existente.setId(10L);
        existente.setData(data);
        existente.setPeso(80.0);
        PesoRegistro entrada = new PesoRegistro();
        entrada.setData(data);
        entrada.setPeso(79.4);

        when(pesoRepository.findByUsuarioIdAndData(7L, data)).thenReturn(Optional.of(existente));
        when(pesoRepository.save(any(PesoRegistro.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        PesoRegistro salvo = service.salvarPeso(entrada, usuario);

        assertThat(salvo.getId()).isEqualTo(10L);
        assertThat(salvo.getPeso()).isEqualTo(79.4);
    }

    @Test
    void deveRecusarUrlPublicaComoFotoDeProgresso() {
        FotoProgresso foto = new FotoProgresso();
        foto.setData(LocalDate.now());
        foto.setPose("FRENTE");
        foto.setSrc("https://exemplo.com/foto-publica.jpg");

        assertThatThrownBy(() -> service.salvarFoto(foto, usuario))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("URLs públicas não são aceitas");
    }
}
