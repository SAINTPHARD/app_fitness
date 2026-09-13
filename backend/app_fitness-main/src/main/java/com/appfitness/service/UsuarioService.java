package com.appfitness.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.UsuarioRepository;
import com.appfitness.dto.usuario.MetasUsuarioDTO;
import com.appfitness.exception.AcessoNegadoException;

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

        if (dadosNovos.getNome() != null && !dadosNovos.getNome().isBlank()) {
            usuarioExistente.setNome(dadosNovos.getNome().trim());
        }

     // Atualização de métricas corporais (peso, altura, idade, sexo e objetivo)
        if (dadosNovos.getPeso() != null) {
            usuarioExistente.setPeso(dadosNovos.getPeso());
        }
        if (dadosNovos.getAltura() != null) {
            usuarioExistente.setAltura(dadosNovos.getAltura());
        }
        if (dadosNovos.getIdade() != null) {
            usuarioExistente.setIdade(dadosNovos.getIdade());
        }
        // Adicionado para garantir que o sexo preenchido no onboarding seja salvo
        if (dadosNovos.getSexo() != null) {
            usuarioExistente.setSexo(dadosNovos.getSexo());
        }
        if (dadosNovos.getObjetivo() != null) {
            usuarioExistente.setObjetivo(dadosNovos.getObjetivo());
        }
        // Senha nunca é alterada pelo endpoint genérico de perfil. Use
        // alterarSenha(), que exige reautenticação com a senha atual.

        return repository.save(usuarioExistente);
    }

    @Transactional(readOnly = true)
    public MetasUsuarioDTO buscarMetas(Long id) {
        return paraMetasDTO(buscarPorId(id));
    }

    @Transactional
    public MetasUsuarioDTO atualizarMetas(Long id, MetasUsuarioDTO metas) {
        Usuario usuario = buscarPorId(id);
        usuario.setMetaCalorias(metas.getCalorias());
        usuario.setMetaProteinas(metas.getProteinas());
        usuario.setMetaCarboidratos(metas.getCarboidratos());
        usuario.setMetaGorduras(metas.getGorduras());
        usuario.setMetaAguaMl(metas.getAguaMl());
        return paraMetasDTO(repository.save(usuario));
    }

    private MetasUsuarioDTO paraMetasDTO(Usuario usuario) {
        MetasUsuarioDTO dto = new MetasUsuarioDTO();
        dto.setCalorias(usuario.getMetaCalorias());
        dto.setProteinas(usuario.getMetaProteinas());
        dto.setCarboidratos(usuario.getMetaCarboidratos());
        dto.setGorduras(usuario.getMetaGorduras());
        dto.setAguaMl(usuario.getMetaAguaMl());
        return dto;
    }

    // =====================================================
    // DELETE
    // =====================================================
    @Transactional
    public void deletar(Long id) {
        Usuario usuario = buscarPorId(id);
        repository.delete(usuario);
    }

    @Transactional
    public void alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarPorId(id);
        validarSenhaAtual(usuario, senhaAtual);
        if (novaSenha == null || novaSenha.length() < 8 || novaSenha.length() > 72) {
            throw new IllegalArgumentException("A nova senha deve ter entre 8 e 72 caracteres.");
        }
        if (passwordEncoder.matches(novaSenha, usuario.getSenha())) {
            throw new IllegalArgumentException("A nova senha deve ser diferente da senha atual.");
        }
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        repository.save(usuario);
    }

    @Transactional
    public void excluirContaComConfirmacao(Long id, String senhaAtual, String confirmacao) {
        Usuario usuario = buscarPorId(id);
        validarSenhaAtual(usuario, senhaAtual);
        if (!"EXCLUIR MINHA CONTA".equals(confirmacao)) {
            throw new IllegalArgumentException("Digite EXCLUIR MINHA CONTA para confirmar.");
        }
        repository.delete(usuario);
    }

    private void validarSenhaAtual(Usuario usuario, String senhaAtual) {
        if (senhaAtual == null || !passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new AcessoNegadoException("Senha atual incorreta.");
        }
    }
}
