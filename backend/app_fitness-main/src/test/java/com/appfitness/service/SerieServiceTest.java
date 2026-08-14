package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.appfitness.dto.treino.SerieRequestDTO;
import com.appfitness.exception.DadosInvalidosException;
import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Serie;
import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.repository.SerieRepository;

@ExtendWith(MockitoExtension.class)
class SerieServiceTest {

	@Mock
	private SerieRepository serieRepository;

	@Mock
	private SessaoTreinoService sessaoTreinoService;

	@Mock
	private ExercicioService exercicioService;

	@Mock
	private SerieInsercaoService serieInsercaoService;

	private SerieService serieService;

	private Usuario usuario;

	@BeforeEach
	void setUp() {
		serieService = new SerieService(serieRepository, sessaoTreinoService, exercicioService, serieInsercaoService);
		usuario = new Usuario();
		usuario.setId(10L);
	}

	private Treino treinoComId(Long id) {
		Treino treino = new Treino();
		treino.setId(id);
		treino.setExercicios(java.util.List.of());
		return treino;
	}

	private SessaoTreino sessaoDaFicha(Long sessaoId, Treino treino) {
		SessaoTreino sessao = new SessaoTreino(treino, usuario, java.time.LocalDate.now());
		sessao.setId(sessaoId);
		return sessao;
	}

	private Exercicio exercicioDaFicha(Long exercicioId, Treino treino) {
		Exercicio exercicio = new Exercicio("Supino", 3, 10, 5, "desc", treino);
		exercicio.setId(exercicioId);
		return exercicio;
	}

	@Test
	void deveRejeitarSerieQuandoExercicioNaoPertenceAoTreinoDaSessao() {
		Treino treinoDaSessao = treinoComId(1L);
		Treino treinoDoExercicio = treinoComId(2L);
		SessaoTreino sessao = sessaoDaFicha(100L, treinoDaSessao);
		Exercicio exercicio = exercicioDaFicha(200L, treinoDoExercicio);

		SerieRequestDTO dto = new SerieRequestDTO(exercicio.getId(), null, null, null, null);

		when(sessaoTreinoService.buscarPorIdEUsuario(100L, usuario)).thenReturn(sessao);
		when(exercicioService.buscarPorIdEUsuario(exercicio.getId(), usuario)).thenReturn(exercicio);

		assertThatThrownBy(() -> serieService.registrarSerie(100L, dto, usuario))
				.isInstanceOf(DadosInvalidosException.class);

		verifyNoInteractions(serieInsercaoService);
	}

	@Test
	void devePermitirSerieQuandoExercicioPertenceAoTreinoDaSessao() {
		Treino treino = treinoComId(1L);
		SessaoTreino sessao = sessaoDaFicha(100L, treino);
		Exercicio exercicio = exercicioDaFicha(200L, treino);

		SerieRequestDTO dto = new SerieRequestDTO(exercicio.getId(), null, null, null, null);

		when(sessaoTreinoService.buscarPorIdEUsuario(100L, usuario)).thenReturn(sessao);
		when(exercicioService.buscarPorIdEUsuario(exercicio.getId(), usuario)).thenReturn(exercicio);
		when(serieRepository.countBySessao_IdAndExercicio_Id(100L, exercicio.getId())).thenReturn(0L);
		when(serieInsercaoService.inserir(any(Serie.class))).thenAnswer(invocation -> invocation.getArgument(0));

		Serie resultado = serieService.registrarSerie(100L, dto, usuario);

		assertThat(resultado).isNotNull();
		assertThat(resultado.getExercicio()).isEqualTo(exercicio);
	}

	@Test
	void deveRetornarSerieExistenteQuandoIdempotencyKeyJaExiste() {
		Serie existente = new Serie();
		existente.setId(999L);
		existente.setIdempotencyKey("chave-1");

		SerieRequestDTO dto = new SerieRequestDTO(1L, null, null, null, "chave-1");

		when(serieRepository.findByIdempotencyKey("chave-1")).thenReturn(Optional.of(existente));

		Serie resultado = serieService.registrarSerie(50L, dto, usuario);

		assertThat(resultado).isSameAs(existente);
		verifyNoInteractions(sessaoTreinoService, exercicioService, serieInsercaoService);
	}

	@Test
	void deveRecuperarSerieExistenteQuandoSaveFalhaPorCorridaDeIdempotencyKey() {
		Treino treino = treinoComId(1L);
		SessaoTreino sessao = sessaoDaFicha(100L, treino);
		Exercicio exercicio = exercicioDaFicha(200L, treino);
		Serie existente = new Serie();
		existente.setId(999L);
		existente.setIdempotencyKey("chave-2");

		SerieRequestDTO dto = new SerieRequestDTO(exercicio.getId(), null, null, null, "chave-2");

		when(serieRepository.findByIdempotencyKey("chave-2"))
				.thenReturn(Optional.empty())
				.thenReturn(Optional.of(existente));
		when(sessaoTreinoService.buscarPorIdEUsuario(100L, usuario)).thenReturn(sessao);
		when(exercicioService.buscarPorIdEUsuario(exercicio.getId(), usuario)).thenReturn(exercicio);
		when(serieRepository.countBySessao_IdAndExercicio_Id(100L, exercicio.getId())).thenReturn(0L);
		when(serieInsercaoService.inserir(any(Serie.class)))
				.thenThrow(new DataIntegrityViolationException("chave duplicada"));

		Serie resultado = serieService.registrarSerie(100L, dto, usuario);

		assertThat(resultado).isSameAs(existente);
	}

	@Test
	void deveRelancarExcecaoQuandoSaveFalhaEChaveNaoEncontradaNemNaSegundaConsulta() {
		Treino treino = treinoComId(1L);
		SessaoTreino sessao = sessaoDaFicha(100L, treino);
		Exercicio exercicio = exercicioDaFicha(200L, treino);

		SerieRequestDTO dto = new SerieRequestDTO(exercicio.getId(), null, null, null, "chave-3");

		when(serieRepository.findByIdempotencyKey("chave-3")).thenReturn(Optional.empty());
		when(sessaoTreinoService.buscarPorIdEUsuario(100L, usuario)).thenReturn(sessao);
		when(exercicioService.buscarPorIdEUsuario(exercicio.getId(), usuario)).thenReturn(exercicio);
		when(serieRepository.countBySessao_IdAndExercicio_Id(100L, exercicio.getId())).thenReturn(0L);
		when(serieInsercaoService.inserir(any(Serie.class)))
				.thenThrow(new DataIntegrityViolationException("erro real"));

		assertThatThrownBy(() -> serieService.registrarSerie(100L, dto, usuario))
				.isInstanceOf(DataIntegrityViolationException.class);
	}
}
