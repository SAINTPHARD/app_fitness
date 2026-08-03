package com.appfitness.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.appfitness.model.entity.Alimento;
import com.appfitness.model.entity.Refeicao;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.RefeicaoService;

import jakarta.validation.Valid;

/**
 * Controller REST para gerenciar as operações de refeições e alimentos.
 * * Responsabilidades:
 * - Mapear endpoints da API de Dieta.
 * - Garantir que cada operação seja escopada estritamente ao usuário do Token JWT.
 * - Delegar regras de negócio para a camada RefeicaoService.
 */
@RestController
@RequestMapping("/refeicoes")
public class RefeicaoController {

    private final RefeicaoService refeicaoService;

    // Injeção de dependência via construtor (Melhor prática Spring)
    public RefeicaoController(RefeicaoService refeicaoService) {
        this.refeicaoService = refeicaoService;
    }

    // ==========================================
    // --- CRUD BÁSICO DE REFEIÇÕES ---
    // ==========================================

    /**
     * 1. CREATE: Cria uma nova refeição para o usuário logado.
     * URL: POST http://localhost:8080/refeicoes
     */
    @PostMapping
    public ResponseEntity<Refeicao> criar(
            @Valid @RequestBody Refeicao refeicao, 
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        refeicao.setUsuario(usuarioLogado);
        
        Refeicao novaRefeicao = refeicaoService.salvar(refeicao);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaRefeicao);
    }

    /**
     * 2. READ: Busca uma refeição específica por ID (somente se pertencer ao usuário).
     * URL: GET http://localhost:8080/refeicoes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Refeicao> buscarPorId(
            @PathVariable Long id, 
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(refeicaoService.buscarPorIdEUsuario(id, usuarioLogado));
    }

    /**
     * 3. UPDATE: Atualiza os dados de uma refeição.
     * URL: PUT http://localhost:8080/refeicoes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Refeicao> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Refeicao refeicaoAtualizada,
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(refeicaoService.atualizar(id, refeicaoAtualizada, usuarioLogado));
    }

    /**
     * 4. DELETE: Exclui uma refeição.
     * URL: DELETE http://localhost:8080/refeicoes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id, 
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        refeicaoService.deletar(id, usuarioLogado);
        return ResponseEntity.noContent().build();
    }

    /**
     * 5. READ ALL: Lista todas as refeições cadastradas DO USUÁRIO LOGADO.
     * URL: GET http://localhost:8080/refeicoes
     */
    @GetMapping
    public ResponseEntity<List<Refeicao>> listarTodos(Authentication authentication) {
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(refeicaoService.listarPorUsuario(usuarioLogado));
    }

    // ==========================================
    // --- ROTAS ESPECÍFICAS PARA O REACT ---
    // ==========================================

    /**
     * Busca refeições de um dia específico para o usuário logado.
     * URL: GET http://localhost:8080/refeicoes/dia?data=YYYY-MM-DD
     */
    @GetMapping("/dia")
    public ResponseEntity<List<Refeicao>> buscarRefeicoesDoDia(
            @RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(refeicaoService.buscarPorDataEUsuario(data, usuarioLogado.getId()));
    }

    /**
     * Marca uma refeição como concluída (status CONCLUIDO).
     * URL: PATCH http://localhost:8080/refeicoes/{id}/concluir
     */
    @PatchMapping("/{id}/concluir")
    public ResponseEntity<Refeicao> concluirRefeicao(
            @PathVariable Long id, 
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(refeicaoService.concluirRefeicao(id, usuarioLogado));
    }

    // ==========================================
    // --- GERENCIAMENTO DE ALIMENTOS ---
    // ==========================================

    /**
     * Adiciona um novo alimento a uma refeição existente — inclusive uma já
     * concluída/salva. Retorna a Refeição inteira (itens + `totalCalorias`
     * recalculado), não só o Alimento criado, para o cliente atualizar o
     * card inteiro numa única resposta.
     * URL: POST http://localhost:8080/refeicoes/{idRefeicao}/alimentos
     *
     * Erros: 400 (Alimento inválido — `@Valid`), 401 (sem token — filtro de
     * segurança), 403 (Refeição de outro usuário), 404 (Refeição inexistente),
     * 409 (mesmo nome+quantidade já registrado nesta Refeição).
     */
    @PostMapping("/{idRefeicao}/alimentos")
    public ResponseEntity<Refeicao> adicionarAlimento(
            @PathVariable Long idRefeicao,
            @Valid @RequestBody Alimento novoAlimento,
            Authentication authentication) {

        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        Refeicao refeicaoAtualizada = refeicaoService.adicionarAlimento(idRefeicao, novoAlimento, usuarioLogado);

        return ResponseEntity.status(HttpStatus.CREATED).body(refeicaoAtualizada);
    }

    /**
     * Atualiza um alimento dentro de uma refeição.
     * URL: PUT http://localhost:8080/refeicoes/{idRefeicao}/alimentos/{idAlimento}
     */
    @PutMapping("/{idRefeicao}/alimentos/{idAlimento}")
    public ResponseEntity<Alimento> atualizarAlimento(
            @PathVariable Long idRefeicao,
            @PathVariable Long idAlimento,
            @Valid @RequestBody Alimento alimentoAtualizado,
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        Alimento atualizado = refeicaoService.atualizarAlimento(idRefeicao, idAlimento, alimentoAtualizado, usuarioLogado);
        
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove um alimento de uma refeição.
     * URL: DELETE http://localhost:8080/refeicoes/{idRefeicao}/alimentos/{idAlimento}
     */
    @DeleteMapping("/{idRefeicao}/alimentos/{idAlimento}")
    public ResponseEntity<Refeicao> removerAlimento(
            @PathVariable Long idRefeicao,
            @PathVariable Long idAlimento,
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        Refeicao refeicaoAtualizada = refeicaoService.removerAlimento(idRefeicao, idAlimento, usuarioLogado);
        
        return ResponseEntity.ok(refeicaoAtualizada);
    }

    // ==========================================
    // --- INTELIGÊNCIA ARTIFICIAL (GEMINI) ---
    // ==========================================

    /**
     * Analisa a foto de um prato enviada pelo React usando a API do Google Gemini.
     * Retorna a lista de alimentos sugeridos com gramas e macronutrientes estimados.
     * URL: POST http://localhost:8080/refeicoes/analisar-foto
     */
    @PostMapping("/analisar-foto")
    public ResponseEntity<List<Alimento>> analisarFotoPrato(
            @RequestParam("foto") MultipartFile foto,
            Authentication authentication) {
        
        Usuario usuarioLogado = extrairUsuarioAutenticado(authentication);
        List<Alimento> alimentosIdentificados = refeicaoService.analisarFotoPrato(foto, usuarioLogado);
        
        return ResponseEntity.ok(alimentosIdentificados);
    }

    // ==========================================
    // --- MÉTODO AUXILIAR DE SEGURANÇA ---
    // ==========================================

    /**
     * Extrai com segurança a entidade Usuario autenticada pelo Spring Security a partir do Token JWT.
     */
    private Usuario extrairUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
            throw new RuntimeException("Usuário não autenticado ou Token JWT inválido.");
        }
        return (Usuario) authentication.getPrincipal();
    }
}