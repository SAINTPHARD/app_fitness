package com.appfitness.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.appfitness.model.entity.Refeicao;
import com.appfitness.model.entity.Alimento; // Importe o seu DTO/Entity de Alimento
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.RefeicaoService;

import jakarta.validation.Valid;

/**
 * Classe de controle para gerenciar as operações relacionadas às refeições.
 * Responsável por: 
 * - Receber requisições HTTP relacionadas às refeições.
 * - Interagir com os serviços de negócio para processar dados de refeições.
 * - Retornar respostas apropriadas (ResponseEntity) para o cliente.
 */
@RestController
@RequestMapping("/refeicoes")
// CORS já é centralizado em `SecurityConfig.corsConfigurationSource()` (que
// restringe às origens reais do Vite) — um `@CrossOrigin(origins = "*")` aqui
// seria enganoso: o filtro de segurança roda antes e vale a política mais
// restritiva de qualquer forma, então essa anotação nunca teria efeito real.
public class RefeicaoController {

    private final RefeicaoService refeicaoService;
    
    // Injeção de dependência via construtor (Melhor prática)
    public RefeicaoController(RefeicaoService refeicaoService) {
        this.refeicaoService = refeicaoService;
    }
    
    // ==========================================
    // --- CRUD BÁSICO ---
    // ==========================================
    
    /**
     * 1. CREATE: Cria uma nova refeição no sistema.
     * URL: POST http://localhost:8080/refeicoes
     *
     * CORREÇÃO (segurança + fluxo do frontend): a Refeição é sempre vinculada
     * ao usuário do token JWT, nunca a um `usuario.id` vindo no corpo da
     * requisição. Antes, um cliente autenticado podia mandar qualquer
     * `usuario: { id: X }` no JSON e criar uma refeição em nome de outra
     * pessoa (IDOR). Como bônus, o React não precisa mais saber o ID
     * numérico do usuário logado para criar uma refeição — só nome/horário/
     * data (ver `useRefeicoes.js` -> `adicionarRefeicao`/`adicionarAlimento`,
     * que agora criam a Refeição sob demanda antes do primeiro alimento).
     */
    @PostMapping
    public ResponseEntity<Refeicao> criar(@Valid @RequestBody Refeicao refeicao, Authentication authentication) {
        refeicao.setUsuario(extrairUsuarioAutenticado(authentication));
        Refeicao novaRefeicao = refeicaoService.salvar(refeicao);
        // Retorna status 201 (Created) quando algo é salvo com sucesso
        return ResponseEntity.status(HttpStatus.CREATED).body(novaRefeicao);
    }
    
    /**
     * 2. READ: Obtém uma refeição específica por ID.
     * URL: GET http://localhost:8080/refeicoes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Refeicao> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(refeicaoService.buscarPorId(id));
    }
    
    /**
     * 3. UPDATE: Atualiza as informações de uma refeição existente.
     * URL: PUT http://localhost:8080/refeicoes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Refeicao> atualizar(
            @PathVariable Long id, 
            @Valid @RequestBody Refeicao refeicaoAtualizada) { // Corrigido de Dieta para Refeicao
        return ResponseEntity.ok(refeicaoService.atualizar(id, refeicaoAtualizada));
    }
    
    /**
     * 4. DELETE: Exclui uma refeição existente.
     * URL: DELETE http://localhost:8080/refeicoes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        refeicaoService.deletar(id);
        // Retorna 204 (No Content) após exclusão com sucesso
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 5. READ ALL: Lista todas as refeições cadastradas.
     * URL: GET http://localhost:8080/refeicoes
     */
    @GetMapping
    public ResponseEntity<List<Refeicao>> listarTodos() {
        return ResponseEntity.ok(refeicaoService.listarTodos());
    }

    // ==========================================
    // --- ROTAS ESPECÍFICAS PARA O REACT ---
    // ==========================================

    /**
     * Busca refeições por uma data específica 
     * URL: GET http://localhost:8080/refeicoes/dia?data=2026-07-26
     */
    @GetMapping("/dia")
    public ResponseEntity<List<Refeicao>> buscarRefeicoesDoDia(@RequestParam("data") String dataStr) {
        LocalDate data = LocalDate.parse(dataStr);
        return ResponseEntity.ok(refeicaoService.buscarPorData(data));
    }

    /**
     * Adiciona um alimento a uma refeição.
     * URL: POST http://localhost:8080/refeicoes/{idRefeicao}/alimentos
     *
     * CORREÇÃO: retorna o Alimento criado (201), não a Refeicao inteira — é
     * o que o frontend espera para inserir na lista local (ver
     * RefeicaoService.adicionarAlimento para o motivo).
     */
    @PostMapping("/{idRefeicao}/alimentos")
    public ResponseEntity<Alimento> adicionarAlimento(
            @PathVariable Long idRefeicao,
            @RequestBody Alimento novoAlimento) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(refeicaoService.adicionarAlimento(idRefeicao, novoAlimento));
    }

    /**
     * Atualiza um alimento existente dentro de uma refeição (ex: usuário
     * corrigiu a quantidade ou os macros).
     * URL: PUT http://localhost:8080/refeicoes/{idRefeicao}/alimentos/{idAlimento}
     *
     * CORREÇÃO: esta rota não existia — qualquer PUT nesse caminho batia só
     * no mapeamento de DELETE e o Spring devolvia 405 Method Not Allowed.
     */
    @PutMapping("/{idRefeicao}/alimentos/{idAlimento}")
    public ResponseEntity<Alimento> atualizarAlimento(
            @PathVariable Long idRefeicao,
            @PathVariable Long idAlimento,
            @RequestBody Alimento alimentoAtualizado) {
        return ResponseEntity.ok(refeicaoService.atualizarAlimento(idRefeicao, idAlimento, alimentoAtualizado));
    }

    /**
     * Remove um alimento de uma refeição.
     * URL: DELETE http://localhost:8080/refeicoes/{idRefeicao}/alimentos/{idAlimento}
     */
    @DeleteMapping("/{idRefeicao}/alimentos/{idAlimento}")
    public ResponseEntity<Refeicao> removerAlimento(
            @PathVariable Long idRefeicao,
            @PathVariable Long idAlimento) {
        return ResponseEntity.ok(refeicaoService.removerAlimento(idRefeicao, idAlimento));
    }

    /**
     * Extrai com segurança o Usuario autenticado a partir do token JWT
     * (mesmo padrão usado em UsuarioController.extrairUsuarioAutenticado).
     */
    private Usuario extrairUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
            throw new RuntimeException("Usuário não autenticado ou token inválido.");
        }
        return (Usuario) authentication.getPrincipal();
    }
}