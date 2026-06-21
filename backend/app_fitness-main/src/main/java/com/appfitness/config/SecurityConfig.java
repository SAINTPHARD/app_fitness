package com.appfitness.config;

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

import com.appfitness.security.JwtAuthenticationEntryPoint;
import com.appfitness.security.SecurityFilter;

/**
 * Configuração central da cadeia de segurança do Spring Security.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	
	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			SecurityFilter securityFilter, // Injetado diretamente como parâmetro do Bean
			JwtAuthenticationEntryPoint authenticationEntryPoint // Injetado diretamente como parâmetro do Bean
			) throws Exception {
		
		return http
			// 1. Desabilita proteção CSRF
			.csrf(csrf -> csrf.disable())
			
			// 2. Define o EntryPoint customizado
			.exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
			
			// 3. Define a política de sessão como STATELESS
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			
			// 4. Regras de Autorização de Rotas
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers(HttpMethod.POST, "/auth/login", "/usuarios").permitAll()
				.requestMatchers("/error").permitAll()
				.anyRequest().authenticated()
			)
			
			// 5. Injeta o filtro customizado JWT antes do nativo do Spring
			.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
			
			.build();
	}

	/**
	 * Expõe o Bean do AuthenticationManager de forma isolada.
	 */
	@Bean
	public AuthenticationManager authenticationManager(
			AuthenticationConfiguration configuration
			) throws Exception {
		return configuration.getAuthenticationManager();
	}

	/**
	 * Mecanismo oficial de criptografia e hash de senhas.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}