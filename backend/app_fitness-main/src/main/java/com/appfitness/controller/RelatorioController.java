package com.appfitness.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.appfitness.dto.relatorio.RelatorioResponseDTO;
import com.appfitness.model.entity.Usuario;
import com.appfitness.service.RelatorioService;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {
    private final RelatorioService service;
    public RelatorioController(RelatorioService service) { this.service = service; }

    @GetMapping("/consolidado")
    public ResponseEntity<RelatorioResponseDTO> consolidado(@RequestParam(defaultValue = "30") int dias, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof Usuario usuario)) throw new IllegalStateException("Usuário não autenticado.");
        return ResponseEntity.ok(service.gerar(usuario, dias));
    }
}
