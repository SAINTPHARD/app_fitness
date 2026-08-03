package com.appfitness.security;

import com.appfitness.model.entity.Usuario;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * Serviço responsável por gerar e validar tokens JWT.
 * Implementação simples usando com.auth0:java-jwt (já declarado no pom.xml).
 */
@Component	// Anotação para indicar que esta classe é um componente gerenciado pelo Spring.
public class TokenService {

    @Value("${jwt.secret:changeit}")
    private String secret;

    // Tempo de expiração (em ms). Ex.: 24h
    @Value("${jwt.expiration:86400000}")
    private long expirationMillis;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMillis;

    /**
     * Gera um token JWT com o e-mail do usuário no subject.
     */
    public String gerarToken(Usuario usuario) {
        return gerarToken(usuario, expirationMillis, "access");
    }

    public String gerarRefreshToken(Usuario usuario) {
        return gerarToken(usuario, refreshExpirationMillis, "refresh");
    }

    private String gerarToken(Usuario usuario, long duracaoMillis, String tipo) {
        Date now = new Date();
        Date expiresAt = new Date(now.getTime() + duracaoMillis);

   
        /**
         * Crie um algoritmo de assinatura HMAC usando a chave secreta definida na configuração.
         * Hash-based Message Authentication Code (Código de Autenticação de Mensagem Baseado em Hash)
         */
        Algorithm algorithm = Algorithm.HMAC256(secret);

        return JWT.create()
                .withSubject(usuario.getEmail())
                .withClaim("tipo", tipo)
                .withIssuedAt(now)
                .withExpiresAt(expiresAt)
                .sign(algorithm);
    }

    /**
     * Valida se o token é válido e não expirou.
     */
    public boolean isTokenValido(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            JWT.require(algorithm).build().verify(token);
            return true;
        } catch (JWTVerificationException ex) {
            return false;
        }
    }

    public boolean isRefreshTokenValido(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            DecodedJWT decoded = JWT.require(algorithm).build().verify(token);
            return "refresh".equals(decoded.getClaim("tipo").asString());
        } catch (JWTVerificationException ex) {
            return false;
        }
    }

    /**
     * Extrai o e-mail (subject) do token JWT.
     */
    public String getEmailFromToken(String token) {
        DecodedJWT decoded = JWT.decode(token);
        return decoded.getSubject();
    }
}
