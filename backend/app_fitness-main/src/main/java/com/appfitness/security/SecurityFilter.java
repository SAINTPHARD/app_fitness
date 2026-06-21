package com.appfitness.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Filtro de segurança responsável por interceptar todas as requisições HTTP.
 *
 * Funções principais:
 * - Verificar se existe um token JWT no cabeçalho Authorization.
 * - Validar o token recebido.
 * - Identificar o usuário associado ao token.
 * - Autenticar o usuário no contexto do Spring Security.
 *
 * Este filtro é executado uma única vez por requisição
 * por herdar de OncePerRequestFilter.
 */
@Component
public class SecurityFilter extends OncePerRequestFilter {

	// Logger utilizado para registrar erros e eventos de autenticação
	private static final Logger logger =
			LoggerFactory.getLogger(SecurityFilter.class);

	// Serviço responsável por validar e decodificar o JWT
	private final TokenService tokenService;

	// Repositório para buscar usuários no banco de dados
	private final UsuarioRepository usuarioRepository;

	/**
	 * Injeção de dependências via construtor.
	 */
	public SecurityFilter(TokenService tokenService,
						  UsuarioRepository usuarioRepository) {

		this.tokenService = tokenService;
		this.usuarioRepository = usuarioRepository;
	}

	/**
	 * Método executado a cada requisição HTTP.
	 * @HttpServletRequest request, Objeto que representa a requisição HTTP recebida.
	 * @HttpServletResponse response, Objeto que representa a resposta HTTP a ser enviada.
	 * @FilterChain filterChain, Objeto que permite continuar o processamento da requisição após
	 * este filtro concluir sua lógica de autenticação.
	 */
	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain)

			throws ServletException, IOException {

		try {

			// =====================================================
			// 1. Obtém o cabeçalho Authorization
			// =====================================================

			String authorizationHeader =
					request.getHeader("Authorization");

			// =====================================================
			// 2. Verifica se existe um token Bearer
			// =====================================================

			if (authorizationHeader != null
					&& authorizationHeader.startsWith("Bearer ")) {

				// Remove o prefixo "Bearer "
				String token =
						authorizationHeader.substring(7);

				// =====================================================
				// 3. Valida o token JWT
				// =====================================================

				if (tokenService.isTokenValido(token)) {

					// Extrai o e-mail do usuário armazenado no token
					String email =
							tokenService.getEmailFromToken(token);

					// Busca o usuário no banco de dados
					Usuario usuario =
							usuarioRepository.findByEmail(email);

					// =====================================================
					// 4. Autentica o usuário no contexto do Spring Security
					// =====================================================

					if (usuario != null) {

						var authentication =
								new UsernamePasswordAuthenticationToken(
										usuario,
										null,
										usuario.getAuthorities());

						authentication.setDetails(
								new WebAuthenticationDetailsSource()
										.buildDetails(request));

						SecurityContextHolder
								.getContext()
								.setAuthentication(authentication);
					}
				}
			}

		} catch (Exception ex) {

			logger.error(
					"Falha ao autenticar usuário através do token JWT",
					ex);
		}

		// Continua o fluxo normal da requisição
		filterChain.doFilter(request, response);
	}
}