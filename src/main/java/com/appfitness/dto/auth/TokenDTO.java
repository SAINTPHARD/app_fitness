package com.appfitness.dto.auth;

public class TokenDTO {

    private String token;
    private String tipo = "Bearer";

    public TokenDTO() {
        this.tipo = "Bearer";
    }

    public TokenDTO(String token) {
        this.token = token;
        this.tipo = "Bearer";
    }

    public TokenDTO(String token, String tipo) {
        this.token = token;
        this.tipo = tipo == null ? "Bearer" : tipo;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}
