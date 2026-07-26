package com.appfitness.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;

import jakarta.validation.Valid;

/**
 * Camada de serviço responsável pelas regras de negócio e atualização dos dados do usuário.
 */
@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // CREATE
    // =====================================================
    @Transactional
    public Usuario salvar(@Valid Usuario usuario) {
        String senhaOriginal = usuario.getSenha();
        // Criptografa a senha apenas se for enviada em texto puro (não hash BCrypt)
        if (senhaOriginal != null && !senhaOriginal.startsWith("$2a$") && !senhaOriginal.startsWith("$2b$") && !senhaOriginal.startsWith("$2y$")) {
            usuario.setSenha(passwordEncoder.encode(senhaOriginal));
        }
        return repository.save(usuario);
    }

    // =====================================================
    // READ ALL
    // =====================================================
    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    // =====================================================
    // READ BY ID
    // =====================================================
    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
    }

    // =====================================================
    // UPDATE (Com proteção contra sobrescrever valores com null)
    // =====================================================
    @Transactional
    public Usuario atualizar(Long id, Usuario dadosNovos) {
        Usuario usuarioExistente = buscarPorId(id);

        // Atualiza nome e e-mail apenas se informados (protege contra partial updates do onboarding)
        if (dadosNovos.getNome() != null && !dadosNovos.getNome().isBlank()) {
            usuarioExistente.setNome(dadosNovos.getNome());
        }
        if (dadosNovos.getEmail() != null && !dadosNovos.getEmail().isBlank()) {
            usuarioExistente.setEmail(dadosNovos.getEmail());
        }

        // Atualização de métricas corporais (peso, altura, objetivo, etc.)
        if (dadosNovos.getPeso() != null) {
            usuarioExistente.setPeso(dadosNovos.getPeso());
        }
        if (dadosNovos.getAltura() != null) {
            usuarioExistente.setAltura(dadosNovos.getAltura());
        }
        if (dadosNovos.getIdade() != null) {
            usuarioExistente.setIdade(dadosNovos.getIdade());
        }
        if (dadosNovos.getObjetivo() != null) {
            usuarioExistente.setObjetivo(dadosNovos.getObjetivo());
        }

        // Atualiza a senha se uma nova senha for fornecida
        if (dadosNovos.getSenha() != null && !dadosNovos.getSenha().isBlank()) {
            usuarioExistente.setSenha(passwordEncoder.encode(dadosNovos.getSenha()));
        }

        return repository.save(usuarioExistente);
    }

    // =====================================================
    // DELETE
    // =====================================================
    @Transactional
    public void deletar(Long id) {
        Usuario usuario = buscarPorId(id);
        repository.delete(usuario);
    }
}