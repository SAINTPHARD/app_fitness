package com.appfitness.exception;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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
	 * Captura JSON malformado ou payload ilegível e responde com 400 claro,
	 * evitando que erros de parser virem 500 para o cliente.
	 */
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErroRespostaDTO> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.BAD_REQUEST.value(),
				"JSON inválido",
				List.of("Verifique o corpo da requisição e envie um JSON válido.")
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

	/**
	 * Captura tentativas de acessar/alterar um recurso que pertence a outro
	 * usuário (ex: refeição de outra conta) e responde com 403 Forbidden.
	 */
	@ExceptionHandler(AcessoNegadoException.class)
	public ResponseEntity<ErroRespostaDTO> handleAcessoNegado(AcessoNegadoException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.FORBIDDEN.value(),
				"Acesso negado",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erroResposta);
	}

	/**
	 * Captura tentativas de adicionar um Alimento duplicado (mesmo nome e
	 * quantidade) a uma Refeição e responde com 409 Conflict.
	 */
	@ExceptionHandler(AlimentoDuplicadoException.class)
	public ResponseEntity<ErroRespostaDTO> handleAlimentoDuplicado(AlimentoDuplicadoException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.CONFLICT.value(),
				"Alimento duplicado",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.CONFLICT).body(erroResposta);
	}

	/**
	 * Captura tentativas de adicionar um Exercício duplicado (mesmo nome) a
	 * uma ficha de Treino e responde com 409 Conflict.
	 */
	@ExceptionHandler(ExercicioDuplicadoException.class)
	public ResponseEntity<ErroRespostaDTO> handleExercicioDuplicado(ExercicioDuplicadoException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.CONFLICT.value(),
				"Exercício duplicado",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.CONFLICT).body(erroResposta);
	}

	/**
	 * Captura violações de regra de negócio de treino/série que não vêm de
	 * `@Valid` (ex: concluir série sem repetições). Responde com 400.
	 */
	@ExceptionHandler(DadosInvalidosException.class)
	public ResponseEntity<ErroRespostaDTO> handleDadosInvalidos(DadosInvalidosException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.BAD_REQUEST.value(),
				"Dados inválidos",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erroResposta);
	}

	/**
	 * Captura ações destrutivas que exigem confirmação explícita (ex:
	 * excluir uma Série já concluída). Responde com 409.
	 */
	@ExceptionHandler(ConfirmacaoNecessariaException.class)
	public ResponseEntity<ErroRespostaDTO> handleConfirmacaoNecessaria(ConfirmacaoNecessariaException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.CONFLICT.value(),
				"Confirmação necessária",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.CONFLICT).body(erroResposta);
	}

	/**
	 * Captura ausência/invalidez de autenticação (token JWT ausente ou
	 * `Authentication.getPrincipal()` que não é um `Usuario`) e responde com
	 * 401, em vez do 500 genérico que uma `RuntimeException` não tratada
	 * geraria.
	 */
	@ExceptionHandler(UsuarioNaoAutenticadoException.class)
	public ResponseEntity<ErroRespostaDTO> handleUsuarioNaoAutenticado(UsuarioNaoAutenticadoException ex) {
		ErroRespostaDTO erroResposta = new ErroRespostaDTO(
				LocalDateTime.now(),
				HttpStatus.UNAUTHORIZED.value(),
				"Usuário não autenticado",
				List.of(ex.getMessage())
		);

		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erroResposta);
	}
}
