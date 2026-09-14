package com.appfitness.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

/**
 * Classe de configuração para a documentação da API usando OpenAPI.
 * Responsável por fornecer informações sobre a API:
 * - Título, descrição, versão, contato e segurança JWT.
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "System Fitness API",
        version = "1.0.0",
        description = "Documentação da API REST do System Fitness - Gestão de treinos, dietas e rotina fitness.",
        contact = @Contact(
            name = "Robedson Saint Phard",
            email = "robedson.saint@gmail.com",
            url = "https://www.linkedin.com/in/robedson-saint-phard"
        )
    )
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Insira apenas o token JWT gerado no login."
)
public class OpenApiConfig {
}