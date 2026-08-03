package com.appfitness.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.appfitness.dto.AlimentoAnaliseDTO;
import com.appfitness.event.ItensRefeicaoAtualizadosEvent;
import com.appfitness.exception.AcessoNegadoException;
import com.appfitness.exception.AlimentoDuplicadoException;
import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.model.entity.Alimento;
import com.appfitness.model.entity.Refeicao;
import com.appfitness.model.entity.Usuario;
import com.appfitness.model.enums.RefeicaoStatus;
import com.appfitness.repository.RefeicaoRepository;
import com.appfitness.repository.UsuarioRepository;

/**
 * Classe de serviço para Refeição. Responsável por conter a lógica de negócios
 * relacionada à entidade Refeicao, processar os dados e interagir com o
 * repositório para realizar as operações de CRUD.
 */
@Service
public class RefeicaoService {

    private final RefeicaoRepository refeicaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GeminiVisionService geminiVisionService;
    private final ApplicationEventPublisher eventPublisher;

    // Injeção de dependências via construtor (Melhor Prática)
    public RefeicaoService(RefeicaoRepository refeicaoRepository,
                           UsuarioRepository usuarioRepository,
                           GeminiVisionService geminiVisionService,
                           ApplicationEventPublisher eventPublisher) {
        this.refeicaoRepository = refeicaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.geminiVisionService = geminiVisionService;
        this.eventPublisher = eventPublisher;
    }

    // ==========================================
    // --- MÉTODOS CRUD BÁSICOS ---
    // ==========================================

    /**
     * 1. CREATE: Salva uma nova refeição no sistema.
     * Rota: POST http://localhost:8080/refeicoes
     */
    @Transactional
    public Refeicao salvar(Refeicao refeicao) {
        vincularUsuario(refeicao);

        // Garante que cada Alimento aponte para esta Refeição antes de salvar em Cascade
        if (refeicao.getAlimentos() != null) {
            refeicao.getAlimentos().forEach(alimento -> alimento.setRefeicao(refeicao));
        }

        return refeicaoRepository.save(refeicao);
    }

