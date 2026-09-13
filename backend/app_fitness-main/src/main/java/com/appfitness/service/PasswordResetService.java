package com.appfitness.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.DadosInvalidosException;
import com.appfitness.model.entity.PasswordResetToken;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.PasswordResetTokenRepository;
import com.appfitness.repository.UsuarioRepository;

@Service
public class PasswordResetService {

    private static final int TOKEN_BYTES = 32;
    private static final int EXPIRACAO_MINUTOS = 30;
    private static final int INTERVALO_SOLICITACAO_SEGUNDOS = 60;

    private final PasswordResetTokenRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetNotificationService notificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            PasswordResetNotificationService notificationService) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional
    public void solicitar(String email) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email.trim());
        if (usuario == null) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();
        boolean solicitadoRecentemente = tokenRepository
                .findFirstByUsuarioOrderByCriadoEmDesc(usuario)
                .map(token -> token.getCriadoEm().isAfter(
                        agora.minusSeconds(INTERVALO_SOLICITACAO_SEGUNDOS)))
                .orElse(false);
        if (solicitadoRecentemente) {
            return;
        }

        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        String tokenAberto = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken token = new PasswordResetToken();
        token.setUsuario(usuario);
        token.setTokenHash(hash(tokenAberto));
        token.setCriadoEm(agora);
        token.setExpiraEm(agora.plusMinutes(EXPIRACAO_MINUTOS));
        tokenRepository.save(token);

        if (!notificationService.enviar(usuario, tokenAberto)) {
            tokenRepository.delete(token);
        }
    }

    @Transactional
    public void redefinir(String tokenAberto, String novaSenha) {
        LocalDateTime agora = LocalDateTime.now();
        PasswordResetToken token = tokenRepository
                .findByTokenHashAndUsadoEmIsNull(hash(tokenAberto))
                .filter(item -> item.getExpiraEm().isAfter(agora))
                .orElseThrow(() -> new DadosInvalidosException(
                        "Token de recuperação inválido ou expirado."));

        Usuario usuario = token.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        token.setUsadoEm(agora);
        usuarioRepository.save(usuario);
        tokenRepository.save(token);
    }

    private String hash(String valor) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(valor.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponível", ex);
        }
    }
}
