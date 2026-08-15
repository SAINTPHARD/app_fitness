package com.appfitness.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.model.entity.AguaRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.AguaRegistroService;

import jakarta.validation.Valid;

/**
 * Controlador REST responsável por expor os endpoints de gerenciamento de hidratação (água).
 * Gerencia as requisições HTTP para listagem, criação, atualização e exclusão de registros de água.
 */
@RestController
@RequestMapping("/agua")
public class AguaRegistroController {

    private final AguaRegistroService service;

    /**
     * Construtor para injeção de dependências do serviço de água.
     * @param service : Serviço contendo as regras de negócio de hidratação.
     */
    public AguaRegistroController(AguaRegistroService service) {
        this.service = service;
    }

    /**
     * Lista todos os registros de água de um usuário para uma data específica.
     * @param data : Data de referência enviada via query param (ex: ?data=2026-06-06).
     * @param authentication : Objeto de segurança contendo o usuário logado via Token JWT.
     * @return Lista de registros de água do dia com status HTTP 200 (OK).
     */
    @GetMapping
    public ResponseEntity<List<AguaRegistro>> listarPorDia(
            @RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        List<AguaRegistro> registros = service.listarPorDia(usuario, data);
        return ResponseEntity.ok(registros);
    }

    /**
     * Cria um novo registro de consumo de água para o usuário autenticado.
     * @param registro : Dados do consumo enviados no corpo da requisição (validados pelo @Valid).
     * @param authentication : Objeto de segurança contendo o usuário logado.
     * @return O registro criado com status HTTP 201 (CREATED).
     */
    @PostMapping
    public ResponseEntity<AguaRegistro> criar(
            @Valid @RequestBody AguaRegistro registro,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        AguaRegistro salvo = service.criar(registro, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    /**
     * Atualiza um registro de água existente do usuário autenticado.
     * @param id : ID do registro passado na URL.
     * @param registro : Novos dados de atualização.
     * @param authentication : Objeto de segurança contendo o usuário logado.
     * @return O registro atualizado com status HTTP 200 (OK).
     */
    @PutMapping("/{id}")
    public ResponseEntity<AguaRegistro> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody AguaRegistro registro,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        AguaRegistro atualizado = service.atualizar(id, registro, usuario);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Deleta um registro de água específico do usuário autenticado.
     * @param id : ID do registro a ser removido.
     * @param authentication : Objeto de segurança contendo o usuário logado.
     * @return Status HTTP 204 (NO CONTENT) indicando sucesso sem corpo de resposta.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id, 
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        service.deletar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    /**
     * Método auxiliar privado para extrair com segurança a entidade Usuario 
     * a partir do contexto de autenticação do Spring Security.
     * @param authentication : Objeto de autenticação da requisição.
     * @return A entidade Usuario mapeada no token.
     */
    private Usuario extrairUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
            throw new RuntimeException("Usuário não autenticado ou token inválido.");
        }
        return (Usuario) authentication.getPrincipal();
    }
}