package com.appfitness.model.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import com.appfitness.model.enums.Objetivo;

/**
 * Classe de entidade para representar um Usuário no sistema.
 * Implementa UserDetails para integração com Spring Security.
 * @Entity indica que esta classe é uma entidade JPA, mapeada para a tabela "usuarios".
 * @Table(name = "usuarios") especifica o nome da tabela no banco de dados.
 */
@Entity
@Table(name = "usuarios")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Usuario implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nome;

	@Column(unique = true, nullable = false)
	private String email;

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Column(nullable = false)
	private String senha;

	private Integer idade;
	private Double peso;
	private Double altura;
	private Character sexo;
	private Integer metaCalorias;
	private Integer metaProteinas;
	private Integer metaCarboidratos;
	private Integer metaGorduras;
	private Integer metaAguaMl;

	@Enumerated(EnumType.STRING)
	private Objetivo objetivo;

	@JsonIgnore
	@OneToMany(mappedBy = "usuario")
	private List<Dieta> dietas;

	@JsonIgnore
	@OneToMany(mappedBy = "usuario")
	private List<Treino> treinos;

	// --- CONSTRUTORES ---

	public Usuario() {
	}

	public Usuario(Long id, String nome, String email, String senha, Integer idade, Double peso, Double altura, Character sexo, Objetivo objetivo) {
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

	// --- MÉTODOS OBRIGATÓRIOS DO USERDETAILS (SPRING SECURITY) ---

	@Override
	@JsonIgnore
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_USER"));
	}

	@Override
	@JsonIgnore
	public String getPassword() {
		return this.senha;
	}

	@Override
	@JsonIgnore
	public String getUsername() {
		return this.email;
	}

	@Override
	@JsonIgnore
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	@JsonIgnore
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	@JsonIgnore
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	@JsonIgnore
	public boolean isEnabled() {
		return true;
	}

	// --- GETTERS E SETTERS (COM NULL-SAFETY) ---

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

	// 🚀 CORREÇÕES AQUI: Previne NullPointerException nos cálculos
	public Integer getIdade() {
		return (idade != null) ? idade : 25; // 25 anos por padrão
	}

	public void setIdade(Integer idade) {
		this.idade = idade;
	}

	public Double getPeso() {
		return (peso != null) ? peso : 70.0; // 70 kg por padrão
	}

	public void setPeso(Double peso) {
		this.peso = peso;
	}

	public Double getAltura() {
		return (altura != null) ? altura : 170.0; // 170 cm por padrão
	}

	public void setAltura(Double altura) {
		this.altura = altura;
	}

	public Character getSexo() {
		return (sexo != null) ? sexo : 'M'; // 'M' por padrão
	}

	public void setSexo(Character sexo) {
		this.sexo = sexo;
	}

	public Integer getMetaCalorias() {
		return metaCalorias;
	}

	public void setMetaCalorias(Integer metaCalorias) {
		this.metaCalorias = metaCalorias;
	}

	public Integer getMetaProteinas() {
		return metaProteinas;
	}

	public void setMetaProteinas(Integer metaProteinas) {
		this.metaProteinas = metaProteinas;
	}

	public Integer getMetaCarboidratos() {
		return metaCarboidratos;
	}

	public void setMetaCarboidratos(Integer metaCarboidratos) {
		this.metaCarboidratos = metaCarboidratos;
	}

	public Integer getMetaGorduras() {
		return metaGorduras;
	}

	public void setMetaGorduras(Integer metaGorduras) {
		this.metaGorduras = metaGorduras;
	}

	public Integer getMetaAguaMl() {
		return metaAguaMl;
	}

	public void setMetaAguaMl(Integer metaAguaMl) {
		this.metaAguaMl = metaAguaMl;
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
