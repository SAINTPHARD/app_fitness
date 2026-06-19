package com.appfitness.security;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Classe responsável por interceptar tentativas de acesso não autorizado
 * às rotas protegidas da aplicação.
 *
 * Quando um usuário tenta acessar um endpoint protegido sem fornecer
 * um token JWT válido, o Spring Security redireciona a execução para
 * esta classe.
 *
 * Responsabilidades:
 * - Capturar falhas de autenticação.
 * - Registrar eventos de acesso negado.
 * - Retornar uma resposta JSON padronizada.
 * - Informar ao cliente que a autenticação falhou (HTTP 401).
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

	// Logger utilizado para registrar eventos de autenticação inválida
	private static final Logger logger =
			LoggerFactory.getLogger(JwtAuthenticationEntryPoint.class);

	// Responsável por converter objetos Java em JSON
	private final ObjectMapper mapper = new ObjectMapper();

	/**
	 * Método executado automaticamente pelo Spring Security quando
	 * ocorre uma falha de autenticação.
	 *
	 * Exemplos:
	 * - Token ausente
	 * - Token inválido
	 * - Token expirado
	 * - Usuário não autenticado
	 */
	@Override
	public void commence(
			HttpServletRequest request,
			HttpServletResponse response,
			AuthenticationException authException)

			throws IOException, ServletException {

		// =====================================================
		// 1. Registra o evento de acesso não autorizado
		// =====================================================

		logger.warn(
				"Acesso não autorizado na rota protegida: {}",
				authException.getMessage());

		// =====================================================
		// 2. Configura a resposta HTTP
		// =====================================================

		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json;charset=UTF-8");

		// =====================================================
		// 3. Monta o corpo da resposta em formato JSON
		// =====================================================

		Map<String, Object> body = new HashMap<>();

		body.put("timestamp", Instant.now().toString());
		body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
		body.put("error", "Unauthorized");
		body.put("message", authException.getMessage());
		body.put("path", request.getRequestURI());

		// =====================================================
		// 4. Converte o objeto para JSON e envia ao cliente
		// =====================================================

		mapper.writeValue(
				response.getOutputStream(),
				body);
	}
}