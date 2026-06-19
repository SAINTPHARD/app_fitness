package com.appfitness.service;

import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;

/**
 * =========================================================
 * USUARIO SERVICE
 * =========================================================
 * Camada responsável pelas regras de negócio relacionadas
 * aos usuários da aplicação.
 * @Service: Anotação para indicar que esta classe é um serviço gerenciado pelo Spring.
 */
@Service	
public class UsuarioService {

	private final UsuarioRepository repository;
	private final PasswordEncoder passwordEncoder;

	/**
	 * Injeção de dependências via construtor.
	 */
	public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
		this.repository = repository;
		this.passwordEncoder = passwordEncoder;
	}

	// =====================================================
	// CREATE
	// =====================================================
	public Usuario salvar(Usuario usuario) {
		String senhaOriginal = usuario.getSenha();
		String senhaCriptografada = passwordEncoder.encode(senhaOriginal);
		usuario.setSenha(senhaCriptografada);
		return repository.save(usuario);
	}

	// =====================================================
	// READ ALL
	// =====================================================
	/**
	 * Retorna todos os usuários cadastrados.
	 * CORREÇÃO: Adicionado o diamante genérico <Usuario> para evitar raw type warning.
	 */
	public List<Usuario> listarTodos() {
		return repository.findAll();
	}

	// =====================================================
	// READ BY ID
	// =====================================================
	public Usuario buscarPorId(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
	}

	// =====================================================
	// UPDATE
	// =====================================================
	public Usuario atualizar(Long id, Usuario usuarioAtualizado) {
		Usuario usuarioExistente = buscarPorId(id);

		usuarioExistente.setNome(usuarioAtualizado.getNome());
		usuarioExistente.setEmail(usuarioAtualizado.getEmail());
		usuarioExistente.setPeso(usuarioAtualizado.getPeso());
		usuarioExistente.setAltura(usuarioAtualizado.getAltura());
		usuarioExistente.setIdade(usuarioAtualizado.getIdade());
		usuarioExistente.setObjetivo(usuarioAtualizado.getObjetivo());

		return repository.save(usuarioExistente);
	}

	// =====================================================
	// DELETE
	// =====================================================
	public void deletar(Long id) {
		Usuario usuario = buscarPorId(id);
		repository.delete(usuario);
	}
}