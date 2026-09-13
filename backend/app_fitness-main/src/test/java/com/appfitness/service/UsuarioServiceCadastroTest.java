package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.appfitness.dto.usuario.UsuarioRequestDTO;
import com.appfitness.model.entity.Usuario;
import com.appfitness.model.enums.Objetivo;
import com.appfitness.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceCadastroTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UsuarioService service;

    @BeforeEach
    void setUp() {
        service = new UsuarioService(repository, passwordEncoder);
    }

    @Test
    void deveConverterNormalizarECodificarDadosDoCadastro() {
        var request = new UsuarioRequestDTO(
                " Robedson ",
                " ROBEDSON@Example.com ",
                "SenhaForte123",
                31,
                79.0,
                182.0,
                "m",
                Objetivo.HIPERTROFIA
        );

        when(passwordEncoder.encode("SenhaForte123")).thenReturn("hash-bcrypt");
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario usuario = invocation.getArgument(0);
            usuario.setId(1L);
            return usuario;
        });

        var response = service.salvar(request);

        var captor = ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        Usuario salvo = captor.getValue();

        assertThat(salvo.getNome()).isEqualTo("Robedson");
        assertThat(salvo.getEmail()).isEqualTo("robedson@example.com");
        assertThat(salvo.getSenha()).isEqualTo("hash-bcrypt");
        assertThat(salvo.getSexo()).isEqualTo('M');
        assertThat(salvo.getObjetivo()).isEqualTo(Objetivo.HIPERTROFIA);
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("robedson@example.com");
        assertThat(response.getSexo()).isEqualTo("M");
    }
}
