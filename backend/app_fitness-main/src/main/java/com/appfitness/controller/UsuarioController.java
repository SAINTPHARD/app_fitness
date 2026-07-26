package com.appfitness.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.appfitness.model.entity.Usuario;
import com.appfitness.service.UsuarioService;

import jakarta.validation.Valid;

/**
 * Controlador REST para gerenciar usuários.
 * Responsável por expor os endpoints de cadastro, busca, atualização de perfil/métricas e exclusão.
 */
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Injeção de dependência explícita via construtor (Padrão Sênior)
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * 1. Criar usuário (Cadastro)
     * URL: POST http://localhost:8080/usuarios
     */
    @PostMapping
    public ResponseEntity<Usuario> criarUsuario(@Valid @RequestBody Usuario usuario) {
        Usuario novoUsuario = usuarioService.salvar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoUsuario);
    }

    /**
     * 2. Listar todos os usuários
     * URL: GET http://localhost:8080/usuarios
     */
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    /**
     * 3. Buscar usuário por ID
     * URL: GET http://localhost:8080/usuarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarUsuarioPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    /**
     * 3b. Buscar o usuário autenticado (a partir do token JWT)
     * URL: GET http://localhost:8080/usuarios/me
     */
    @GetMapping("/me")
    public ResponseEntity<Usuario> buscarUsuarioAutenticado(Authentication authentication) {
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(usuarioService.buscarPorId(usuarioLogado.getId()));
    }

    /**
     * 4b. Atualizar perfil/métricas do próprio usuário autenticado (Usado no Onboarding e Perfil)
     * URL: PUT http://localhost:8080/usuarios/me
     */
    @PutMapping("/me")
    public ResponseEntity<Usuario> atualizarUsuarioAutenticado(
            Authentication authentication, 
            @RequestBody Usuario usuarioData) {
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        Usuario usuarioAtualizado = usuarioService.atualizar(usuarioLogado.getId(), usuarioData);
        return ResponseEntity.ok(usuarioAtualizado);
    }

    /**
     * 4c. Endpoint explícito para atualizar métricas/onboarding do usuário logado
     * URL: PUT http://localhost:8080/usuarios/me/metricas
     */
    @PutMapping("/me/metricas")
    public ResponseEntity<Usuario> atualizarMetricasAutenticado(
            Authentication authentication, 
            @RequestBody Usuario metricas) {
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        Usuario usuarioAtualizado = usuarioService.atualizar(usuarioLogado.getId(), metricas);
        return ResponseEntity.ok(usuarioAtualizado);
    }

    /**
     * 4. Atualizar usuário por ID
     * URL: PUT http://localhost:8080/usuarios/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(
            @PathVariable Long id, 
            @RequestBody Usuario usuario) {
        return ResponseEntity.ok(usuarioService.atualizar(id, usuario));
    }

    /**
     * 5. Deletar usuário por ID
     * URL: DELETE http://localhost:8080/usuarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        usuarioService.deletar(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content
    }

    /**
     * Método utilitário privado para extrair com segurança a entidade Usuario do contexto de autenticação.
     */
    private Usuario extrairUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
            throw new RuntimeException("Usuário não autenticado ou token inválido.");
        }
        return (Usuario) authentication.getPrincipal();
    }
}