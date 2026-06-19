package com.appfitness.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.dto.LoginDTO;
import com.appfitness.dto.TokenDTO;
import com.appfitness.model.entity.Usuario;
import com.appfitness.security.TokenService;

/**
 * Controlador REST responsável por gerenciar a autenticação dos usuários.
 * Expondo um endpoint POST /auth/login para receber as credenciais e devolver um Token JWT.
 * O processo de autenticação é o seguinte:
 * 1. O cliente envia um POST /auth/login com um JSON contendo "email" e "senha".
 * 2. O controlador tenta autenticar as credenciais usando o AuthenticationManager
 * 3. Se a autenticação for bem-sucedida, o TokenService gera um Token JWT assinado para o usuário autenticado.
 * 4. O controlador devolve um status 200 OK com o Token JWT dentro de um TokenDTO.
 * 5. Se a autenticação falhar (e-mail ou senha errados), o controlador captura a AuthenticationException e devolve um status 401 Unauthorized.
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

	// Dependências necessárias para autenticação e geração de token
	private final AuthenticationManager authenticationManager;
	private final TokenService tokenService;

	// Injeção de dependências obrigatórias via construtor
	public AuthController(AuthenticationManager authenticationManager, TokenService tokenService) {
		this.authenticationManager = authenticationManager;
		this.tokenService = tokenService;
	}

	/**
	 * Endpoint de login para autenticar usuários e gerar Token JWT.
	 * @param loginDTO Objeto contendo o e-mail e a senha enviados pelo cliente
	 * @return ResponseEntity com o Token JWT em caso de sucesso ou mensagem de erro em caso de falha
	 * 
	 * @Valid: Valida os campos do LoginDTO (e-mail e senha) antes de processar a requisição
	 */
	@PostMapping("/login")
	public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
		try {
			// 1. Envelopa o e-mail e a senha digitados em um token de credenciais do Spring
			var authToken = new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getSenha());
			
			// 2. O gerente de autenticação valida se a senha bate com o hash BCrypt do banco
			Authentication authentication = authenticationManager.authenticate(authToken);

			// 3. Em caso de sucesso, pega o Usuário autenticado que estava dentro do motor do Spring
			Usuario usuario = (Usuario) authentication.getPrincipal();
			
			// 4. Cria a String do Token JWT assinado especificamente para este usuário
			String token = tokenService.gerarToken(usuario);

			// 5. Devolve o status 200 OK com o Token gerado dentro do TokenDTO
			return ResponseEntity.ok(new TokenDTO(token));
			
		} catch (AuthenticationException ex) {
			// Se o e-mail ou a senha estiverem errados, cai aqui e devolve 401 Unauthorized
			return ResponseEntity.status(401).body("Credenciais inválidas");
		}
	}
}