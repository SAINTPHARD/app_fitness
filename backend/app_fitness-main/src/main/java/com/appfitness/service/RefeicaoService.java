package com.appfitness.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.appfitness.dto.AlimentoAnaliseDTO;
import com.appfitness.event.ItensRefeicaoAtualizadosEvent;
import com.appfitness.exception.AcessoNegadoException;
import com.appfitness.exception.AlimentoDuplicadoException;
import com.appfitness.exception.RecursoNaoEncontradoException;
import com.appfitness.exception.RefeicaoDuplicadaException;
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

        // CORREÇÃO (auditoria QA #2): antes não havia nenhuma validação
        // contra duas refeições com o mesmo nome no mesmo dia para o mesmo
        // usuário — um duplo clique em "salvar" (ou uma corrida de rede)
        // criava dois "Café da manhã" no mesmo dia, e cada tela que somava
        // totais via um subconjunto diferente das duas causava divergência
        // de calorias entre elas. Este pré-check cobre o caso comum; a
        // constraint única no banco (`uk_refeicao_usuario_data_nome`, ver
        // `@Table` em `Refeicao`) cobre a corrida real entre duas
        // requisições simultâneas que passariam pelos dois pré-checks antes
        // de qualquer uma commitar.
        if (refeicao.getUsuario() != null && refeicao.getDataRefeicao() != null
                && refeicaoRepository.existeComMesmoNomeEData(
                        refeicao.getUsuario().getId(), refeicao.getDataRefeicao(), refeicao.getNomeRefeicao())) {
            throw new RefeicaoDuplicadaException(
                    "Já existe uma refeição \"" + refeicao.getNomeRefeicao() + "\" registrada neste dia.");
        }

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
     *
     * CORREÇÃO (auditoria QA #3): editar só a quantidade (ex: 180g → 90g)
     * sem recalcular kcal/macros corrompia os totais do dia — o Alimento
     * ficava com a quantidade nova mas os valores nutricionais da
     * quantidade antiga. Como `Alimento` guarda valores absolutos (não uma
     * taxa por 100g), a única forma segura de recalcular é comparando a
     * quantidade nova com a antiga: se o payload chegou com os MESMOS
     * kcal/macros já salvos (sinal de que o cliente só mudou o campo
     * quantidade, sem recalcular nada), escalamos proporcionalmente aqui —
     * centralizado no backend, a mesma regra vale para qualquer tela que
     * edite um Alimento, não só a Dieta. Se os macros vieram diferentes do
     * que já estava salvo, o cliente claramente já recalculou (ex: trocou de
     * alimento na busca) e usamos o valor enviado como está.
     */
    @Transactional
    public Alimento atualizarAlimento(Long idRefeicao, Long idAlimento, Alimento alimentoAtualizado, Usuario usuarioAutenticado) {
        Refeicao refeicao = buscarPorIdEUsuario(idRefeicao, usuarioAutenticado);

        Alimento alimentoExistente = refeicao.getAlimentos().stream()
                .filter(alimento -> alimento.getId().equals(idAlimento))
                .findFirst()
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Alimento não encontrado com ID: " + idAlimento + " na Refeição: " + idRefeicao));

        boolean somenteQuantidadeMudou = macrosIguais(alimentoExistente, alimentoAtualizado)
                && !normalizarParaComparacao(alimentoExistente.getQuantidade())
                        .equals(normalizarParaComparacao(alimentoAtualizado.getQuantidade()));

        alimentoExistente.setNome(alimentoAtualizado.getNome());

        if (somenteQuantidadeMudou) {
            aplicarQuantidadeComRecalculo(alimentoExistente, alimentoAtualizado.getQuantidade());
        } else {
            alimentoExistente.setQuantidade(alimentoAtualizado.getQuantidade());
            alimentoExistente.setCalorias(alimentoAtualizado.getCalorias());
            alimentoExistente.setCarboidratos(alimentoAtualizado.getCarboidratos());
            alimentoExistente.setProteinas(alimentoAtualizado.getProteinas());
            alimentoExistente.setGorduras(alimentoAtualizado.getGorduras());
        }

        refeicaoRepository.save(refeicao);
        return alimentoExistente;
    }

    private boolean macrosIguais(Alimento a, Alimento b) {
        return Objects.equals(a.getCalorias(), b.getCalorias())
                && comparavelIgual(a.getCarboidratos(), b.getCarboidratos())
                && comparavelIgual(a.getProteinas(), b.getProteinas())
                && comparavelIgual(a.getGorduras(), b.getGorduras());
    }

    private boolean comparavelIgual(BigDecimal a, BigDecimal b) {
        if (a == null || b == null) {
            return a == b;
        }
        return a.compareTo(b) == 0;
    }

    /**
     * Escala calorias/macros proporcionalmente à razão entre a quantidade
     * nova e a antiga. Se qualquer uma das duas não puder ser interpretada
     * como número (texto livre, ex: "a gosto"), não há base segura para
     * escalar — mantém os valores nutricionais como estavam e só troca o
     * texto da quantidade, em vez de arriscar um cálculo sem sentido.
     */
    private void aplicarQuantidadeComRecalculo(Alimento alimento, String novaQuantidade) {
        BigDecimal quantidadeAntiga = extrairNumero(alimento.getQuantidade());
        BigDecimal quantidadeNova = extrairNumero(novaQuantidade);

        alimento.setQuantidade(novaQuantidade);

        if (quantidadeAntiga == null || quantidadeNova == null || quantidadeAntiga.signum() == 0) {
            return;
        }

        BigDecimal razao = quantidadeNova.divide(quantidadeAntiga, 6, RoundingMode.HALF_UP);

        if (alimento.getCalorias() != null) {
            alimento.setCalorias(BigDecimal.valueOf(alimento.getCalorias())
                    .multiply(razao)
                    .setScale(0, RoundingMode.HALF_UP)
                    .intValue());
        }
        alimento.setProteinas(escalar(alimento.getProteinas(), razao));
        alimento.setCarboidratos(escalar(alimento.getCarboidratos(), razao));
        alimento.setGorduras(escalar(alimento.getGorduras(), razao));
    }

    private BigDecimal escalar(BigDecimal valor, BigDecimal razao) {
        return valor == null ? null : valor.multiply(razao).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Extrai o primeiro número (inteiro ou decimal) do início da string de
     * quantidade — cobre os formatos usados pelo frontend ("150g", "150",
     * "1.5kg", "2 un"). Retorna null se não houver número reconhecível.
     */
    private BigDecimal extrairNumero(String quantidade) {
        if (quantidade == null) {
            return null;
        }
        Matcher matcher = Pattern.compile("[0-9]+([.,][0-9]+)?").matcher(quantidade.trim());
        if (!matcher.find()) {
            return null;
        }
        try {
            return new BigDecimal(matcher.group().replace(',', '.'));
        } catch (NumberFormatException ex) {
            return null;
        }
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