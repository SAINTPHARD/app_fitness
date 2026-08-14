package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.SessaoTreinoRepository;

@ExtendWith(MockitoExtension.class)
class SessaoTreinoInsercaoServiceTest {

	@Mock
	private SessaoTreinoRepository sessaoTreinoRepository;

	private SessaoTreinoInsercaoService sessaoTreinoInsercaoService;

	@BeforeEach
	void setUp() {
		sessaoTreinoInsercaoService = new SessaoTreinoInsercaoService(sessaoTreinoRepository);
	}

	@Test
	void deveDelegarInsercaoParaSaveAndFlush() {
		SessaoTreino sessao = new SessaoTreino(new Treino(), new Usuario(), LocalDate.now());
		SessaoTreino salva = new SessaoTreino(sessao.getTreino(), sessao.getUsuario(), sessao.getData());
		salva.setId(1L);
		when(sessaoTreinoRepository.saveAndFlush(sessao)).thenReturn(salva);

		SessaoTreino resultado = sessaoTreinoInsercaoService.inserir(sessao);

		assertThat(resultado).isSameAs(salva);
		verify(sessaoTreinoRepository).saveAndFlush(sessao);
	}
}
