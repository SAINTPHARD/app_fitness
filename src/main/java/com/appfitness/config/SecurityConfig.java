package com.appfitness.config;

import org.springframework.beans.factory.annotation.Autowired;
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
 * Responsável por gerenciar permissões de rotas, política de sessão stateless
 * e registro de interceptadores (Filtros JWT).
 */
@Configuration	// Anotação para indicar que esta classe é uma configuração de Spring security
@EnableWebSecurity
public class SecurityConfig {

	private final SecurityFilter securityFilter;
	private final JwtAuthenticationEntryPoint authenticationEntryPoint;

	@Autowired
	public SecurityConfig(SecurityFilter securityFilter, JwtAuthenticationEntryPoint authenticationEntryPoint) {
		this.securityFilter = securityFilter;
		this.authenticationEntryPoint = authenticationEntryPoint;
	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
			// 1. Desabilita proteção CSRF (Desnecessária em APIs Stateless com JWT)
			.csrf(csrf -> csrf.disable())
			
			// 2. Define o EntryPoint customizado para capturar e tratar erros de autenticação (401)
			.exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
			
			// 3. Define a política de sessão como STATELESS (Sem estado armazenado na memória do servidor)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			
			// 4. Regras de Autorização e Proteção de Rotas
			.authorizeHttpRequests(authorize -> authorize
				// Rotas públicas: Cadastro de usuários e login não exigem Token
				.requestMatchers(HttpMethod.POST, "/auth/login", "/usuarios").permitAll()
				// Qualquer outra rota (exercicios, treinos, dietas) exige autenticaçãos
				.anyRequest().authenticated()
			)
			
			// 5. Injeta o nosso filtro customizado de validação JWT antes do filtro nativo do Spring
			.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
			
			.build();
	}

	/**
	 * Expõe o Bean do AuthenticationManager para que os controllers possam processar logins programaticamente.
	 */
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	/**
	 * Define o BCryptPasswordEncoder como o mecanismo oficial de criptografia e hash de senhas.
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}