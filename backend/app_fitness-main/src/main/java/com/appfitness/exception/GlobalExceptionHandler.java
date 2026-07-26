package com.appfitness.exception;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Classe de tratamento global de exceções para a aplicação.
 * Utiliza a anotação @RestControllerAdvice para interceptar exceções lançadas pelos controladores REST e retornar respostas de erro padronizadas.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	/**
	 * Captura e trata excepções de validação de arguments (@Valid) nos DTOs de entrada.
	 * Retorna um status 400 Bad Request com um corpo contendo detalhes sobre os erros de validação.
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErroRespostaDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {
		// 1. Extrai os erros de validação e formata as mensagens incluindo o nome do campo falho
		List<String> errors = ex.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.collect(Collectors.toList());

		// 2. Cria a estrutura padrão de resposta de erro comercial
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(), // Garanta que o construtor do seu ErroRespostaDTO receba o LocalDateTime aqui
				HttpStatus.BAD_REQUEST.value(),
				"Erro de validação",
				errors
		);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erroResposta);
	}

	/**
	 * Captura buscas por ID que não encontraram nada (Refeição, Alimento, etc.)
	 * e responde com 404 Not Found, em vez do 500 genérico que uma
	 * RuntimeException não tratada geraria.
	 */
	@ExceptionHandler(RecursoNaoEncontradoException.class)
	public ResponseEntity<ErroRespostaDTO> handleRecursoNaoEncontrado(RecursoNaoEncontradoException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.NOT_FOUND.value(),
				"Recurso não encontrado",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erroResposta);
	}
}