package com.appfitness.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Alimento;
import com.appfitness.model.entity.Refeicao;
import com.appfitness.repository.AlimentoRepository;
import com.appfitness.repository.RefeicaoRepository;

/**
 * Classe de serviço para Alimento. Concentra a lógica de negócio de
 * persistência do Alimento quando ele é tratado como um recurso próprio (em
 * vez de uma operação aninhada dentro de `RefeicaoService`, que é o caminho
 * usado hoje pelo `RefeicaoController` para os endpoints `/refeicoes/{id}
 * /alimentos/**`). Mantém as mesmas regras de negócio daquele fluxo (
 * associação bidirecional explícita, proteção contra `TransientProperty
 * ValueException`) só que expostas como uma camada independente, pronta
 * para ser usada por um eventual `AlimentoController` dedicado.
 *
 * Importante: como o Alimento nunca existe sozinho (ele é sempre filho de uma
 * Refeição — ver `@ManyToOne` em `Alimento.refeicao`), este serviço depende
 * também do `RefeicaoRepository`, e não só do `AlimentoRepository`, para
 * conseguir validar e vincular a refeição "pai" antes de qualquer persistência.
 */
@Service
public class AlimentoService {

	private final AlimentoRepository alimentoRepository;
	private final RefeicaoRepository refeicaoRepository;

	// Injeção de dependência via construtor (padrão sênior): evita o uso de
	// @Autowired em campos, deixa as dependências explícitas na assinatura e
	// facilita a criação de testes unitários (basta instanciar com mocks).
	public AlimentoService(AlimentoRepository alimentoRepository, RefeicaoRepository refeicaoRepository) {
		this.alimentoRepository = alimentoRepository;
		this.refeicaoRepository = refeicaoRepository;
	}

	/**
	 * READ: Busca um alimento por ID.
	 * Lança `RecursoNaoEncontradoException` (mapeada para 404 pelo
	 * `GlobalExceptionHandler`) em vez de deixar o Spring devolver um 500
	 * genérico para um ID que simplesmente não existe.
	 */
	public Alimento buscarPorId(Long id) {
		return alimentoRepository.findById(id)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Alimento não encontrado com ID: " + id));
	}

	/**
	 * READ ALL: Retorna todos os alimentos cadastrados no sistema (de todas as
	 * refeições/usuários). Usado principalmente para depuração/administração —
	 * o fluxo real do frontend sempre acessa os alimentos através da Refeição
	 * "pai" (ver `RefeicaoController`/`RefeicaoService`).
	 */
	public List<Alimento> listarTodos() {
		return alimentoRepository.findAll();
	}

	/**
	 * CREATE: Salva um novo alimento associado a uma refeição existente.
	 *
	 * REGRA CRÍTICA: o Alimento recebido do controller ainda é "transiente"
	 * (nunca foi persistido) — se ele não tiver o lado dono do relacionamento
	 * (`alimento.refeicao`) preenchido ANTES do `save()`, o Hibernate lança
	 * `TransientPropertyValueException` ao tentar gravar a chave estrangeira
	 * `refeicao_id` sem saber a qual Refeição ela se refere. Por isso,
	 * buscamos a Refeição "pai" primeiro e chamamos
	 * `novoAlimento.setRefeicao(refeicao)` explicitamente antes de salvar.
	 */
	@Transactional
	public Alimento salvar(Long idRefeicao, Alimento novoAlimento) {
		Refeicao refeicao = refeicaoRepository.findById(idRefeicao)
				.orElseThrow(() -> new RecursoNaoEncontradoException("Refeição não encontrada com ID: " + idRefeicao));

		// Associação bidirecional explícita: preenche o lado "dono" (Alimento
		// guarda o refeicao_id) antes de qualquer persistência.
		novoAlimento.setRefeicao(refeicao);

		return alimentoRepository.save(novoAlimento);
	}

	/**
	 * UPDATE: Atualiza os dados de um alimento já existente.
	 *
	 * Protegida contra valores nulos: só sobrescrevemos um campo se o valor
	 * recebido não for nulo, para que um PUT parcial (ou um cliente que
	 * esqueceu de mandar algum campo) não apague dados já salvos com `null`
	 * sem querer — diferente de simplesmente copiar o objeto inteiro recebido
	 * por cima do existente.
	 */
	@Transactional
	public Alimento atualizar(Long id, Alimento dadosAtualizados) {
		Alimento alimentoExistente = buscarPorId(id);

		if (dadosAtualizados.getNome() != null) {
			alimentoExistente.setNome(dadosAtualizados.getNome());
		}
		if (dadosAtualizados.getQuantidade() != null) {
			alimentoExistente.setQuantidade(dadosAtualizados.getQuantidade());
		}
		if (dadosAtualizados.getCalorias() != null) {
			alimentoExistente.setCalorias(dadosAtualizados.getCalorias());
		}
		if (dadosAtualizados.getCarboidratos() != null) {
			alimentoExistente.setCarboidratos(dadosAtualizados.getCarboidratos());
		}
		if (dadosAtualizados.getProteinas() != null) {
			alimentoExistente.setProteinas(dadosAtualizados.getProteinas());
		}
		if (dadosAtualizados.getGorduras() != null) {
			alimentoExistente.setGorduras(dadosAtualizados.getGorduras());
		}

		// Como `alimentoExistente` já é uma entidade gerenciada (veio de um
		// findById dentro da mesma transação), o Hibernate detectaria essas
		// mudanças sozinho no fim da transação (dirty checking); o save()
		// explícito aqui só deixa a intenção clara para quem lê o código.
		return alimentoRepository.save(alimentoExistente);
	}

	/**
	 * DELETE: Remove um alimento existente.
	 * Diferente da remoção via `RefeicaoService.removerAlimento` (que tira o
	 * Alimento da lista da Refeição e deixa o `orphanRemoval = true` cuidar da
	 * exclusão), aqui removemos diretamente pelo `AlimentoRepository` — ambos
	 * os caminhos chegam no mesmo `DELETE` no banco.
	 */
	@Transactional
	public void deletar(Long id) {
		Alimento alimento = buscarPorId(id);
		alimentoRepository.delete(alimento);
	}
}
