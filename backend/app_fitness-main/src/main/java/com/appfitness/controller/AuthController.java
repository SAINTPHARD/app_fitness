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
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Login, renovação de sessão e recuperação de senha")
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final TokenService tokenService;
	private final UsuarioRepository usuarioRepository;
	private final PasswordResetService passwordResetService;

	public AuthController(AuthenticationManager authenticationManager, TokenService tokenService,
			UsuarioRepository usuarioRepository, PasswordResetService passwordResetService) {
		this.authenticationManager = authenticationManager;
		this.tokenService = tokenService;
		this.usuarioRepository = usuarioRepository;
		this.passwordResetService = passwordResetService;
	}

	@PostMapping("/login")
	@Operation(summary = "Autenticar usuário", description = "Valida e-mail e senha e retorna access token e refresh token JWT.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Autenticação realizada com sucesso"),
			@ApiResponse(responseCode = "401", description = "Credenciais inválidas")
	})
	public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
		try {
			if (loginDTO.email() == null || loginDTO.password() == null) {
				throw new BadCredentialsException("E-mail e senha são obrigatórios.");
			}

			String email = loginDTO.email().trim().toLowerCase();
			var authToken = new UsernamePasswordAuthenticationToken(email, loginDTO.password());
			Authentication authentication = authenticationManager.authenticate(authToken);
			Usuario usuario = (Usuario) authentication.getPrincipal();

			String token = tokenService.gerarToken(usuario);
			String refreshToken = tokenService.gerarRefreshToken(usuario);

			return ResponseEntity.ok(new TokenDTO(token, refreshToken, usuario.getEmail()));
		} catch (AuthenticationException ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
					"message", "E-mail ou senha inválidos."
			));
		}
	}

	@PostMapping("/password/forgot")
	@Operation(summary = "Solicitar redefinição de senha", description = "Inicia o fluxo de recuperação sem revelar se o e-mail está cadastrado.")
	@ApiResponse(responseCode = "202", description = "Solicitação recebida")
	public ResponseEntity<Map<String, String>> solicitarRedefinicao(
			@Valid @RequestBody PasswordResetRequestDTO request) {
		passwordResetService.solicitar(request.email());
		return ResponseEntity.accepted().body(Map.of(
				"message", "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação."
		));
	}

	@PostMapping("/password/reset")
	@Operation(summary = "Redefinir senha", description = "Define uma nova senha utilizando um token de recuperação válido.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Senha redefinida com sucesso"),
			@ApiResponse(responseCode = "400", description = "Token inválido, expirado ou dados inválidos")
	})
	public ResponseEntity<Map<String, String>> redefinirSenha(
			@Valid @RequestBody PasswordResetConfirmDTO request) {
		passwordResetService.redefinir(request.token(), request.novaSenha());
		return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
	}

	@PostMapping("/refresh")
	@Operation(summary = "Renovar sessão", description = "Troca um refresh token válido por um novo par de tokens JWT.")
	@ApiResponses({
			@ApiResponse(responseCode = "200", description = "Tokens renovados com sucesso"),
			@ApiResponse(responseCode = "401", description = "Refresh token inválido ou expirado")
	})
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
