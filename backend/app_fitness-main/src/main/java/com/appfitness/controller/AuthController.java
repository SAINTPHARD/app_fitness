package com.appfitness.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.dto.auth.LoginDTO;
import com.appfitness.dto.auth.TokenDTO;
import com.appfitness.model.entity.Usuario;
import com.appfitness.security.TokenService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://127.0.0.1:5173" })
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final TokenService tokenService;

	public AuthController(AuthenticationManager authenticationManager, TokenService tokenService) {
		this.authenticationManager = authenticationManager;
		this.tokenService = tokenService;
	}

	@PostMapping("/login")
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

			return ResponseEntity.ok(new TokenDTO(token, usuario.getEmail()));
		} catch (AuthenticationException ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
					"message", "E-mail ou senha inválidos. Confira os dados cadastrados no banco."
			));
		}
	}
}
