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
 * Configuração central de segurança da API utilizando Spring Security.
 * O login e o cadastro são públicos, as demais rotas exigem validação via Token JWT.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			SecurityFilter securityFilter,
			JwtAuthenticationEntryPoint authenticationEntryPoint
			) throws Exception {
		
		return http
			// 1. Ativa a configuração de CORS definida no método abaixo
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))
			
			// 2. Desabilita o CSRF (proteção baseada em cookies) já que a API é Stateless (JWT)
			.csrf(csrf -> csrf.disable())
			
			// 3. Trata erros de autenticação disparando o EntryPoint personalizado
			.exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint))
			
			// 4. Define a política de sessão como STATELESS (sem estado no servidor)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			
			// 5. Gerenciamento de permissões de rotas (Mapeamento de Endpoints)
			.authorizeHttpRequests(authorize -> authorize
				// Permite requisições de checagem prévia (Preflight OPTIONS) para evitar erros de CORS no front
				.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
				
				// Rota pública para Autenticação do Atleta (Evita o erro 403 Forbidden no Login)
				.requestMatchers(HttpMethod.POST, "/auth/login").permitAll()

				// Rota pública para renovar access tokens usando refresh token
				.requestMatchers(HttpMethod.POST, "/auth/refresh").permitAll()
				
				// Rota pública para Autenticação alternativa (Caso use mapeamento direto sem o prefixo)
				.requestMatchers(HttpMethod.POST, "/login").permitAll()
				
				// Rota pública para permitir novos cadastros de usuários
				.requestMatchers(HttpMethod.POST, "/usuarios").permitAll()
				
				// Rota pública para o tratamento interno de erros do Spring Boot
				.requestMatchers("/error").permitAll()
				
				// Qualquer outra requisição do sistema exige autenticação por Token JWT
				.anyRequest().authenticated()
			)
			
			// 6. Injeta o filtro de segurança customizado (SecurityFilter) antes do filtro padrão de usuário e senha
			.addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
			.build();
	}

	/**
	 * Configuração de CORS (Cross-Origin Resource Sharing).
	 * Permite que o frontend React rodando no Vite acesse os endpoints desta API.
	 */
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// Libera explicitamente as URLs locais usadas pelo seu React no VS Code.
		// Inclui 5174/5175 como rede de segurança: o Vite cai nessas portas
		// quando 5173 já está ocupada (ex: dois terminais rodando "npm run dev"
		// ao mesmo tempo, ou um deles iniciado com "--port 5174" explícito,
		// que ignora o "strictPort" do vite.config.js) — sem isso, o navegador
		// bloqueia a chamada por CORS e o Axios reporta um "Network Error"
		// genérico, mesmo com o backend saudável e o token JWT correto.
		configuration.setAllowedOrigins(List.of(
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"http://localhost:5174",
				"http://127.0.0.1:5174",
				"http://localhost:5175",
				"http://127.0.0.1:5175"
		));
		
		// Métodos HTTP permitidos para o ecossistema full-stack
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		
		// Cabeçalhos aceitos na requisição do Axios
		configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));
		
		// Expõe o cabeçalho Authorization para que o frontend consiga ler o Token JWT retornado
		configuration.setExposedHeaders(List.of("Authorization"));
		
		// Permite envio de credenciais (cookies, headers de autenticação)
		configuration.setAllowCredentials(true);
		
		// Tempo de cache para a resposta de preflight (1 hora)
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	/**
	 * Criptografia e validação de senhas.
	 * Suporta comparação adaptativa de hashes BCrypt e texto plano (para dados legados de teste).
	 */
	@Bean
	public PasswordEncoder passwordEncoder() {
		BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

		return new PasswordEncoder() {
			@Override
			public String encode(CharSequence rawPassword) {
				// Criptografa a senha plana gerando o hash BCrypt padrão
				return bcrypt.encode(rawPassword);
			}

			@Override
			public boolean matches(CharSequence rawPassword, String encodedPassword) {
				// Proteção contra nulos na checagem
				if (encodedPassword == null || rawPassword == null) {
					return false;
				}

				// Produção: apenas comparação segura via BCrypt. Removido o fallback de
				// texto puro — toda senha em base deve estar com hash BCrypt antes do deploy.
				return bcrypt.matches(rawPassword, encodedPassword);
			}
		};
	}

	/**
	 * Gerenciador de Autenticação padrão utilizado pelo Spring Security para processar o login.
	 */
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}
}
