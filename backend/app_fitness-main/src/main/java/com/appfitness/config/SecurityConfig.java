package com.appfitness.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.appfitness.security.JwtAuthenticationEntryPoint;
import com.appfitness.security.SecurityFilter;

/**
 * Classe de Configuração Central do Spring Security.
 * O Spring lê esta classe ao iniciar para desenhar os portões de segurança da API.
 */
@Configuration
@EnableWebSecurity // Ativa a segurança web customizada do Spring nesta aplicação
public class SecurityConfig {

	/**
	 * Configura a corrente de filtros de segurança (Security Filter Chain).
	 * Cada requisição HTTP passa por este método para validação de regras.
	 */
	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			SecurityFilter securityFilter, // Filtro customizado que captura e valida o Token JWT
			JwtAuthenticationEntryPoint authenticationEntryPoint // Trata requisições não autorizadas (Erro 401)
			) throws Exception {
		
		return http
			// 1. Desabilita a proteção CSRF, pois a autenticação via JWT é imune a ataques de sessão baseados em cookies
			.csrf(csrf -> csrf.disable())
			
			// 2. Aponta o gerenciador de exceções para o nosso EntryPoint customizado (captura falhas de login)
			.exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
			
			// 3. Define o modelo de sessão como STATELESS (Sem Estado). A API não guarda sessões no servidor; cada requisição exige o token
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			
			// 4. Configuração das regras de acesso aos Endpoints (Portões de entrada da API)
			.authorizeHttpRequests(authorize -> authorize
				// CORREÇÃO CRUCIAL PARA CORS NO DOCKER: Libera todas as requisições de pré-voo (OPTIONS) do navegador
				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				
				.requestMatchers("/h2-console/**").permitAll() // Permite acesso ao console H2 para testes
				// Permite acesso público total para criar usuários e fazer login
				.requestMatchers(HttpMethod.POST, "/auth/login", "/usuarios").permitAll()
				// Permite que o Spring trate erros internos sem travar o tráfego do Docker
				.requestMatchers("/error").permitAll()
				// Qualquer outra rota do sistema exige que o atleta esteja autenticado
				.anyRequest().authenticated()
			)
			
			// 5. Acopla as regras do CORS para que o servidor Nginx do Frontend (porta 80) consiga conversar com a API (porta 8080)
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			
			// 6. Coloca o nosso filtro de validação JWT ANTES do filtro padrão de usuário e senha do Spring
			.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
			
			// Compila a cadeia de segurança configurada acima
			.build();
	}

	/**
	 * Configuração de CORS (Cross-Origin Resource Sharing).
	 * Define quais domínios externos e métodos podem consumir esta API de forma segura.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		
		// Permite requisições vindas do endereço padrão onde o Docker roda o Frontend
		configuration.setAllowedOrigins(List.of("http://localhost", "http://localhost:80", "http://127.0.0.1", "http://127.0.0.1:80"));
		// Métodos HTTP permitidos para as operações do sistema Fitness
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		// Cabeçalhos HTTP aceitos nas requisições (crucial para enviar o "Authorization: Bearer <TOKEN>")
		configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
		// Permite o envio de cookies e credenciais de autenticação cross-origin
		configuration.setAllowCredentials(true);
		// Tempo de cache (1 hora) para as requisições de pré-voo (Preflight Options)
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		// Aplica as regras de CORS acima para todos os endpoints da API (/**)
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	/**
	 * Expõe o Bean do PasswordEncoder para o Spring.
	 * Utiliza o algoritmo BCrypt para gerar hashes altamente seguros para as senhas dos atletas.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Expõe o Bean do AuthenticationManager exigido na camada de Controller.
	 * É o motor responsável por disparar o processo interno de autenticação no login.
	 */
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		// Captura o gerenciador padrão estruturado pelo ecossistema do Spring Security
		return configuration.getAuthenticationManager();
	}
}