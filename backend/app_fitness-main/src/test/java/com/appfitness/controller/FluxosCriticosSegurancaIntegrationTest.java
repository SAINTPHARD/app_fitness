package com.appfitness.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.model.entity.PesoRegistro;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.PesoRegistroRepository;
import com.appfitness.repository.UsuarioRepository;
import com.appfitness.security.TokenService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FluxosCriticosSegurancaIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired PesoRegistroRepository pesoRepository;
    @Autowired TokenService tokenService;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void healthEhPublicoMasMetricasExigemJwt() throws Exception {
        mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
        mockMvc.perform(get("/actuator/metrics")).andExpect(status().isUnauthorized());
    }

    @Test
    void upsertDePesoExigeAutenticacao() throws Exception {
        mockMvc.perform(post("/evolucao/pesos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"data\":\"2026-08-31\",\"peso\":72.5}"))
                .andExpect(status().isUnauthorized());

        assertThat(pesoRepository.count()).isZero();
    }

    @Test
    void upsertUsaDonoDoTokenENaoDuplicaMesmoDia() throws Exception {
        Usuario dono = salvarUsuario("dono-peso@example.com");
        Usuario outro = salvarUsuario("outro-peso@example.com");
        String autorizacao = "Bearer " + tokenService.gerarToken(dono);
        String payload = "{\"data\":\"2026-08-31\",\"peso\":%s,\"usuario\":{\"id\":%d}}";

        mockMvc.perform(post("/evolucao/pesos").header("Authorization", autorizacao)
                        .contentType(MediaType.APPLICATION_JSON).content(payload.formatted("72.5", outro.getId())))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/evolucao/pesos").header("Authorization", autorizacao)
                        .contentType(MediaType.APPLICATION_JSON).content(payload.formatted("71.9", outro.getId())))
                .andExpect(status().isCreated());

        var registros = pesoRepository.findByUsuarioIdOrderByDataAscIdAsc(dono.getId());
        assertThat(registros).hasSize(1);
        assertThat(registros.getFirst().getPeso()).isEqualTo(71.9);
        assertThat(pesoRepository.findByUsuarioIdOrderByDataAscIdAsc(outro.getId())).isEmpty();
    }

    @Test
    void usuarioNaoPodeAtualizarPesoDeOutraConta() throws Exception {
        Usuario dono = salvarUsuario("dono-registro@example.com");
        Usuario invasor = salvarUsuario("invasor@example.com");
        PesoRegistro registro = new PesoRegistro();
        registro.setUsuario(dono);
        registro.setData(LocalDate.of(2026, 8, 31));
        registro.setPeso(80.0);
        registro = pesoRepository.saveAndFlush(registro);

        mockMvc.perform(put("/evolucao/pesos/{id}", registro.getId())
                        .header("Authorization", "Bearer " + tokenService.gerarToken(invasor))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"data\":\"2026-08-31\",\"peso\":60.0}"))
                .andExpect(status().isNotFound());

        assertThat(pesoRepository.findById(registro.getId()).orElseThrow().getPeso()).isEqualTo(80.0);
    }

    @Test
    void redefinicaoComTokenInvalidoNaoAlteraSenha() throws Exception {
        Usuario usuario = salvarUsuario("reset-protegido@example.com");
        String senhaAnterior = usuario.getSenha();

        mockMvc.perform(post("/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"token-invalido-comprido\",\"novaSenha\":\"NovaSenha1\"}"))
                .andExpect(status().isBadRequest());

        assertThat(usuarioRepository.findById(usuario.getId()).orElseThrow().getSenha()).isEqualTo(senhaAnterior);
    }

    private Usuario salvarUsuario(String email) {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuário de teste");
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode("SenhaAtual1"));
        return usuarioRepository.saveAndFlush(usuario);
    }
}
