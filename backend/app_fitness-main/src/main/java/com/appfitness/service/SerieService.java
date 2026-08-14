package com.appfitness.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.dto.treino.SerieRequestDTO;
import com.appfitness.dto.treino.UltimaExecucaoDTO;
import com.appfitness.exception.AcessoNegadoException;
import com.appfitness.exception.ConfirmacaoNecessariaException;
import com.appfitness.exception.DadosInvalidosException;
import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Serie;
import com.appfitness.model.entity.Usuario;
import com.appfitness.model.enums.SerieStatus;
import com.appfitness.model.enums.SerieTipo;
import com.appfitness.model.enums.SessaoStatus;
import com.appfitness.repository.SerieRepository;

/**
 * Gerencia séries (carga/repetições registradas por execução de exercício).
 * Toda operação que muda série + progresso da sessão acontece na mesma
 * transação (item 7 do escopo: "operações que atualizam série, progresso e
 * histórico devem ser transacionais quando fazem parte da mesma unidade de
 * negócio") — aqui isso é natural porque `Serie` pertence à mesma agregação
 * de `SessaoTreino` (cascade), então um único `@Transactional` cobre tudo.
 */
@Service
public class SerieService {

	private static final Logger log = LoggerFactory.getLogger(SerieService.class);

	private final SerieRepository serieRepository;
	private final SessaoTreinoService sessaoTreinoService;
	private final ExercicioService exercicioService;

	public SerieService(SerieRepository serieRepository, SessaoTreinoService sessaoTreinoService,
			ExercicioService exercicioService) {
		this.serieRepository = serieRepository;
		this.sessaoTreinoService = sessaoTreinoService;
		this.exercicioService = exercicioService;
	}

	/**
	 * Cria uma nova série para um exercício dentro de uma sessão. Calcula
	 * `numeroSerie` automaticamente (contagem de séries já existentes + 1)
	 * e `ordemExercicio` a partir da posição do exercício na ficha — o
	 * cliente nunca envia esses dois números manualmente, evitando estado
	 * duplicado/inconsistente entre o front e o banco.
	 *
	 * IDEMPOTÊNCIA (sincronização offline): se `dto.idempotencyKey()` vier
	 * preenchida e já existir uma Série com essa chave, devolve a existente
	 * em vez de criar outra — cobre o caso de o cliente reenviar a mesma
	 * criação porque a resposta original se perdeu (rede caiu bem na volta),
	 * mas o servidor já tinha salvo da primeira vez.
	 */
	@Transactional
	public Serie registrarSerie(Long sessaoId, SerieRequestDTO dto, Usuario usuarioAutenticado) {
		boolean temIdempotencyKey = dto.idempotencyKey() != null && !dto.idempotencyKey().isBlank();

		if (temIdempotencyKey) {
			var existente = serieRepository.findByIdempotencyKey(dto.idempotencyKey());
			if (existente.isPresent()) {
				return existente.get();
			}
		}

		SessaoTreino sessao = sessaoTreinoService.buscarPorIdEUsuario(sessaoId, usuarioAutenticado);
		Exercicio exercicio = exercicioService.buscarPorIdEUsuario(dto.exercicioId(), usuarioAutenticado);
		avisarSeSessaoConcluida(sessao, "adicionar série", usuarioAutenticado);
		validarExercicioPertenceAoTreinoDaSessao(sessao, exercicio);

		int ordemExercicio = sessao.getTreino().getExercicios().indexOf(exercicio);
		long seriesExistentes = serieRepository.countBySessao_IdAndExercicio_Id(sessaoId, exercicio.getId());

		Serie serie = new Serie();
		serie.setSessao(sessao);
		serie.setExercicio(exercicio);
		serie.setOrdemExercicio(ordemExercicio >= 0 ? ordemExercicio : 0);
		serie.setNumeroSerie((int) seriesExistentes + 1);
		serie.setCarga(dto.carga());
		serie.setRepeticoes(dto.repeticoes());
		serie.setTipo(parseTipo(dto.tipo()));
		serie.setStatus(SerieStatus.EM_ANDAMENTO);
		serie.setHorarioInicio(LocalDateTime.now());
		if (temIdempotencyKey) {
			serie.setIdempotencyKey(dto.idempotencyKey());
		}

		try {
			return serieRepository.save(serie);
		} catch (DataIntegrityViolationException ex) {
			// Corrida entre duas requisições com a mesma idempotencyKey: a
			// constraint única do banco rejeitou o segundo INSERT depois que
			// ambas passaram pela checagem acima antes de qualquer uma salvar.
			// Em vez de propagar como conflito genérico, devolve a série que
			// a outra requisição já criou — mantendo a operação idempotente.
			if (temIdempotencyKey) {
				var existente = serieRepository.findByIdempotencyKey(dto.idempotencyKey());
				if (existente.isPresent()) {
					return existente.get();
				}
			}
			throw ex;
		}
	}

	/**
	 * Regra de negócio: uma série só pode ser registrada para um exercício
	 * que pertence à mesma ficha (Treino) da sessão informada. Sem isso, um
	 * usuário poderia registrar séries de `sessaoId` de uma ficha apontando
	 * para um `exercicioId` de outra ficha sua, corrompendo `ordemExercicio`
	 * e os cálculos de resumo/histórico.
	 */
	private void validarExercicioPertenceAoTreinoDaSessao(SessaoTreino sessao, Exercicio exercicio) {
		Long treinoDaSessaoId = sessao.getTreino() != null ? sessao.getTreino().getId() : null;
		Long treinoDoExercicioId = exercicio.getTreino() != null ? exercicio.getTreino().getId() : null;
		if (treinoDaSessaoId == null || !treinoDaSessaoId.equals(treinoDoExercicioId)) {
			throw new DadosInvalidosException("Este exercício não pertence à ficha de treino desta sessão.");
		}
	}

