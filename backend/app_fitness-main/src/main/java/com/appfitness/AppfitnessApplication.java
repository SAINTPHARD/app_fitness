package com.appfitness;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal da aplicação Appfitness, responsável por iniciar o contexto do Spring Boot 
 * Responsável : 
 * - Por configurar e inicializar todos os componentes necessários para a execução da aplicação.
 * - Permite que a aplicação seja executada como um aplicativo Spring Boot independente.
 */
@SpringBootApplication
public class AppfitnessApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppfitnessApplication.class, args);
	}
}