package com.appfitness.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PasswordResetConfirmDTO(
    @NotBlank(message = "Token de recuperação obrigatório.")
    String token,
    @NotBlank(message = "Informe a nova senha.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$", message = "A senha deve ter ao menos 8 caracteres, uma letra e um número.")
    String novaSenha
) {}
