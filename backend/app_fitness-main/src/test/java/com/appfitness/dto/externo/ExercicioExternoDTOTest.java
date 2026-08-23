package com.appfitness.dto.externo;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;

class ExercicioExternoDTOTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deveMapearEntradaDoCatalogoLocalEIgnorarCamposDesconhecidos() throws Exception {
        String json = """
                {
                  "name": "Supino Reto",
                  "type": "strength",
                  "muscle": "chest",
                  "equipment": "barbell",
                  "difficulty": "intermediate",
                  "instructions": "Pressione a barra de forma controlada.",
                  "gifUrl": "https://i.imgur.com/8bx1p0P.gif",
                  "campo_desconhecido": "ignorado"
                }
                """;

        ExercicioExternoDTO dto = objectMapper.readValue(json, ExercicioExternoDTO.class);

        assertThat(dto.name()).isEqualTo("Supino Reto");
        assertThat(dto.type()).isEqualTo("strength");
        assertThat(dto.muscle()).isEqualTo("chest");
        assertThat(dto.equipment()).isEqualTo("barbell");
        assertThat(dto.difficulty()).isEqualTo("intermediate");
        assertThat(dto.instructions()).isEqualTo("Pressione a barra de forma controlada.");
        assertThat(dto.gifUrl()).isEqualTo("https://i.imgur.com/8bx1p0P.gif");
    }
}