	/**
	 * Atualiza carga/repetições/tipo de uma série ainda não concluída.
	 */
	@Transactional
	public Serie atualizar(Long serieId, SerieRequestDTO dto, Usuario usuarioAutenticado) {
		Serie serie = buscarPorIdEUsuario(serieId, usuarioAutenticado);
		avisarSeSessaoConcluida(serie.getSessao(), "editar série " + serieId, usuarioAutenticado);
		serie.setCarga(dto.carga());
		serie.setRepeticoes(dto.repeticoes());
		if (dto.tipo() != null) {
			serie.setTipo(parseTipo(dto.tipo()));
		}
		return serieRepository.save(serie);
	}

	/**
	 * Marca a série como concluída — regra de negócio #12: "uma série
	 * concluída deve ter repetições válidas", então exige repetições
	 * preenchidas (>= 0) antes de aceitar a conclusão. Carga pode ficar
	 * nula/zero (exercício de peso corporal é um caso legítimo).
	 */
	@Transactional
	public Serie concluir(Long serieId, Usuario usuarioAutenticado) {
		Serie serie = buscarPorIdEUsuario(serieId, usuarioAutenticado);
		avisarSeSessaoConcluida(serie.getSessao(), "concluir série " + serieId, usuarioAutenticado);

		if (serie.getRepeticoes() == null || serie.getRepeticoes() < 0) {
			throw new DadosInvalidosException("Informe as repetições realizadas antes de concluir a série.");
		}

		serie.setStatus(SerieStatus.CONCLUIDA);
		serie.setHorarioConclusao(LocalDateTime.now());
		return serieRepository.save(serie);
	}

	/**
	 * Exclui uma série. Se ela já estiver concluída, exige `confirmar=true`
	 * — sem isso, dispara 409 em vez de apagar silenciosamente um registro
	 * de desempenho já salvo.
	 */
	@Transactional
	public void excluir(Long serieId, Usuario usuarioAutenticado, boolean confirmar) {
		Serie serie = buscarPorIdEUsuario(serieId, usuarioAutenticado);
		avisarSeSessaoConcluida(serie.getSessao(), "excluir série " + serieId, usuarioAutenticado);

		if (serie.getStatus() == SerieStatus.CONCLUIDA && !confirmar) {
			throw new ConfirmacaoNecessariaException(
					"Esta série já foi concluída. Confirme a exclusão para continuar.");
		}

		serieRepository.delete(serie);
	}

	@Transactional(readOnly = true)
	public Serie buscarPorIdEUsuario(Long id, Usuario usuarioAutenticado) {
		Serie serie = serieRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Série não encontrada com ID: " + id));
		Long idDono = serie.getSessao() != null && serie.getSessao().getUsuario() != null
				? serie.getSessao().getUsuario().getId() : null;
		if (idDono == null || !idDono.equals(usuarioAutenticado.getId())) {
			throw new AcessoNegadoException("Esta série não pertence ao usuário autenticado.");
		}
		return serie;
	}

	/**
	 * Base do "preenchimento inteligente": última execução concluída do
	 * exercício + melhor carga histórica, ambos escopados ao usuário
	 * autenticado. Todos os campos vêm `null` quando não há histórico —
	 * nunca inventa um "0" como se fosse desempenho real.
	 */
	@Transactional(readOnly = true)
	public UltimaExecucaoDTO buscarUltimaExecucao(Long exercicioId, Usuario usuarioAutenticado) {
		exercicioService.buscarPorIdEUsuario(exercicioId, usuarioAutenticado);

		return serieRepository.buscarUltimaExecucao(exercicioId, usuarioAutenticado)
				.map(ultima -> new UltimaExecucaoDTO(
						ultima.getSessao().getData(),
						ultima.getCarga(),
						ultima.getRepeticoes(),
						(int) serieRepository.countBySessao_IdAndExercicio_Id(ultima.getSessao().getId(), exercicioId),
						serieRepository.buscarMelhorCarga(exercicioId, usuarioAutenticado)
				))
				.orElse(new UltimaExecucaoDTO(null, null, null, null, null));
	}

	/**
	 * Regra de negócio: "uma sessão finalizada não deve ser alterada
	 * silenciosamente". Não bloqueia a alteração (permitir corrigir um dado
	 * digitado errado depois de encerrar o treino é um caso de uso legítimo),
	 * mas registra em log quem/quando mexeu numa sessão já CONCLUIDO, para
	 * existir rastro em vez de a mudança passar batido.
	 */
	private void avisarSeSessaoConcluida(SessaoTreino sessao, String acao, Usuario usuarioAutenticado) {
		if (sessao != null && sessao.getStatus() == SessaoStatus.CONCLUIDO) {
			log.warn("Usuário {} executou '{}' numa sessão de treino já concluída (sessaoId={}).",
					usuarioAutenticado.getId(), acao, sessao.getId());
		}
	}

	private SerieTipo parseTipo(String tipo) {
		if (tipo == null || tipo.isBlank()) {
			return SerieTipo.NORMAL;
		}
		try {
			return SerieTipo.valueOf(tipo.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			throw new DadosInvalidosException("Tipo de série inválido: " + tipo);
		}
	}
}
