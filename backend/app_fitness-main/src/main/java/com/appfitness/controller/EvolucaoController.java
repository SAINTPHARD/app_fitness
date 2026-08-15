package com.appfitness.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.appfitness.model.entity.FotoProgresso;
import com.appfitness.model.entity.MedidaCorporal;
import com.appfitness.model.entity.PesoRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.EvolucaoService;

import jakarta.validation.Valid;

/**
 * Controlador REST responsável por expor os endpoints de evolução corporal do usuário.
 * Gerencia o ciclo completo (CRUD) de registros de peso, medidas corporais e fotos de progresso.
 */
@RestController
@RequestMapping("/evolucao")
public class EvolucaoController {

    private final EvolucaoService evolucaoService;

    /**
     * Construtor para injeção de dependências do serviço de evolução.
     * @param evolucaoService : Serviço centralizador das regras de negócio de evolução.
     */
    public EvolucaoController(EvolucaoService evolucaoService) {
        this.evolucaoService = evolucaoService;
    }

    // =====================================================
    // ENDPOINTS DE PESO
    // =====================================================

    /**
     * Lista todo o histórico de peso do usuário autenticado.
     * @param authentication : Contexto de segurança contendo o usuário logado via Token JWT.
     * @return Lista de registros de peso com status HTTP 200 (OK).
     */
    @GetMapping("/pesos")
    public ResponseEntity<List<PesoRegistro>> listarPesos(Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(evolucaoService.listarPesos(usuario));
    }

    /**
     * Cria ou atualiza (Upsert) um registro de peso para o usuário autenticado.
     * @param registro : Dados de peso enviados no corpo da requisição.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return O registro salvo com status HTTP 201 (CREATED).
     */
    @PostMapping("/pesos")
    public ResponseEntity<PesoRegistro> criarPeso(
            @Valid @RequestBody PesoRegistro registro,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        PesoRegistro salvo = evolucaoService.salvarPeso(registro, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    /**
     * Atualiza um registro de peso específico através do ID.
     * @param id : ID do registro de peso a ser alterado.
     * @param registro : Novos dados de peso.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return O registro atualizado com status HTTP 200 (OK).
     */
    @PutMapping("/pesos/{id}")
    public ResponseEntity<PesoRegistro> atualizarPeso(
            @PathVariable Long id,
            @Valid @RequestBody PesoRegistro registro,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(evolucaoService.atualizarPeso(id, registro, usuario));
    }

    /**
     * Exclui um registro de peso do usuário autenticado.
     * @param id : ID do registro a ser removido.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return Status HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/pesos/{id}")
    public ResponseEntity<Void> deletarPeso(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        evolucaoService.deletarPeso(id, usuario);
        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // ENDPOINTS DE MEDIDAS CORPORAIS
    // =====================================================

    /**
     * Lista todo o histórico de medidas corporais do usuário autenticado.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return Lista de medidas corporais com status HTTP 200 (OK).
     */
    @GetMapping("/medidas")
    public ResponseEntity<List<MedidaCorporal>> listarMedidas(Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(evolucaoService.listarMedidas(usuario));
    }

    /**
     * Cria ou atualiza (Upsert) um conjunto de medidas corporais para o usuário autenticado.
     * @param registro : Dados de medidas enviados no corpo da requisição.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return O registro salvo com status HTTP 201 (CREATED).
     */
    @PostMapping("/medidas")
    public ResponseEntity<MedidaCorporal> criarMedida(
            @Valid @RequestBody MedidaCorporal registro,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        MedidaCorporal salvo = evolucaoService.salvarMedida(registro, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    /**
     * Atualiza um registro de medidas específico através do ID.
     * @param id : ID do registro de medidas a ser alterado.
     * @param registro : Novas medidas.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return O registro atualizado com status HTTP 200 (OK).
     */
    @PutMapping("/medidas/{id}")
    public ResponseEntity<MedidaCorporal> atualizarMedida(
            @PathVariable Long id,
            @Valid @RequestBody MedidaCorporal registro,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(evolucaoService.atualizarMedida(id, registro, usuario));
    }

    /**
     * Exclui um registro de medidas do usuário autenticado.
     * @param id : ID do registro a ser removido.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return Status HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/medidas/{id}")
    public ResponseEntity<Void> deletarMedida(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        evolucaoService.deletarMedida(id, usuario);
        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // ENDPOINTS DE FOTOS DE PROGRESSO
    // =====================================================

    /**
     * Lista todas as fotos de progresso do usuário autenticado.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return Lista de fotos com status HTTP 200 (OK).
     */
    @GetMapping("/fotos")
    public ResponseEntity<List<FotoProgresso>> listarFotos(Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(evolucaoService.listarFotos(usuario));
    }

    /**
     * Faz o upload/cadastro de uma nova foto de progresso para o usuário autenticado.
     * @param foto : Dados da foto (data e src) enviados no corpo da requisição.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return A foto salva com status HTTP 201 (CREATED).
     */
    @PostMapping("/fotos")
    public ResponseEntity<FotoProgresso> criarFoto(
            @Valid @RequestBody FotoProgresso foto,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        FotoProgresso salva = evolucaoService.salvarFoto(foto, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    /**
     * Atualiza uma foto de progresso específica através do ID.
     * @param id : ID da foto a ser alterada.
     * @param foto : Novos dados da foto.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return A foto atualizada com status HTTP 200 (OK).
     */
    @PutMapping("/fotos/{id}")
    public ResponseEntity<FotoProgresso> atualizarFoto(
            @PathVariable Long id,
            @Valid @RequestBody FotoProgresso foto,
            Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        return ResponseEntity.ok(evolucaoService.atualizarFoto(id, foto, usuario));
    }

    /**
     * Exclui uma foto de progresso do usuário autenticado.
     * @param id : ID da foto a ser removida.
     * @param authentication : Contexto de segurança contendo o usuário logado.
     * @return Status HTTP 204 (NO CONTENT).
     */
    @DeleteMapping("/fotos/{id}")
    public ResponseEntity<Void> deletarFoto(@PathVariable Long id, Authentication authentication) {
        Usuario usuario = extrairUsuarioAutenticado(authentication);
        evolucaoService.deletarFoto(id, usuario);
        return ResponseEntity.noContent().build();
    }

    /**
     * Método auxiliar privado para extrair com segurança a entidade Usuario 
     * a partir do contexto de autenticação do Spring Security.
     * @param authentication : Objeto de autenticação da requisição contendo o token JWT.
     * @return A entidade Usuario mapeada no token.
     */
    private Usuario extrairUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Usuario)) {
            throw new RuntimeException("Usuário não autenticado ou token inválido.");
        }
        return (Usuario) authentication.getPrincipal();
    }
}