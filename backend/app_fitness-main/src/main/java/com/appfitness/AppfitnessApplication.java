package com.appfitness;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal da aplicação Appfitness, responsável por iniciar o contexto do Spring Boot.
 * <p>
 * A anotação {@code @SpringBootApplication} é uma conveniência que adiciona:
 * <ul>
 *     <li>{@code @Configuration}: Marca a classe como uma fonte de definições de bean para o contexto da aplicação.</li>
 *     <li>{@code @EnableAutoConfiguration}: Diz ao Spring Boot para começar a adicionar beans com base nas configurações do classpath, outros beans e várias propriedades.</li>
 *     <li>{@code @ComponentScan}: Diz ao Spring para procurar outros componentes, configurações e serviços no pacote 'com.appfitness', permitindo que ele encontre os controllers.</li>
 * </ul>
 */
@SpringBootApplication
public class AppfitnessApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppfitnessApplication.class, args);
	}
}
