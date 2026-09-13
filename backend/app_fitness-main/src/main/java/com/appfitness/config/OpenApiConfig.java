package com.appfitness.config;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

    public static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI systemFitnessOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("System Fitness API")
                        .version("v1")
                        .description("API REST para gestão de usuários, nutrição, hidratação, treinos e evolução física.")
                        .contact(new Contact()
                                .name("Robedson Saint Phard")
                                .url("https://github.com/SAINTPHARD/app_fitness")))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Informe apenas o access token JWT. O prefixo Bearer é aplicado pelo Swagger UI.")));
    }

    /**
     * Marca automaticamente como protegidos os endpoints que exigem JWT na
     * configuração do Spring Security, mantendo os endpoints públicos sem cadeado.
     */
    @Bean
    public OpenApiCustomizer jwtSecurityCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }

            openApi.getPaths().forEach((path, pathItem) ->
                    pathItem.readOperationsMap().forEach((method, operation) -> {
                        if (!isPublicEndpoint(path, method.name())) {
                            operation.addSecurityItem(
                                    new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
                        }
                    }));
        };
    }

    private boolean isPublicEndpoint(String path, String method) {
        if (!"POST".equals(method)) {
            return false;
        }

        return path.equals("/auth/login")
                || path.equals("/auth/refresh")
                || path.equals("/auth/password/forgot")
                || path.equals("/auth/password/reset")
                || path.equals("/login")
                || path.equals("/usuarios");
    }
}
