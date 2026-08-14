package com.appfitness.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.dto.treino.ExercicioPendenteDTO;
import com.appfitness.dto.treino.RecordePessoalDTO;
import com.appfitness.dto.treino.ResumoSessaoDTO;
import com.appfitness.exception.AcessoNegadoException;
import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Serie;
import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.model.enums.SerieStatus;
import com.appfitness.model.enums.SessaoStatus;
import com.appfitness.repository.SerieRepository;
import com.appfitness.repository.SessaoTreinoRepository;

/**
 * Gerencia sessões de execução de treino: uma sessão é a "instância real"
 * de uma ficha (Treino) num dia específico. `obterOuCriarSessaoDoDia` é
 * idempotente por design — reabrir o app no mesmo dia sempre retoma a
 * mesma sessão (constraint única `uk_sessao_treino_data` garante isso mesmo
 * sob concorrência).
 */
@Service
public class SessaoTreinoService {

	private final SessaoTreinoRepository sessaoTreinoRepository;
	private final SerieRepository serieRepository;
	private final SessaoTreinoInsercaoService sessaoTreinoInsercaoService;

	public SessaoTreinoService(SessaoTreinoRepository sessaoTreinoRepository, SerieRepository serieRepository,
			SessaoTreinoInsercaoService sessaoTreinoInsercaoService) {
		this.sessaoTreinoRepository = sessaoTreinoRepository;
		this.serieRepository = serieRepository;
		this.sessaoTreinoInsercaoService = sessaoTreinoInsercaoService;
	}

	@Transactional
	public SessaoTreino obterOuCriarSessaoDoDia(Treino treino, Usuario usuarioAutenticado, LocalDate data) {
		var existente = sessaoTreinoRepository.findByTreinoAndData(treino, data);
		if (existente.isPresent()) {
			return existente.get();
		}

		try {
			// Delegado a um bean separado com `REQUIRES_NEW` — mesmo motivo
			// documentado em `SerieInsercaoService`: o INSERT (via
			// `saveAndFlush`) roda numa transação física própria, então uma
			// violação da constraint única aqui não deixa ESTA transação
			// (que fez a consulta acima) marcada como rollback-only.
			return sessaoTreinoInsercaoService.inserir(new SessaoTreino(treino, usuarioAutenticado, data));
		} catch (DataIntegrityViolationException ex) {
			// Corrida entre duas requisições simultâneas para o mesmo
			// (treino, data): a constraint única `uk_sessao_treino_data`
			// rejeitou o segundo INSERT depois que ambas passaram pela
			// consulta acima antes de qualquer uma salvar. Devolve a sessão
			// que a outra requisição já criou, em vez de propagar um 409 —
			// o endpoint é documentado como idempotente.
			return sessaoTreinoRepository.findByTreinoAndData(treino, data)
					.orElseThrow(() -> ex);
		}
	}

	/**
	 * Só consulta — nunca cria. Usado por telas que só precisam "espiar" o
	 * progresso de hoje (ex: widget da Home) sem o efeito colateral de abrir
	 * uma sessão nova para um dia que o usuário nem visitou ainda.
	 */
	@Transactional(readOnly = true)
	public java.util.Optional<SessaoTreino> buscarSessaoDeHojeSemCriar(Treino treino) {
		return sessaoTreinoRepository.buscarSessaoDeHoje(treino);
	}

