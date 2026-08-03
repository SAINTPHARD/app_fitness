package com.appfitness.dto.auth;

public record TokenDTO(String token, String refreshToken, String email) {
}
