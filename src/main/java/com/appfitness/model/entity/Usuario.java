package com.appfitness.model.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import model.enums.Objetivo;

@Entity					// Indica que esta classe é uma entidade JPA, ou seja, que será mapeada para uma tabela no banco de dados.
@Table(name = "usuarios")// Nome da tabela no banco de dados que esta entidade irá mapear. Neste caso, a tabela será chamada "usuarios".
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nome;

	@Column(unique = true)
	private String email;

	private String senha;

	// ALTERADO: wrappers para evitar erro de desserialização
	private Integer idade;

	private Double peso;

	private Double altura;

	private Character sexo;

	@Enumerated(EnumType.STRING)
	private Objetivo objetivo;

	// --- CONSTRUTORES ---

	public Usuario() {
	}

	/**
	 * Relacionamento entre Usuario, Dieta | Usuario e Treino:
	 * - Um usuário pode ter várias dietas associadas a ele (OneToMany).
	 * - Um usuário pode ter várias rotinas de treino associadas a ele (OneToMany).
	 */
	@JsonIgnore
	@OneToMany(mappedBy = "usuario")
	private List<Dieta> dietas;

	@JsonIgnore
	@OneToMany(mappedBy = "usuario")
	private List<Treino> treinos;

	public Usuario(Long id,
				   String nome,
				   String email,
				   String senha,
				   Integer idade,
				   Double peso,
				   Double altura,
				   Character sexo,
				   Objetivo objetivo) {

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

	public Integer getIdade() {
		return idade;
	}

	public void setIdade(Integer idade) {
		this.idade = idade;
	}

	public Double getPeso() {
		return peso;
	}

	public void setPeso(Double peso) {
		this.peso = peso;
	}

	public Double getAltura() {
		return altura;
	}

	public void setAltura(Double altura) {
		this.altura = altura;
	}

	public Character getSexo() {
		return sexo;
	}

	public void setSexo(Character sexo) {
		this.sexo = sexo;
	}

	public Objetivo getObjetivo() {
		return objetivo;
	}

	public void setObjetivo(Objetivo objetivo) {
		this.objetivo = objetivo;
	}

	public List<Dieta> getDietas() {
		return dietas;
	}

	public void setDietas(List<Dieta> dietas) {
		this.dietas = dietas;
	}

	public List<Treino> getTreinos() {
		return treinos;
	}

	public void setTreinos(List<Treino> treinos) {
		this.treinos = treinos;
	}
}