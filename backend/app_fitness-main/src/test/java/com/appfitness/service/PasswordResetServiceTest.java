package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.appfitness.exception.DadosInvalidosException;
import com.appfitness.model.entity.PasswordResetToken;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.PasswordResetTokenRepository;
import com.appfitness.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock PasswordResetTokenRepository tokenRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock PasswordResetNotificationService notificationService;

    private PasswordResetService service;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        service = new PasswordResetService(tokenRepository, usuarioRepository,
                passwordEncoder, notificationService);
        usuario = new Usuario();
        usuario.setEmail("atleta@example.com");
    }

    @Test
    void respondeSemRevelarQuandoEmailNaoExiste() {
        when(usuarioRepository.findByEmailIgnoreCase(anyString())).thenReturn(null);
        service.solicitar("ausente@example.com");
        verify(tokenRepository, never()).save(any());
        verify(notificationService, never()).enviar(any(), anyString());
    }

    @Test
    void persisteSomenteHashDoTokenEEnviaTokenAberto() {
        when(usuarioRepository.findByEmailIgnoreCase(anyString())).thenReturn(usuario);
        when(tokenRepository.findFirstByUsuarioOrderByCriadoEmDesc(usuario)).thenReturn(Optional.empty());
        when(notificationService.enviar(any(), anyString())).thenReturn(true);

        service.solicitar("ATLETA@example.com");

        ArgumentCaptor<PasswordResetToken> tokenSalvo = ArgumentCaptor.forClass(PasswordResetToken.class);
        ArgumentCaptor<String> tokenEnviado = ArgumentCaptor.forClass(String.class);
        verify(tokenRepository).save(tokenSalvo.capture());
        verify(notificationService).enviar(any(), tokenEnviado.capture());
        assertThat(tokenSalvo.getValue().getTokenHash()).hasSize(64).doesNotContain(tokenEnviado.getValue());
    }

    @Test
    void rejeitaTokenExpirado() {
        PasswordResetToken expirado = new PasswordResetToken();
        expirado.setExpiraEm(LocalDateTime.now().minusSeconds(1));
        when(tokenRepository.findByTokenHashAndUsadoEmIsNull(anyString())).thenReturn(Optional.of(expirado));

        assertThatThrownBy(() -> service.redefinir("token", "NovaSenha1"))
                .isInstanceOf(DadosInvalidosException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void redefineSenhaEInvalidaTokenAposUso() {
        PasswordResetToken valido = new PasswordResetToken();
        valido.setUsuario(usuario);
        valido.setExpiraEm(LocalDateTime.now().plusMinutes(5));
        when(tokenRepository.findByTokenHashAndUsadoEmIsNull(anyString())).thenReturn(Optional.of(valido));
        when(passwordEncoder.encode("NovaSenha1")).thenReturn("hash-bcrypt");

        service.redefinir("token", "NovaSenha1");

        assertThat(usuario.getSenha()).isEqualTo("hash-bcrypt");
        assertThat(valido.getUsadoEm()).isNotNull();
        verify(usuarioRepository).save(usuario);
    }
}
