package com.appfitness.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.appfitness.dto.usuario.UsuarioRequestDTO;
import com.appfitness.dto.usuario.UsuarioResponseDTO;
import com.appfitness.exception.GlobalExceptionHandler;
import com.appfitness.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
class UsuarioControllerTest {

    @Mock
    private UsuarioService usuarioService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        var validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders
                .standaloneSetup(new UsuarioController(usuarioService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void deveCadastrarUsuarioComPayloadMinimoValido() throws Exception {
        var resposta = new UsuarioResponseDTO(
                1L, "Robedson", "robedson@example.com",
                null, null, null, null, null
        );
        when(usuarioService.salvar(any(UsuarioRequestDTO.class))).thenReturn(resposta);

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Robedson",
                                  "email": "robedson@example.com",
                                  "senha": "SenhaForte123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Robedson"))
                .andExpect(jsonPath("$.email").value("robedson@example.com"))
                .andExpect(jsonPath("$.senha").doesNotExist());

        var captor = ArgumentCaptor.forClass(UsuarioRequestDTO.class);
        verify(usuarioService).salvar(captor.capture());
        org.assertj.core.api.Assertions.assertThat(captor.getValue().getSenha())
                .isEqualTo("SenhaForte123");
    }

    @Test
    void deveRetornar400QuandoCamposObrigatoriosEstaoAusentes() throws Exception {
        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Erro de validação"));

        verifyNoInteractions(usuarioService);
    }

    @Test
    void deveRetornarErroDeValidacaoQuandoSexoTemMaisDeUmCaractere() throws Exception {
        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Robedson",
                                  "email": "robedson@example.com",
                                  "senha": "SenhaForte123",
                                  "sexo": "Masculino"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Erro de validação"))
                .andExpect(jsonPath("$.mensagens[0]").value("sexo: deve ser M ou F"));

        verifyNoInteractions(usuarioService);
    }

    @Test
    void deveRetornarErroDeValidacaoQuandoSenhaNaoTemLetraENumero() throws Exception {
        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Robedson",
                                  "email": "robedson@example.com",
                                  "senha": "12345678"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Erro de validação"))
                .andExpect(jsonPath("$.mensagens[0]").value(
                        "senha: deve conter pelo menos uma letra e um número"));

        verifyNoInteractions(usuarioService);
    }

    @Test
    void deveExplicarValoresAceitosQuandoObjetivoForInvalido() throws Exception {
        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nome": "Robedson",
                                  "email": "robedson@example.com",
                                  "senha": "SenhaForte123",
                                  "objetivo": "GANHAR_MASSA"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("JSON inválido"))
                .andExpect(jsonPath("$.mensagens[0]").value(
                        org.hamcrest.Matchers.containsString("EMAGRECER, MANTER ou HIPERTROFIA")));

        verifyNoInteractions(usuarioService);
    }
}
