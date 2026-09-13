package com.appfitness.dto.usuario;
import jakarta.validation.constraints.NotBlank;
public record ConfirmarExclusaoContaDTO(@NotBlank String senhaAtual, @NotBlank String confirmacao) {}