    /**
     * 2. READ: Obtém uma refeição por ID.
     * Rota: GET http://localhost:8080/refeicoes/{id}
     *
     * @Transactional(readOnly = true) + findByIdComAlimentos (LEFT JOIN FETCH)
     * garantem que `alimentos` já vem inicializado dentro da sessão do
     * Hibernate, evitando LazyInitializationException ao serializar a
     * resposta (spring.jpa.open-in-view=false).
     */
    @Transactional(readOnly = true)
    public Refeicao buscarPorId(Long id) {
        return refeicaoRepository.findByIdComAlimentos(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Refeição não encontrada com ID: " + id));
    }

    /**
     * 2b. READ (escopado): Busca por ID validando proprietário (Previne IDOR).
     */
    public Refeicao buscarPorIdEUsuario(Long id, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorId(id);
        validarProprietario(refeicao, usuarioAutenticado);
        return refeicao;
    }

    /**
     * 3. UPDATE: Atualiza os dados de uma refeição existente.
     * Rota: PUT http://localhost:8080/refeicoes/{id}
     */
    @Transactional
    public Refeicao atualizar(Long id, Refeicao refeicaoAtualizada, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorIdEUsuario(id, usuarioAutenticado);

        refeicao.setNomeRefeicao(refeicaoAtualizada.getNomeRefeicao());
        refeicao.setDataRefeicao(refeicaoAtualizada.getDataRefeicao());
        refeicao.setHorario(refeicaoAtualizada.getHorario());

        return refeicaoRepository.save(refeicao);
    }

    /**
     * 4. DELETE: Exclui uma refeição do banco.
     * Rota: DELETE http://localhost:8080/refeicoes/{id}
     */
    @Transactional
    public void deletar(Long id, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorIdEUsuario(id, usuarioAutenticado);
        refeicaoRepository.delete(refeicao);
    }

    /**
     * 5. READ ALL (Global / Admin): Retorna todas as refeições salvas.
     */
    public List<Refeicao> listarTodos() {
        return refeicaoRepository.findAll();
    }

    /**
     * 5b. READ ALL (Escopado): Lista todas as refeições do usuário autenticado.
     * Usa findByUsuarioComAlimentos (LEFT JOIN FETCH) pelo mesmo motivo do
     * buscarPorId: sem isso, cada Refeicao da lista dispararia uma tentativa
     * de lazy-load de `alimentos` já fora da sessão do Hibernate.
     */
    @Transactional(readOnly = true)
    public List<Refeicao> listarPorUsuario(Usuario usuarioLogado) {
        return refeicaoRepository.findByUsuarioComAlimentos(usuarioLogado);
    }

    // ==========================================
    // --- MÉTODOS ESPECÍFICOS PARA O REACT ---
    // ==========================================

    @Deprecated
    public List<Refeicao> buscarPorData(LocalDate data) {
        return refeicaoRepository.findByDataRefeicao(data);
    }

    /**
     * Busca as refeições de uma data específica pertencentes a UM usuário.
     */
    public List<Refeicao> buscarPorDataEUsuario(LocalDate data, Long idUsuarioAutenticado) {
        return refeicaoRepository.findByDataRefeicaoAndUsuario_IdOrderByHorarioAsc(data, idUsuarioAutenticado);
    }

    /**
     * Marca uma refeição como CONCLUIDO.
     * Rota: PATCH http://localhost:8080/refeicoes/{id}/concluir
     */
    @Transactional
    public Refeicao concluirRefeicao(Long idRefeicao, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorId(idRefeicao);
        validarProprietario(refeicao, usuarioAutenticado);

        refeicao.setStatus(RefeicaoStatus.CONCLUIDO);
        return refeicaoRepository.save(refeicao);
    }

    // ==========================================
    // --- GERENCIAMENTO DE ALIMENTOS ---
    // ==========================================

    /**
     * Adiciona um novo alimento a uma refeição já existente (inclusive uma já
     * concluída — a rota não distingue status, e o repositório de UI é quem
     * decide se oferece essa ação para o usuário). Valida duplicidade,
     * recalcula o total de calorias (via `Refeicao.getTotalCalorias`,
     * sob demanda) e publica um evento de domínio para efeitos colaterais
     * (auditoria, cache, etc. — ver `ItensRefeicaoAtualizadosListener`) só
     * depois que a transação comitar.
     *
     * Retorna a Refeição inteira (não só o Alimento criado) para o frontend
     * poder atualizar o card preservando os itens antigos e exibindo o novo
     * total de calorias numa única resposta.
     */
    @Transactional
    public Refeicao adicionarAlimento(Long idRefeicao, Alimento novoAlimento, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorIdEUsuario(idRefeicao, usuarioAutenticado);

        validarDuplicidade(refeicao, novoAlimento);

        novoAlimento.setRefeicao(refeicao);
        refeicao.getAlimentos().add(novoAlimento);

        Refeicao refeicaoSalva = refeicaoRepository.save(refeicao);
        eventPublisher.publishEvent(new ItensRefeicaoAtualizadosEvent(refeicaoSalva.getId()));

        return refeicaoSalva;
    }

    /**
     * Duplicidade = mesmo nome (case/acentuação à parte só no trim+lowercase)
     * E mesma quantidade já presentes na Refeição — cobre o caso real de
     * duplo clique/duplo submit sem bloquear porções legítimas do mesmo
     * alimento em quantidades diferentes (ex: dois lanches de "Banana", um de
     * "100g" e outro de "150g").
     */
    private void validarDuplicidade(Refeicao refeicao, Alimento novoAlimento) {
        String nomeNovo = normalizarParaComparacao(novoAlimento.getNome());
        String quantidadeNova = normalizarParaComparacao(novoAlimento.getQuantidade());

        boolean jaExiste = refeicao.getAlimentos().stream().anyMatch(alimento ->
                normalizarParaComparacao(alimento.getNome()).equals(nomeNovo)
                        && normalizarParaComparacao(alimento.getQuantidade()).equals(quantidadeNova));

        if (jaExiste) {
            throw new AlimentoDuplicadoException(
                    "Esta refeição já tem \"" + novoAlimento.getNome() + "\" (" + novoAlimento.getQuantidade()
                            + ") registrado.");
        }
    }

    private String normalizarParaComparacao(String valor) {
        return valor == null ? "" : valor.trim().toLowerCase();
    }

    /**
     * Atualiza um alimento já existente dentro de uma refeição.
     */
    @Transactional
    public Alimento atualizarAlimento(Long idRefeicao, Long idAlimento, Alimento alimentoAtualizado, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorIdEUsuario(idRefeicao, usuarioAutenticado);

        Alimento alimentoExistente = refeicao.getAlimentos().stream()
                .filter(alimento -> alimento.getId().equals(idAlimento))
                .findFirst()
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Alimento não encontrado com ID: " + idAlimento + " na Refeição: " + idRefeicao));

        alimentoExistente.setNome(alimentoAtualizado.getNome());
        alimentoExistente.setQuantidade(alimentoAtualizado.getQuantidade());
        alimentoExistente.setCalorias(alimentoAtualizado.getCalorias());
        alimentoExistente.setCarboidratos(alimentoAtualizado.getCarboidratos());
        alimentoExistente.setProteinas(alimentoAtualizado.getProteinas());
        alimentoExistente.setGorduras(alimentoAtualizado.getGorduras());

        refeicaoRepository.save(refeicao);
        return alimentoExistente;
    }

    /**
     * Remove um alimento de uma refeição existente.
     */
    @Transactional
    public Refeicao removerAlimento(Long idRefeicao, Long idAlimento, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorIdEUsuario(idRefeicao, usuarioAutenticado);

        boolean removido = refeicao.getAlimentos()
                .removeIf(alimento -> alimento.getId().equals(idAlimento));

        if (!removido) {
            throw new RecursoNaoEncontradoException(
                    "Alimento não encontrado com ID: " + idAlimento + " na Refeição: " + idRefeicao);
        }

        return refeicaoRepository.save(refeicao);
    }

    // ==========================================
    // --- INTELIGÊNCIA ARTIFICIAL (GEMINI) ---
    // ==========================================

    /**
     * Analisa a foto de um prato usando o GeminiVisionService e converte os DTOs em Entidades Alimento.
     */
    public List<Alimento> analisarFotoPrato(MultipartFile foto, Usuario usuarioLogado) {
        if (foto == null || foto.isEmpty()) {
            throw new IllegalArgumentException("A foto do prato não pode ser vazia.");
        }

        // 1. Envia a imagem para a API Gemini Vision
        List<AlimentoAnaliseDTO> dtosIdentificados = geminiVisionService.analisarFotoPrato(foto);

        // 2. Mapeia a resposta da IA para objetos da Entidade Alimento.
        // `AlimentoAnaliseDTO` traz tudo como Double (contrato com o JSON do
        // Gemini), mas a entidade usa Integer para calorias e BigDecimal para
        // os macros — conversão explícita evita o "incompatible types" que
        // travava a compilação e mantém a mesma precisão usada no resto do
        // fluxo de Alimento (ver `AlimentoResponseDTO.fromEntity`, que faz o
        // caminho inverso).
        return dtosIdentificados.stream().map(dto -> {
            Alimento alimento = new Alimento();
            alimento.setNome(dto.nome());
            alimento.setQuantidade(dto.quantidade());
            alimento.setCalorias(dto.calorias() != null ? dto.calorias().intValue() : 0);
            alimento.setProteinas(paraBigDecimal(dto.proteina()));
            alimento.setCarboidratos(paraBigDecimal(dto.carboidratos()));
            alimento.setGorduras(paraBigDecimal(dto.gordura()));
            return alimento;
        }).toList();
    }

    private BigDecimal paraBigDecimal(Double valor) {
        return valor != null ? BigDecimal.valueOf(valor) : BigDecimal.ZERO;
    }

    // ==========================================
    // --- MÉTODOS AUXILIARES ---
    // ==========================================

    private void validarProprietario(Refeicao refeicao, Usuario usuarioAutenticado) {
        Long idDono = refeicao.getUsuario() != null ? refeicao.getUsuario().getId() : null;

        if (idDono == null || !idDono.equals(usuarioAutenticado.getId())) {
            throw new AcessoNegadoException("Esta refeição não pertence ao usuário autenticado.");
        }
    }

    private void vincularUsuario(Refeicao refeicao) {
        if (refeicao.getUsuario() != null && refeicao.getUsuario().getId() != null) {
            Long usuarioId = refeicao.getUsuario().getId();
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado com ID: " + usuarioId));
            refeicao.setUsuario(usuario);
        }
    }
}