	@Transactional(readOnly = true)
	public SessaoTreino buscarPorIdEUsuario(Long id, Usuario usuarioAutenticado) {
		SessaoTreino sessao = sessaoTreinoRepository.findByIdComSeries(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Sessão não encontrada com ID: " + id));
		validarProprietario(sessao, usuarioAutenticado);
		return sessao;
	}

	@Transactional
	public SessaoTreino iniciar(Long id, Usuario usuarioAutenticado) {
		SessaoTreino sessao = buscarPorIdEUsuario(id, usuarioAutenticado);
		if (sessao.getHorarioInicio() == null) {
			sessao.setHorarioInicio(LocalDateTime.now());
		}
		sessao.setStatus(SessaoStatus.EM_ANDAMENTO);
		return sessaoTreinoRepository.save(sessao);
	}

	@Transactional
	public SessaoTreino pausar(Long id, Usuario usuarioAutenticado) {
		SessaoTreino sessao = buscarPorIdEUsuario(id, usuarioAutenticado);
		sessao.setStatus(SessaoStatus.PAUSADO);
		return sessaoTreinoRepository.save(sessao);
	}

	@Transactional
	public SessaoTreino retomar(Long id, Usuario usuarioAutenticado) {
		SessaoTreino sessao = buscarPorIdEUsuario(id, usuarioAutenticado);
		sessao.setStatus(SessaoStatus.EM_ANDAMENTO);
		return sessaoTreinoRepository.save(sessao);
	}

	@Transactional
	public SessaoTreino concluir(Long id, Usuario usuarioAutenticado) {
		SessaoTreino sessao = buscarPorIdEUsuario(id, usuarioAutenticado);
		sessao.setStatus(SessaoStatus.CONCLUIDO);
		sessao.setHorarioFim(LocalDateTime.now());
		return sessaoTreinoRepository.save(sessao);
	}

	/**
	 * Resumo final: tempo total, progresso, volume (Σ carga×repetições das
	 * séries concluídas), maior carga, recordes pessoais novos (carga desta
	 * sessão supera qualquer sessão anterior) e o volume da sessão anterior
	 * da mesma ficha, para o cliente comparar. Tudo calculado sob demanda —
	 * nada disso é persistido, então nunca fica desatualizado em relação às
	 * séries reais.
	 */
	@Transactional(readOnly = true)
	public ResumoSessaoDTO gerarResumo(Long id, Usuario usuarioAutenticado) {
		SessaoTreino sessao = buscarPorIdEUsuario(id, usuarioAutenticado);

		List<Serie> concluidas = sessao.getSeries().stream()
				.filter(serie -> serie.getStatus() == SerieStatus.CONCLUIDA)
				.toList();

		long tempoTotalSegundos = calcularTempoTotalSegundos(sessao);

		BigDecimal volumeTotal = concluidas.stream()
				.map(this::calcularVolumeDaSerie)
				.reduce(BigDecimal.ZERO, BigDecimal::add);

		BigDecimal maiorCarga = concluidas.stream()
				.map(Serie::getCarga)
				.filter(carga -> carga != null)
				.max(BigDecimal::compareTo)
				.orElse(null);

		// Maior carga concluída HOJE por exercício — base para detectar recorde.
		Map<Long, BigDecimal> maiorCargaPorExercicioHoje = new LinkedHashMap<>();
		Map<Long, String> nomePorExercicio = new LinkedHashMap<>();
		for (Serie serie : concluidas) {
			if (serie.getCarga() == null || serie.getExercicio() == null) continue;
			Long exercicioId = serie.getExercicio().getId();
			nomePorExercicio.putIfAbsent(exercicioId, serie.getExercicio().getNome());
			BigDecimal atual = maiorCargaPorExercicioHoje.get(exercicioId);
			if (atual == null || serie.getCarga().compareTo(atual) > 0) {
				maiorCargaPorExercicioHoje.put(exercicioId, serie.getCarga());
			}
		}

		List<RecordePessoalDTO> novosRecordes = new ArrayList<>();
		for (Map.Entry<Long, BigDecimal> entrada : maiorCargaPorExercicioHoje.entrySet()) {
			BigDecimal cargaAnterior = serieRepository.buscarMelhorCargaAntesDe(entrada.getKey(), usuarioAutenticado, sessao.getData());
			if (cargaAnterior == null || entrada.getValue().compareTo(cargaAnterior) > 0) {
				novosRecordes.add(new RecordePessoalDTO(entrada.getKey(), nomePorExercicio.get(entrada.getKey()), cargaAnterior, entrada.getValue()));
			}
		}

		List<Exercicio> exerciciosDaFicha = sessao.getTreino().getExercicios();
		List<ExercicioPendenteDTO> naoConcluidos = new ArrayList<>();
		int exerciciosConcluidos = 0;
		for (Exercicio exercicio : exerciciosDaFicha) {
			long total = sessao.getSeries().stream()
					.filter(serie -> serie.getExercicio() != null && serie.getExercicio().getId().equals(exercicio.getId()))
					.count();
			long concluidasDoExercicio = sessao.getSeries().stream()
					.filter(serie -> serie.getExercicio() != null && serie.getExercicio().getId().equals(exercicio.getId())
							&& serie.getStatus() == SerieStatus.CONCLUIDA)
					.count();

			if (total > 0 && concluidasDoExercicio == total) {
				exerciciosConcluidos++;
			} else {
				naoConcluidos.add(new ExercicioPendenteDTO(exercicio.getId(), exercicio.getNome(), (int) concluidasDoExercicio, (int) total));
			}
		}

		BigDecimal volumeSessaoAnterior = sessaoTreinoRepository.buscarSessaoAnterior(sessao.getTreino(), sessao.getData())
				.map(anterior -> anterior.getSeries().stream()
						.filter(serie -> serie.getStatus() == SerieStatus.CONCLUIDA)
						.map(this::calcularVolumeDaSerie)
						.reduce(BigDecimal.ZERO, BigDecimal::add))
				.orElse(null);

		return new ResumoSessaoDTO(
				sessao.getId(),
				tempoTotalSegundos,
				exerciciosConcluidos,
				exerciciosDaFicha.size(),
				concluidas.size(),
				sessao.getSeries().size(),
				volumeTotal,
				maiorCarga,
				volumeSessaoAnterior,
				novosRecordes,
				naoConcluidos
		);
	}

	private long calcularTempoTotalSegundos(SessaoTreino sessao) {
		if (sessao.getHorarioInicio() == null) {
			return 0;
		}
		LocalDateTime fim = sessao.getHorarioFim() != null ? sessao.getHorarioFim() : LocalDateTime.now();
		return Duration.between(sessao.getHorarioInicio(), fim).getSeconds();
	}

	private BigDecimal calcularVolumeDaSerie(Serie serie) {
		if (serie.getCarga() == null || serie.getRepeticoes() == null) {
			return BigDecimal.ZERO;
		}
		return serie.getCarga().multiply(BigDecimal.valueOf(serie.getRepeticoes()));
	}

	private void validarProprietario(SessaoTreino sessao, Usuario usuarioAutenticado) {
		Long idDono = sessao.getUsuario() != null ? sessao.getUsuario().getId() : null;
		if (idDono == null || !idDono.equals(usuarioAutenticado.getId())) {
			throw new AcessoNegadoException("Esta sessão não pertence ao usuário autenticado.");
		}
	}
}
