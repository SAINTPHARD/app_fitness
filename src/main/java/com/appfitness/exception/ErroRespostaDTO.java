package com.appfitness.exception;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO padrão para respostas de erro comerciais na API.
 */
public class ErroRespostaDTO {
	
	private LocalDateTime timestamp;
	private int status;
	private String error;
	private List<String> mensagens;

	/**
	 * Construtor completo. 
	 * O primeiro parâmetro DEVE ser o LocalDateTime para casar com o seu Handler!
	 */
	public ErroRespostaDTO(LocalDateTime timestamp, int status, String error, List<String> mensagens) {
		this.timestamp = timestamp;
		this.status = status;
		this.error = error;
		this.mensagens = mensagens;
	}

	// Getters necessários para a serialização do Jackson em JSON
	public LocalDateTime getTimestamp() { return timestamp; }
	public int getStatus() { return status; }
	public String getError() { return error; }
	public List<String> getMensagens() { return mensagens; }
}