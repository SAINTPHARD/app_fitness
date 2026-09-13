package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.appfitness.exception.AcessoNegadoException;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceSegurancaTest {
    @Mock UsuarioRepository repository;
    @Mock PasswordEncoder encoder;
    private UsuarioService service;
    private Usuario usuario;

    @BeforeEach void preparar() {
        service = new UsuarioService(repository, encoder);
        usuario = new Usuario(); usuario.setId(9L); usuario.setSenha("hash-atual");
        when(repository.findById(9L)).thenReturn(Optional.of(usuario));
    }

    @Test void deveExigirSenhaAtualParaAlteracao() {
        when(encoder.matches("incorreta", "hash-atual")).thenReturn(false);
        assertThatThrownBy(() -> service.alterarSenha(9L, "incorreta", "NovaSenha123"))
                .isInstanceOf(AcessoNegadoException.class);
        verify(repository, never()).save(usuario);
    }

    @Test void deveCodificarNovaSenhaAposReautenticacao() {
        when(encoder.matches("correta", "hash-atual")).thenReturn(true);
        when(encoder.matches("NovaSenha123", "hash-atual")).thenReturn(false);
        when(encoder.encode("NovaSenha123")).thenReturn("novo-hash");
        service.alterarSenha(9L, "correta", "NovaSenha123");
        verify(repository).save(usuario);
    }

    @Test void deveExigirFraseForteParaExcluirConta() {
        when(encoder.matches("correta", "hash-atual")).thenReturn(true);
        assertThatThrownBy(() -> service.excluirContaComConfirmacao(9L, "correta", "EXCLUIR"))
                .isInstanceOf(IllegalArgumentException.class);
        verify(repository, never()).delete(usuario);
    }
}
