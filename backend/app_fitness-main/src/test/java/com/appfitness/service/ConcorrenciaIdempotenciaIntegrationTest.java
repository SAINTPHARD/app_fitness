package com.appfitness.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.model.entity.Exercicio;
import com.appfitness.model.entity.Serie;
import com.appfitness.model.entity.SessaoTreino;
import com.appfitness.model.entity.Treino;
import com.appfitness.model.entity.Usuario;
import com.appfitness.model.enums.SerieStatus;
import com.appfitness.model.enums.SerieTipo;
import com.appfitness.repository.ExercicioRepository;
import com.appfitness.repository.SerieRepository;
import com.appfitness.repository.SessaoTreinoRepository;
import com.appfitness.repository.TreinoRepository;
import com.appfitness.repository.UsuarioRepository;

/**
 * Teste de integração real (JPA + banco) das constraints UNIQUE que
 * sustentam a idempotência de série/sessão — complementa os testes Mockito
 * de {@link SerieServiceTest}/{@link SessaoTreinoServiceTest}, que simulam
 * `DataIntegrityViolationException` com um mock e não provam que a
 * violação acontece de fato no `flush()`, nem que a recuperação funciona
 * contra um banco real.
 *
 * DECISÃO DE INFRAESTRUTURA: o projeto roda em PostgreSQL (dev/prod) e não
 * tinha H2 no classpath. Adicionamos H2 só em escopo `test` (pom.xml) e
 * isolamos este teste com `@TestPropertySource` (URL H2 própria +
 * H2Dialect) para não interferir no perfil `dev` (que aponta para
 * PostgreSQL real). As duas constraints exercitadas aqui —
 * `series.idempotency_key UNIQUE` (coluna simples) e `uk_sessao_treino_data
 * UNIQUE (treino_id, data)` (composta) — são UNIQUE constraints padrão SQL,
 * sem nenhum recurso específico do PostgreSQL (ex: índice funcional
 * `LOWER(TRIM(nome))` usado em `uk_exercicio_treino_nome`, que NÃO é
 * exercitado aqui por não ser equivalente em H2). Para este par de
 * constraints, H2 reproduz fielmente o comportamento de flush/commit que
 * está sob teste.
 *
 * Não simula duas threads concorrentes de verdade (isso seria flaky e
 * dependente de timing num teste Maven) — em vez disso, reproduz o
 * RESULTADO determinístico da corrida: a segunda tentativa de INSERT
 * encontra a constraint já violada por uma linha real já commitada pela
 * primeira, disparando uma `DataIntegrityViolationException` genuína do
 * Hibernate/H2 no `flush()` (via `saveAndFlush`), exatamente o cenário que
 * `SerieInsercaoService`/`SessaoTreinoInsercaoService` foram desenhados
 * para isolar numa transação própria.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({SerieInsercaoService.class, SessaoTreinoInsercaoService.class})
@TestPropertySource(properties = {
		"spring.datasource.url=jdbc:h2:mem:concorrencia_idempotencia;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
// @DataJpaTest envolve cada método numa transação só desfeita (rollback) no
// final — mas o INSERT via `REQUIRES_NEW` commita de verdade numa conexão
// separada DURANTE o teste, então precisa enxergar usuário/treino/exercício
// já commitados nesse meio-tempo. NOT_SUPPORTED remove o wrapper: cada
// chamada de repositório aqui commita por conta própria, como em produção.
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ConcorrenciaIdempotenciaIntegrationTest {

	@Autowired
	private UsuarioRepository usuarioRepository;

	@Autowired
	private TreinoRepository treinoRepository;

	@Autowired
	private ExercicioRepository exercicioRepository;

	@Autowired
	private SessaoTreinoRepository sessaoTreinoRepository;

	@Autowired
	private SerieRepository serieRepository;

	@Autowired
	private SerieInsercaoService serieInsercaoService;

	@Autowired
	private SessaoTreinoInsercaoService sessaoTreinoInsercaoService;

	private Usuario usuario;
	private Treino treino;
	private Exercicio exercicio;

	@BeforeEach
	void setUp() {
		usuario = new Usuario();
		usuario.setNome("Usuário Teste");
		usuario.setEmail("teste.concorrencia@appfitness.local");
		usuario.setSenha("senha-hash-fake");
		usuario = usuarioRepository.save(usuario);

		treino = new Treino();
		treino.setUsuario(usuario);
		treino.setNomeTreino("Treino de Integração");
		treino = treinoRepository.save(treino);

		exercicio = new Exercicio("Supino Reto", 3, 10, 5, "desc", treino);
		exercicio = exercicioRepository.save(exercicio);
	}

	@AfterEach
	void tearDown() {
		// Limpeza explícita: as linhas inseridas via `saveAndFlush` dentro de
		// `REQUIRES_NEW` commitam de verdade e sobrevivem ao rollback padrão
		// da transação de teste do @DataJpaTest, então precisam ser apagadas
		// manualmente para não vazar entre métodos de teste.
		serieRepository.deleteAll();
		sessaoTreinoRepository.deleteAll();
		exercicioRepository.deleteAll();
		treinoRepository.deleteAll();
		usuarioRepository.deleteAll();
	}

	@Test
	void constraintUnicaDeIdempotencyKeyImpedeDuplicidadeEPermiteRecuperacaoAposFlushReal() {
		SessaoTreino sessao = sessaoTreinoRepository.saveAndFlush(new SessaoTreino(treino, usuario, LocalDate.now()));

		Serie primeira = novaSerie(sessao, "chave-integracao-1");
		Serie salva = serieInsercaoService.inserir(primeira);
		assertThat(salva.getId()).isNotNull();

		Serie segunda = novaSerie(sessao, "chave-integracao-1");
		assertThatThrownBy(() -> serieInsercaoService.inserir(segunda))
				.isInstanceOf(DataIntegrityViolationException.class);

		// Fora da transação que falhou (mesmo padrão de SerieService.registrarSerie):
		Optional<Serie> recuperada = serieRepository.findByIdempotencyKey("chave-integracao-1");
		assertThat(recuperada).isPresent();
		assertThat(recuperada.get().getId()).isEqualTo(salva.getId());
		assertThat(serieRepository.count()).isEqualTo(1L);
	}

	@Test
	void constraintUnicaDeTreinoEDataImpedeSessaoDuplicadaEPermiteRecuperacaoAposFlushReal() {
		LocalDate data = LocalDate.now();

		SessaoTreino primeira = sessaoTreinoInsercaoService.inserir(new SessaoTreino(treino, usuario, data));
		assertThat(primeira.getId()).isNotNull();

		SessaoTreino segunda = new SessaoTreino(treino, usuario, data);
		assertThatThrownBy(() -> sessaoTreinoInsercaoService.inserir(segunda))
				.isInstanceOf(DataIntegrityViolationException.class);

		// Fora da transação que falhou (mesmo padrão de SessaoTreinoService.obterOuCriarSessaoDoDia):
		Optional<SessaoTreino> recuperada = sessaoTreinoRepository.findByTreinoAndData(treino, data);
		assertThat(recuperada).isPresent();
		assertThat(recuperada.get().getId()).isEqualTo(primeira.getId());
		assertThat(sessaoTreinoRepository.count()).isEqualTo(1L);
	}

	private Serie novaSerie(SessaoTreino sessao, String idempotencyKey) {
		Serie serie = new Serie();
		serie.setSessao(sessao);
		serie.setExercicio(exercicio);
		serie.setOrdemExercicio(0);
		serie.setNumeroSerie(1);
		serie.setStatus(SerieStatus.EM_ANDAMENTO);
		serie.setTipo(SerieTipo.NORMAL);
		serie.setIdempotencyKey(idempotencyKey);
		return serie;
	}
}
