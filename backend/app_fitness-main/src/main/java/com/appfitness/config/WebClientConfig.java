package com.appfitness.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Classe de configuração para o WebClient.
 * Responsável por fornecer a configuração necessária para: 
 * Criar instâncias do WebClient, que é usado para realizar chamadas HTTP de forma reativa
 * @configuration: Indica que esta classe contém definições de beans e configurações para o contexto da aplicação.
 */

@Configuration
public class WebClientConfig {

	@Bean
	public WebClient.Builder webClientBuilder() {
		return WebClient.builder();
	}
}
