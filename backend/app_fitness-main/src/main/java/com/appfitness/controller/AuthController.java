package com.appfitness.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.dto.auth.LoginDTO;
import com.appfitness.dto.auth.PasswordResetConfirmDTO;
import com.appfitness.dto.auth.PasswordResetRequestDTO;
import com.appfitness.dto.auth.RefreshTokenDTO;
import com.appfitness.dto.auth.TokenDTO;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;
import com.appfitness.security.TokenService;
import com.appfitness.service.PasswordResetService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Autenticação", 
	description = "Endpoints para autenticação, login e gerenciamento de tokens JWT.")
/**
 * Controller responsável pelos endpoints de autenticação e login da API.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final TokenService tokenService;
	private final UsuarioRepository usuarioRepository;
	private final PasswordResetService passwordResetService;

	// Injeção de dependência via construtor (Padrão Sênior)
	public AuthController(AuthenticationManager authenticationManager, TokenService tokenService,
			UsuarioRepository usuarioRepository, PasswordResetService passwordResetService) {
		this.authenticationManager = authenticationManager;
		this.tokenService = tokenService;
		this.usuarioRepository = usuarioRepository;
		this.passwordResetService = passwordResetService;
	}
	
	/**
	 * Redefine o endpoint de login para autenticar o usuário e retornar um token JWT válido.
	 */
	@Operation(
			summary = "Autentica o usuário e retorna o Token JWT.", 
			description = "Recebe e-mail e senha, valida as credenciais e retorna um token JWT válido para autenticação."
		)
		@ApiResponses(value = {
			@ApiResponse(
				responseCode = "200", 
				description = "Autenticação bem-sucedida, retorna o token JWT.",
				content = @Content(
					mediaType = "application/json", 
					schema = @Schema(implementation = TokenDTO.class)
				)
			),
			@ApiResponse(
				responseCode = "401", 
				description = "Credenciais inválidas, e-mail ou senha incorretos."
			)
		})

	/**
	 * Endpoint público para autenticar o usuário e retornar o Token JWT.
	 * Rota: POST http://localhost:8080/auth/login
	 */
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
		try {
			// Validação rápida de campos obrigatórios
			if (loginDTO.email() == null || loginDTO.password() == null) {
				throw new BadCredentialsException("E-mail e senha são obrigatórios.");
			}

			// Normaliza o e-mail (remove espaços e converte para minúsculas)
			String email = loginDTO.	email().trim().toLowerCase();
			
			// Cria o token de autenticação para o Spring Security validar
			var authToken = new UsernamePasswordAuthenticationToken(email, loginDTO.password());
			Authentication authentication = authenticationManager.authenticate(authToken);
			
			// Recupera o usuário autenticado a partir do Principal
			Usuario usuario = (Usuario) authentication.getPrincipal();
			
			// Gera o token JWT real
			String token = tokenService.gerarToken(usuario);
			String refreshToken = tokenService.gerarRefreshToken(usuario);

			// Retorna o DTO com o token gerado e o e-mail do usuário
			return ResponseEntity.ok(new TokenDTO(token, refreshToken, usuario.getEmail()));
			
		} catch (AuthenticationException ex) {
			// Tratamento seguro para falhas de credenciais (retorna 401 Unauthorized)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
					"message", "E-mail ou senha inválidos."
			));
		}
	}

	@PostMapping("/password/forgot")
	public ResponseEntity<Map<String, String>> solicitarRedefinicao(
			@Valid @RequestBody PasswordResetRequestDTO request) {
		passwordResetService.solicitar(request.email());
		return ResponseEntity.accepted().body(Map.of(
				"message", "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
		));
	}

	@PostMapping("/password/reset")
	public ResponseEntity<Map<String, String>> redefinirSenha(
			@Valid @RequestBody PasswordResetConfirmDTO request) {
		passwordResetService.redefinir(request.token(), request.novaSenha());
		return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
	}

	/**
	 * Endpoint público para renovar a sessão a partir de um refresh token válido.
	 * Rota: POST http://localhost:8080/auth/refresh
	 */
	@PostMapping("/refresh")
	public ResponseEntity<?> refresh(@RequestBody RefreshTokenDTO refreshTokenDTO) {
		String refreshToken = refreshTokenDTO.refreshToken();

		if (refreshToken == null || refreshToken.isBlank() || !tokenService.isRefreshTokenValido(refreshToken)) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
					"message", "Refresh token inválido ou expirado."
			));
		}

		String email = tokenService.getEmailFromToken(refreshToken);
		Usuario usuario = usuarioRepository.findByEmail(email);

		if (usuario == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
					"message", "Usuário do refresh token não encontrado."
			));
		}

		String novoToken = tokenService.gerarToken(usuario);
		String novoRefreshToken = tokenService.gerarRefreshToken(usuario);

		return ResponseEntity.ok(new TokenDTO(novoToken, novoRefreshToken, usuario.getEmail()));
	}
}
