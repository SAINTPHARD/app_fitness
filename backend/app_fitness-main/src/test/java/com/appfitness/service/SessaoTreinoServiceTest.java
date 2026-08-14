package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.SerieRepository;
import com.appfitness.repository.SessaoTreinoRepository;

@ExtendWith(MockitoExtension.class)
class SessaoTreinoServiceTest {

	@Mock
	private SessaoTreinoRepository sessaoTreinoRepository;

	@Mock
	private SerieRepository serieRepository;

	@Mock
	private SessaoTreinoInsercaoService sessaoTreinoInsercaoService;

	private SessaoTreinoService sessaoTreinoService;

	private Usuario usuario;
	private Treino treino;
	private LocalDate data;

	@BeforeEach
	void setUp() {
		sessaoTreinoService = new SessaoTreinoService(sessaoTreinoRepository, serieRepository, sessaoTreinoInsercaoService);
		usuario = new Usuario();
		usuario.setId(10L);
		treino = new Treino();
		treino.setId(1L);
		data = LocalDate.now();
	}

	@Test
	void deveRetornarSessaoExistenteSemCriarNova() {
		SessaoTreino existente = new SessaoTreino(treino, usuario, data);
		existente.setId(500L);

		when(sessaoTreinoRepository.findByTreinoAndData(treino, data)).thenReturn(Optional.of(existente));

		SessaoTreino resultado = sessaoTreinoService.obterOuCriarSessaoDoDia(treino, usuario, data);

		assertThat(resultado).isSameAs(existente);
		verifyNoInteractions(sessaoTreinoInsercaoService);
	}

	@Test
	void deveRecuperarSessaoExistenteQuandoSaveFalhaPorCorridaDeCriacao() {
		SessaoTreino criadaPelaOutraRequisicao = new SessaoTreino(treino, usuario, data);
		criadaPelaOutraRequisicao.setId(501L);

		when(sessaoTreinoRepository.findByTreinoAndData(treino, data))
				.thenReturn(Optional.empty())
				.thenReturn(Optional.of(criadaPelaOutraRequisicao));
		when(sessaoTreinoInsercaoService.inserir(any(SessaoTreino.class)))
				.thenThrow(new DataIntegrityViolationException("uk_sessao_treino_data"));

		SessaoTreino resultado = sessaoTreinoService.obterOuCriarSessaoDoDia(treino, usuario, data);

		assertThat(resultado).isSameAs(criadaPelaOutraRequisicao);
		verify(sessaoTreinoRepository, times(2)).findByTreinoAndData(treino, data);
	}

	@Test
	void deveRelancarExcecaoQuandoSaveFalhaESessaoNaoEncontradaNemNaSegundaConsulta() {
		when(sessaoTreinoRepository.findByTreinoAndData(treino, data)).thenReturn(Optional.empty());
		when(sessaoTreinoInsercaoService.inserir(any(SessaoTreino.class)))
				.thenThrow(new DataIntegrityViolationException("erro real"));

		assertThatThrownBy(() -> sessaoTreinoService.obterOuCriarSessaoDoDia(treino, usuario, data))
				.isInstanceOf(DataIntegrityViolationException.class);
	}
}
