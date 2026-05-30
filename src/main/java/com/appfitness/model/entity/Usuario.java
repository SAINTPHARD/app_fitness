package com.appfitness.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import model.enums.Objetivo;

/**
 * Classe que representa o usuario do sistema de fitness. Esta classe pode conter atributos como nome, email, senha, idade, peso, altura, entre outros dados relevantes para o perfil do usuário. Além disso, pode incluir métodos para acessar e modificar esses atributos, bem como funcionalidades relacionadas ao gerenciamento do perfil do usuário, como autenticação e atualização de informações pessoais.
 * 
 * Aqui tem :
 * - cálculo de dieta
 * - definição de treino
 * - acompanhamento físico
 */

@Entity							// Diz que esta classe é uma entidade JPA, ou seja, que será mapeada para uma tabela no banco de dados.
@Table(name = "usuarios")		// Especifi entidade irá mapear. Neste caso, a tabela será chamada "usuarios".
//@Data							// Gera automaticamente os métodos getters, setters, toString, equals e hashCode para os campos da classe.
//@NoArgsConstructor			// Gera um construtor sem argumentos.
//@AllArgsConstructor			// Gera um construtor com argumentos para todos os campos da classe.
//@Builder						// Fornece um padrão de construção para criar objetos de forma fluente.
public class Usuario {
	
	@Id							// Especifica que o campo id é a chave primária da entidade.
	@GeneratedValue(strategy = GenerationType.IDENTITY)	// Especifica que o valor do campo id será gerado automaticamente pelo banco de dados, usando a estratégia de identidade.
	private Long id;			// Identificador único do usuário.
	private String nome;		// Nome do usuário.
	
	@Column(unique = true)		// Especifica que o campo email deve ser único no banco de dados, ou seja, não pode haver dois usuários com o mesmo email.
	private String email;
	
	private String senha;
	private int idade;
	private double peso;
	private double altura; // Recomendado salvar em CM (ex: 175.0)
	
	/**
	 * Sexo: 'M' ou 'F'. 
	 * Essencial para os cálculos de TMB na CalculoService.
	 */
	private char sexo; 
	
	@Enumerated(EnumType.STRING)
	private Objetivo objetivo;

	// --- CONSTRUTORES ---

	public Usuario() {
	}

	public Usuario(Long id, String nome, String email, String senha, int idade, double peso, double altura, char sexo, Objetivo objetivo) {
		this.id = id;
		this.nome = nome;
		this.email = email;
		this.senha = senha;
		this.idade = idade;
		this.peso = peso;
		this.altura = altura;
		this.sexo = sexo;
		this.objetivo = objetivo;
	}

	// --- GETTERS E SETTERS ---

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSenha() {
		return senha;
	}

	public void setSenha(String senha) {
		this.senha = senha;
	}

	public int getIdade() {
		return idade;
	}

	public void setIdade(int idade) {
		this.idade = idade;
	}

	public double getPeso() {
		return peso;
	}

	public void setPeso(double peso) {
		this.peso = peso;
	}

	public double getAltura() {
		return altura;
	}

	public void setAltura(double altura) {
		this.altura = altura;
	}

	public char getSexo() {
		return sexo;
	}

	public void setSexo(char sexo) {
		this.sexo = sexo;
	}

	public Objetivo getObjetivo() {
		return objetivo;
	}

	public void setObjetivo(Objetivo objetivo) {
		this.objetivo = objetivo;
	}
}