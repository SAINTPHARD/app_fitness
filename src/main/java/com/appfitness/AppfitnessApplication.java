package com.appfitness;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
/**
 * Clase principal de la aplicación Appfitness, que inicia el contexto de Spring Boot.
 * Esta clase contiene el método main que se ejecuta al iniciar la aplicación.
 * Anotada con @SpringBootApplication, que es una combinación de @Configuration, @
 * @SpringBootApplication -> definir as configurações de inicialização, escaneamento de componentes e configuração automática.
 * @EnableAutoConfiguration -> habilitar a configuração automática do Spring Boot com base nas dependências presentes no classpath.
 * @ComponentScan -> habilitar o escaneamento de componentes para detectar e registrar beans no
 */
@SpringBootApplication
public class AppfitnessApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppfitnessApplication.class, args);
	}
}
