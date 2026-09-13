package com.appfitness.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.appfitness.model.entity.PasswordResetToken;
import com.appfitness.model.entity.Usuario;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHashAndUsadoEmIsNull(String tokenHash);
    Optional<PasswordResetToken> findFirstByUsuarioOrderByCriadoEmDesc(Usuario usuario);
    void deleteByExpiraEmBefore(LocalDateTime limite);
}
